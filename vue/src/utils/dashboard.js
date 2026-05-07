import API_BASE_URL from './config.js';
import echo from './echo.js';
import { charger_microcontroleur_local } from './microcontroleur.js';

function obtenirNomMicrocontroleur() {
    return charger_microcontroleur_local()?.nom ?? '';
}

async function chargerDashboard(options = {}) {
    const nomMicro = obtenirNomMicrocontroleur();
    const params = new URLSearchParams();

    if (nomMicro) params.set('microcontroleur', nomMicro);
    if (options.mesuresPage) params.set('mesures_page', String(options.mesuresPage));
    if (options.mesuresParPage) params.set('mesures_par_page', String(options.mesuresParPage));

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/dashboard${query}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? 'Impossible de charger le dashboard.');
    }

    return await response.json();
}

export function charger_dashboard_temps_reel(setDashboard, setErreur, setChargement, options = {}) {
    const nomMicro = obtenirNomMicrocontroleur();

    // 1. INIT localStorage
    const cache = localStorage.getItem('dashboard_data');
    if (cache) {
        try { setDashboard(JSON.parse(cache)); } catch { /* ignore */ }
    }

    // 2. INIT API
    chargerDashboard(options)
        .then(data => {
            setDashboard(data);
            setErreur(null);
            localStorage.setItem('dashboard_data', JSON.stringify(data));
        })
        .catch(error => setErreur(error.message))
        .finally(() => setChargement(false));

    if (!nomMicro) return () => {};

    // 3. WebSocket — tout événement capteur/actionneur/micro recharge le dashboard
    const canal = echo.private(`capteurs.${nomMicro}`);
    let rechargeEnCours = false;

    const recharger = () => {
        if (rechargeEnCours) return;
        rechargeEnCours = true;

        chargerDashboard(options)
            .then(data => {
                setDashboard(data);
                setErreur(null);
                localStorage.setItem('dashboard_data', JSON.stringify(data));
            })
            .catch(() => {})
            .finally(() => { rechargeEnCours = false; });
    };

    canal.listen('.NouvelleDonneeCapteur', recharger);
    canal.listen('.NouvelEtatActionneur', recharger);
    canal.listen('.NouvelEtatMicrocontroleur', recharger);

    return () => {
        canal.stopListening('.NouvelleDonneeCapteur', recharger);
        canal.stopListening('.NouvelEtatActionneur', recharger);
        canal.stopListening('.NouvelEtatMicrocontroleur', recharger);
    };
}

export async function charger_dashboard_page_mesures(mesuresPage, mesuresParPage = 18) {
    return await chargerDashboard({ mesuresPage, mesuresParPage });
}

export function formater_heure_dashboard(dateIso) {
    if (!dateIso) return 'Non disponible';

    return new Date(dateIso).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formater_date_dashboard(dateIso) {
    if (!dateIso) return 'Non disponible';

    return new Date(dateIso).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function libelle_etat_dashboard(etat) {
    if (etat === 'running') return 'Allumé';
    if (etat === 'defaillant') return 'Défaillant';
    return 'Éteint';
}

export function couleur_etat_dashboard(etat) {
    if (etat === 'running' || etat === 'online' || etat === 'OK') return 'vert';
    if (etat === 'defaillant' || etat === 'Bas' || etat === 'offline') return 'rouge';
    return 'orange';
}
