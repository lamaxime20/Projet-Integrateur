import API_BASE_URL from './config.js';
import { charger_microcontroleur_local } from './microcontroleur.js';

const ERREUR_GENERIQUE = 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.';

function obtenirNomMicrocontroleur(microcontroleur) {
    if (typeof microcontroleur === 'string') return microcontroleur;
    if (microcontroleur?.nom) return microcontroleur.nom;

    const microLocal = charger_microcontroleur_local();
    return microLocal?.nom ?? '';
}

function construireParamsMicrocontroleur(microcontroleur) {
    const nom = obtenirNomMicrocontroleur(microcontroleur);
    return nom ? `?microcontroleur=${encodeURIComponent(nom)}` : '';
}

async function lireReponseApi(response) {
    const contentType = response.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json') ? await response.json() : {};

    if (!response.ok) {
        const validationMessage = data.errors
            ? Object.values(data.errors).flat().join(' ')
            : null;

        throw new Error(validationMessage || data.message || ERREUR_GENERIQUE);
    }

    return data;
}

export function seuil_est_valide(valeurMin, valeurMax) {
    const min = Number.parseFloat(valeurMin);
    const max = Number.parseFloat(valeurMax);

    return Number.isFinite(min) && Number.isFinite(max) && min < max;
}

export async function charger_seuils_actuels(microcontroleur) {
    const params = construireParamsMicrocontroleur(microcontroleur);
    const response = await fetch(`${API_BASE_URL}/seuils${params}`, {
        method: 'GET',
        credentials: 'include',
    });

    return await lireReponseApi(response);
}

export async function enregistrer_nouveau_seuil(donnees) {
    const valeurMin = Number.parseFloat(donnees.valeur_min);
    const valeurMax = Number.parseFloat(donnees.valeur_max);

    if (!seuil_est_valide(valeurMin, valeurMax)) {
        throw new Error('La valeur minimale doit être inférieure à la valeur maximale.');
    }

    const response = await fetch(`${API_BASE_URL}/seuils`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            seuil_id: donnees.seuil_id,
            valeur_min: valeurMin,
            valeur_max: valeurMax,
        }),
    });

    return await lireReponseApi(response);
}
