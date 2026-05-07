import API_BASE_URL from './config.js';
import echo from './echo.js';
import { debutJourUTC, finJourUTC } from './date.js';

const UNE_HEURE_EN_MINUTES = 60;
const DOUZE_HEURES_EN_MINUTES = 12 * UNE_HEURE_EN_MINUTES;

function ajouterMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60 * 1000);
}

function creerPeriode(debut, dureeEnMinutes, etat) {
    return {
        etat,
        debut: debut.toISOString(),
        fin: ajouterMinutes(debut, dureeEnMinutes).toISOString(),
    };
}

function obtenirNomMicrocontroleur() {
    try {
        const micro = JSON.parse(localStorage.getItem('microcontroleur_actuel'));
        return micro?.nom ?? null;
    } catch {
        return null;
    }
}

async function getApi(path) {
    const nomMicro = obtenirNomMicrocontroleur();
    const separator = path.includes("?") ? "&" : "?";
    const params = nomMicro ? `${separator}microcontroleur=${encodeURIComponent(nomMicro)}` : "";
    const response = await fetch(`${API_BASE_URL}${path}${params}`, {
        credentials: 'include',
    });

    if (!response.ok) throw new Error("Erreur API");
    return await response.json();
}

function obtenirCanalPrive() {
    const nom = obtenirNomMicrocontroleur();
    if (!nom) return null;
    return echo.private(`capteurs.${nom}`);
}

// ============================================================
//  MICROCONTRÔLEUR
// ============================================================

export function charger_historique_microcontroleur(setHistorique) {
    // 1. INIT localStorage
    const cache = localStorage.getItem('historique_microcontroleur');
    if (cache) { try { setHistorique(JSON.parse(cache)); } catch { /* ignore */ } }

    const charger = async () => {
        try {
            const data = await getApi('/microcontroleur/historique?fenetre=12h');
            setHistorique(data);
            localStorage.setItem('historique_microcontroleur', JSON.stringify(data));
        } catch {
            const dateActuelle = new Date();
            const debutFenetre = ajouterMinutes(dateActuelle, -DOUZE_HEURES_EN_MINUTES);
            const scenario = [
                { etat: "running", duree: 210 },
                { etat: "stopped", duree: 45 },
                { etat: "running", duree: 315 },
                { etat: "stopped", duree: 30 },
                { etat: "running", duree: 120 },
            ];
            let curseur = debutFenetre;
            const data = scenario.map((p) => {
                const periode = creerPeriode(curseur, p.duree, p.etat);
                curseur = new Date(periode.fin);
                return periode;
            });
            setHistorique(data);
        }
    };

    // 2. INIT API
    charger();

    // 3. WebSocket — changement d'état du micro recharge l'historique
    const canal = obtenirCanalPrive();
    if (!canal) return () => {};

    const callback = () => charger();
    canal.listen('.NouvelEtatMicrocontroleur', callback);

    return () => canal.stopListening('.NouvelEtatMicrocontroleur', callback);
}

// ============================================================
//  CAPTEURS — MOYENNES 7 JOURS
// ============================================================

export function charger_moyennes_capteurs_7j(setMoyennes) {
    const cache = localStorage.getItem('moyennes_capteurs_7j');
    if (cache) { try { setMoyennes(JSON.parse(cache)); } catch { /* ignore */ } }

    const charger = async () => {
        try {
            const data = await getApi('/capteurs/moyennes?periode=7j');
            setMoyennes(data);
            localStorage.setItem('moyennes_capteurs_7j', JSON.stringify(data));
        } catch {
            setMoyennes({
                temperature: { valeur: 24.3, unite: "°C" },
                humiditeSol: { valeur: 48.7, unite: "%" },
                luminosite: { valeur: 62.1, unite: "%" },
                co2: { valeur: 38.4, unite: "ppm" },
            });
        }
    };

    charger();

    // Moyennes agrégées : se rafraîchit à chaque nouvelle mesure
    const canal = obtenirCanalPrive();
    if (!canal) return () => {};

    const callback = () => charger();
    canal.listen('.NouvelleDonneeCapteur', callback);

    return () => canal.stopListening('.NouvelleDonneeCapteur', callback);
}

// ============================================================
//  CAPTEURS — ÉTAT ACTUEL
// ============================================================

const ETATS_CAPTEURS_SIMULES = {
    co2: "running",
    "humidite-sol": "running",
    luminosite: "defaillant",
    "niveau-eau": "running",
    temperature: "running",
};

