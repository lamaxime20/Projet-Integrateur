import API_BASE_URL from './config.js';

const LOCAL_INFOS_MICROCONTROLEUR_ENREGISTREMENT = "infos_microcontroleur_enregistrement";
const LOCAL_ERREUR_ENREGISTREMENT = "erreur_enregistrement";

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
