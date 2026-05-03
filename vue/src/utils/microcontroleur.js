import API_BASE_URL from './config.js';

const LOCAL_INFOS_MICROCONTROLEUR_ENREGISTREMENT = "infos_microcontroleur_enregistrement";
const LOCAL_ERREUR_ENREGISTREMENT = "erreur_enregistrement";
const INTERVALLE_TEMPS_REEL_MS = 20000;

export function enregistrer_microcontroleur_local(microcontroleur) {
    localStorage.setItem("microcontroleur_actuel", JSON.stringify(microcontroleur));
}

export function charger_microcontroleur_local() {
    return JSON.parse(localStorage.getItem("microcontroleur_actuel"));
}

export function supprimer_microcontroleur_local() {
    localStorage.removeItem("microcontroleur_actuel");
}

export function enregistrer_infos_microcontroleur_enregistrement(infos) {
    localStorage.setItem(LOCAL_INFOS_MICROCONTROLEUR_ENREGISTREMENT, JSON.stringify(infos));
}

export function charger_infos_microcontroleur_enregistrement() {
    return JSON.parse(localStorage.getItem(LOCAL_INFOS_MICROCONTROLEUR_ENREGISTREMENT));
}

export function supprimer_infos_microcontroleur_enregistrement() {
    localStorage.removeItem(LOCAL_INFOS_MICROCONTROLEUR_ENREGISTREMENT);
}

export function enregistrer_erreur_enregistrement(erreur) {
    localStorage.setItem(LOCAL_ERREUR_ENREGISTREMENT, JSON.stringify(erreur));
}

export function charger_erreur_enregistrement() {
    return JSON.parse(localStorage.getItem(LOCAL_ERREUR_ENREGISTREMENT));
}

export function supprimer_erreur_enregistrement() {
    localStorage.removeItem(LOCAL_ERREUR_ENREGISTREMENT);
}

export async function enregistrer_microcontroleur_user(donnees_microcontroleur) {
    const response = await fetch(`${API_BASE_URL}/microcontroleurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(donnees_microcontroleur),
    });

    return await response.json();
}

export async function charger_liste_microcontroleurs_user() {
    const response = await fetch(`${API_BASE_URL}/microcontroleurs`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        return [];
    }

    return await response.json();
}

export async function charger_microcontroleur_user(nom_microcontroleur) {
    const response = await fetch(`${API_BASE_URL}/microcontroleurs/${encodeURIComponent(nom_microcontroleur)}`, {
        method: 'GET',
        credentials: 'include',
    });

    const result = await response.json();

    if (result.success) {
        enregistrer_microcontroleur_local(result.microcontroleur);
    }

    return result.success;
}

export function changer_microcontroleur_user() {
    supprimer_microcontroleur_local();
    window.location.reload();
}

export function charger_etat_microcontroleur_temps_reel(setMicrocontroleur) {
    const charger = async () => {
        const microLocal = charger_microcontroleur_local();
        if (!microLocal?.nom) return;

        try {
            const response = await fetch(`${API_BASE_URL}/microcontroleur/etat?microcontroleur=${encodeURIComponent(microLocal.nom)}`, {
                credentials: 'include',
            });

            if (!response.ok) throw new Error("Erreur API");
            const data = await response.json();
            const microMisAJour = { ...microLocal, allume: Boolean(data.allume) };
            enregistrer_microcontroleur_local(microMisAJour);
            setMicrocontroleur(microMisAJour);
        } catch {
            setMicrocontroleur(microLocal);
        }
    };

    charger();
    return setInterval(charger, INTERVALLE_TEMPS_REEL_MS);
}