export function charger_etat_capteur(capteur, setEtat) {
    const cache = localStorage.getItem(`etat_capteur_${capteur}`);
    if (cache) { try { setEtat(JSON.parse(cache)); } catch { /* ignore */ } }

    getApi(`/capteurs/${capteur}/etat`)
        .then(data => {
            setEtat(data.etat);
            localStorage.setItem(`etat_capteur_${capteur}`, JSON.stringify(data.etat));
        })
        .catch(() => setEtat(ETATS_CAPTEURS_SIMULES[capteur] ?? "stopped"));

    const canal = obtenirCanalPrive();
    if (!canal) return () => {};

    const callback = (e) => {
        if (e.capteur !== capteur) return;
        setEtat(e.etat);
        localStorage.setItem(`etat_capteur_${capteur}`, JSON.stringify(e.etat));
    };

    canal.listen('.NouvelEtatCapteur', callback);

    return () => canal.stopListening('.NouvelEtatCapteur', callback);
}

// ============================================================
//  ACTIONNEURS — TEMPS D'ACTIVATION TOTAL 7 JOURS
// ============================================================

export function charger_temps_activation_actionneurs_7j(setTemps) {
    const cache = localStorage.getItem('temps_activation_actionneurs_7j');
    if (cache) { try { setTemps(JSON.parse(cache)); } catch { /* ignore */ } }

    const charger = async () => {
        try {
            const data = await getApi('/actionneurs/temps-activation?periode=7j');
            setTemps(data);
            localStorage.setItem('temps_activation_actionneurs_7j', JSON.stringify(data));
        } catch {
            setTemps({ ventilateur: 1470, pompe: 840, ampoule: 2940, servoMoteur: 420 });
        }
    };

    charger();

    const canal = obtenirCanalPrive();
    if (!canal) return () => {};

    const callback = () => charger();
    canal.listen('.NouvelEtatActionneur', callback);

    return () => canal.stopListening('.NouvelEtatActionneur', callback);
}

// ============================================================
//  RAPPORT — HISTORIQUE CAPTEUR
// ============================================================

const SCENARIOS_CAPTEURS = {
    co2: [
        { etat: "running", duree: 180 },
        { etat: "stopped", duree: 30 },
        { etat: "running", duree: 240 },
        { etat: "defaillant", duree: 25 },
        { etat: "running", duree: 245 },
    ],
    "humidite-sol": [
        { etat: "running", duree: 300 },
        { etat: "defaillant", duree: 20 },
        { etat: "running", duree: 280 },
        { etat: "stopped", duree: 60 },
        { etat: "running", duree: 60 },
    ],
    luminosite: [
        { etat: "running", duree: 200 },
        { etat: "stopped", duree: 45 },
        { etat: "defaillant", duree: 60 },
        { etat: "running", duree: 415 },
    ],
    "niveau-eau": [
        { etat: "running", duree: 480 },
        { etat: "stopped", duree: 120 },
        { etat: "running", duree: 120 },
    ],
    temperature: [
        { etat: "running", duree: 350 },
        { etat: "stopped", duree: 40 },
        { etat: "running", duree: 190 },
        { etat: "defaillant", duree: 20 },
        { etat: "running", duree: 120 },
    ],
};

export function charger_historique_capteur(capteur, setHistorique) {
    const cache = localStorage.getItem(`historique_capteur_${capteur}`);
    if (cache) { try { setHistorique(JSON.parse(cache)); } catch { /* ignore */ } }

    const charger = async () => {
        try {
            const data = await getApi(`/capteurs/${capteur}/historique?fenetre=12h`);
            setHistorique(data);
            localStorage.setItem(`historique_capteur_${capteur}`, JSON.stringify(data));
        } catch {
            const debutFenetre = ajouterMinutes(new Date(), -DOUZE_HEURES_EN_MINUTES);
            const scenario = SCENARIOS_CAPTEURS[capteur] ?? SCENARIOS_CAPTEURS.temperature;
            let curseur = debutFenetre;
            const data = scenario.map((p) => {
                const periode = creerPeriode(curseur, p.duree, p.etat);
                curseur = new Date(periode.fin);
                return periode;
            });
            setHistorique(data);
        }
    };

    charger();

    const canal = obtenirCanalPrive();
    if (!canal) return () => {};

    const callback = (e) => {
        if (e.capteur !== capteur) return;
        charger();
    };

    canal.listen('.NouvelEtatCapteur', callback);

    return () => canal.stopListening('.NouvelEtatCapteur', callback);
}

// ============================================================
//  RAPPORT — STATISTIQUES CAPTEUR (max, min, moy)
// ============================================================

const STATS_CAPTEURS_SIMULES = {
    co2: { max: 78.5, min: 18.2, moy: 38.4, unite: "ppm" },
    "humidite-sol": { max: 82.3, min: 24.1, moy: 48.7, unite: "%" },
    luminosite: { max: 95.0, min: 5.2, moy: 62.1, unite: "%" },
    "niveau-eau": { max: null, min: null, moy: null, unite: "digital" },
    temperature: { max: 31.8, min: 18.5, moy: 24.3, unite: "°C" },
};

export function charger_stats_capteur(capteur, setStats) {
    const cache = localStorage.getItem(`stats_capteur_${capteur}`);
    if (cache) { try { setStats(JSON.parse(cache)); } catch { /* ignore */ } }

    const charger = async () => {
        try {
            const data = await getApi(`/capteurs/${capteur}/stats?periode=7j`);
            setStats(data);
            localStorage.setItem(`stats_capteur_${capteur}`, JSON.stringify(data));
        } catch {
            setStats(STATS_CAPTEURS_SIMULES[capteur] ?? { max: 0, min: 0, moy: 0, unite: "" });
        }
    };

    charger();

    const canal = obtenirCanalPrive();
    if (!canal) return () => {};

    const callback = (e) => {
        if (e.capteur !== capteur) return;
        charger();
    };

    canal.listen('.NouvelleDonneeCapteur', callback);

    return () => canal.stopListening('.NouvelleDonneeCapteur', callback);
}

export async function charger_mesures_capteur(capteur, dateDebut, dateFin) {
    const debutUTC = debutJourUTC(dateDebut) ?? dateDebut;
    const finUTC   = finJourUTC(dateFin)   ?? dateFin;

    try {
        const data = await getApi(`/capteurs/${capteur}/mesures?date_debut=${encodeURIComponent(debutUTC)}&date_fin=${encodeURIComponent(finUTC)}`);
        localStorage.setItem(`mesures_capteur_${capteur}_${dateDebut}_${dateFin}`, JSON.stringify(data));
        return data;
    } catch {
        const maintenant = new Date();
        const points = Array.from({ length: 12 }, (_, index) => {
            const date = ajouterMinutes(maintenant, -(11 - index) * 120);
            const bases = {
                temperature: 22,
                "humidite-sol": 46,
                luminosite: 58,
                co2: 40,
                "niveau-eau": 1,
            };

            return {
                valeur: capteur === "niveau-eau" ? (index % 4 === 0 ? 0 : 1) : bases[capteur] + Math.round(Math.sin(index / 2) * 8),
                date_arrivee: date.toISOString(),
            };
        });

        const config = {
            temperature: { label: "Température de l'air", cle: "temperature", unite: "°C" },
            "humidite-sol": { label: "Humidité du sol", cle: "humidite_sol", unite: "%" },
            luminosite: { label: "Luminosité", cle: "luminosite", unite: "%" },
            co2: { label: "Qualité de l'air", cle: "co2", unite: "ppm" },
            "niveau-eau": { label: "Niveau d'eau", cle: "niveau_eau", unite: "digital" },
        };

        const data = {
            capteur,
            ...(config[capteur] ?? config.temperature),
            points,
        };
        return data;
    }
}

// ============================================================
//  RAPPORT — HISTORIQUE ACTIONNEUR
// ============================================================

const SCENARIOS_ACTIONNEURS = {
    ventilateur: [
        { etat: "running", duree: 95 },
        { etat: "stopped", duree: 125 },
        { etat: "defaillant", duree: 40 },
        { etat: "stopped", duree: 80 },
        { etat: "running", duree: 135 },
        { etat: "defaillant", duree: 55 },
        { etat: "stopped", duree: 100 },
        { etat: "running", duree: 90 },
    ],
    pompe: [
        { etat: "stopped", duree: 75 },
        { etat: "running", duree: 45 },
        { etat: "stopped", duree: 160 },
        { etat: "running", duree: 85 },
        { etat: "defaillant", duree: 35 },
        { etat: "stopped", duree: 210 },
        { etat: "running", duree: 110 },
    ],
    ampoule: [
        { etat: "running", duree: 180 },
        { etat: "stopped", duree: 95 },
        { etat: "running", duree: 140 },
        { etat: "defaillant", duree: 25 },
        { etat: "stopped", duree: 160 },
        { etat: "running", duree: 120 },
    ],
    "servo-moteur": [
        { etat: "stopped", duree: 220 },
        { etat: "running", duree: 30 },
        { etat: "stopped", duree: 250 },
        { etat: "defaillant", duree: 20 },
        { etat: "running", duree: 40 },
        { etat: "stopped", duree: 160 },
    ],
};

export function charger_historique_actionneur_rapport(actionneur, setHistorique) {
    const cache = localStorage.getItem(`historique_actionneur_${actionneur}`);
    if (cache) { try { setHistorique(JSON.parse(cache)); } catch { /* ignore */ } }

    const charger = async () => {
        try {
            const data = await getApi(`/actionneurs/${actionneur}/historique?fenetre=12h`);
            setHistorique(data);
            localStorage.setItem(`historique_actionneur_${actionneur}`, JSON.stringify(data));
        } catch {
            const debutFenetre = ajouterMinutes(new Date(), -DOUZE_HEURES_EN_MINUTES);
            const scenario = SCENARIOS_ACTIONNEURS[actionneur] ?? SCENARIOS_ACTIONNEURS.ventilateur;
            let curseur = debutFenetre;
            const data = scenario.map((p) => {
                const periode = creerPeriode(curseur, p.duree, p.etat);
                curseur = new Date(periode.fin);
                return periode;
            });
            setHistorique(data);
        }
    };

    charger();

    const canal = obtenirCanalPrive();
    if (!canal) return () => {};

    const callback = (e) => {
        if (e.actionneur !== actionneur) return;
        charger();
    };

    canal.listen('.NouvelEtatActionneur', callback);

    return () => canal.stopListening('.NouvelEtatActionneur', callback);
}

// ============================================================
//  RAPPORT — INSTRUCTIONS ACTIONNEUR
// ============================================================

export function charger_instructions_actionneur(actionneur, setInstructions) {
    const cache = localStorage.getItem(`instructions_actionneur_${actionneur}`);
    if (cache) { try { setInstructions(JSON.parse(cache)); } catch { /* ignore */ } }

    const charger = async () => {
        try {
            const data = await getApi(`/actionneurs/${actionneur}/instructions`);
            setInstructions(data);
            localStorage.setItem(`instructions_actionneur_${actionneur}`, JSON.stringify(data));
        } catch {
            const now = new Date();
            const etats = ["termine", "en_cours", "en_attente", "annule", "termine", "termine"];
            const actions = ["allumer", "arreter"];
            const durees = [15, 30, 45, 60, 90, 120];
            const data = Array.from({ length: 12 }, (_, i) => ({
                id: `instr_${i + 1}`,
                action: actions[i % 2],
                duree: durees[i % durees.length],
                statut: etats[i % etats.length],
                date_arrivee: new Date(now.getTime() - i * 3.5 * 60 * 60 * 1000).toISOString(),
                actionneur,
            }));
            setInstructions(data);
        }
    };

    charger();

    // Pas d'abonnement WebSocket pour les instructions — rechargé manuellement après action
    return () => {};
}

// ============================================================
//  RAPPORT — GRANDEURS PHYSIQUES D'UN ACTIONNEUR
// ============================================================

export function charger_grandeurs_actionneur(actionneur, setGrandeurs) {
    const cache = localStorage.getItem(`grandeurs_actionneur_${actionneur}`);
    if (cache) { try { setGrandeurs(JSON.parse(cache)); } catch { /* ignore */ } }

    const charger = async () => {
        try {
            const data = await getApi(`/actionneurs/${actionneur}/grandeurs`);
            setGrandeurs(data);
            localStorage.setItem(`grandeurs_actionneur_${actionneur}`, JSON.stringify(data));
        } catch {
            const simulations = {
                ventilateur: { temperature: 24.3, humidite_air: 58 },
                pompe: { humidite_sol: 42, niveau_eau: "OK" },
                ampoule: { luminosite: 62 },
                "servo-moteur": { co2: 45 },
            };
            setGrandeurs(simulations[actionneur] ?? {});
        }
    };

    charger();

    // Grandeurs = valeurs actuelles des capteurs associés → se rafraîchit à chaque mesure
    const canal = obtenirCanalPrive();
    if (!canal) return () => {};

    const callback = () => charger();
    canal.listen('.NouvelleDonneeCapteur', callback);

    return () => canal.stopListening('.NouvelleDonneeCapteur', callback);
}
