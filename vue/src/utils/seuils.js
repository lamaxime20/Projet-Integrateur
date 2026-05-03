import API_BASE_URL from './config.js';
import { charger_microcontroleur_local } from './microcontroleur.js';

const TYPE_MESURE_UUIDS = {
    temperature: '8f14e45f-ceea-4fbc-9b35-8df406b4a76c',
    humidite_sol: 'b7fa6a2d-b97d-40c2-aa19-7c26584bf08e',
    co2: 'c209b647-5a60-4933-9ae0-014b3a2cf44d',
    luminosite: 'd5fa5fea-7f70-414c-aaaf-71d0b96d1a0e'
};

const DEFAULT_SEUILS = [
    {
        id: '4c7b9f5a-1d12-4a4e-9b71-1c69b3f57f2d',
        type_mesure: TYPE_MESURE_UUIDS.temperature,
        nom: 'Température',
        code: 'temperature',
        unite: '°C',
        valeur_min: 18.0,
        valeur_max: 35.0,
        icone: 'fa-thermometer-half'
    },
    {
        id: '2f9e1f3b-8a79-44c0-b2e4-5a2c0c8d5f78',
        type_mesure: TYPE_MESURE_UUIDS.humidite_sol,
        nom: 'Humidité du sol',
        code: 'humidite_sol',
        unite: '%',
        valeur_min: 30.0,
        valeur_max: 70.0,
        icone: 'fa-tint'
    },
    {
        id: '1a7c5d96-3d38-4f1c-b50c-1e3fa7a7be92',
        type_mesure: TYPE_MESURE_UUIDS.co2,
        nom: 'Qualité de l’air (CO2)',
        code: 'co2',
        unite: '%',
        valeur_min: 20.0,
        valeur_max: 70.0,
        icone: 'fa-wind'
    },
    {
        id: '5b28f2c1-9f04-4510-9554-0c9f7a74e2b3',
        type_mesure: TYPE_MESURE_UUIDS.luminosite,
        nom: 'Luminosité',
        code: 'luminosite',
        unite: '%',
        valeur_min: 20.0,
        valeur_max: 80.0,
        icone: 'fa-sun'
    }
];

const seuilsCache = new Map();
const historiqueCache = new Map();

function initialiserDonneesSeuils(microcontroleur_id) {
    if (!seuilsCache.has(microcontroleur_id)) {
        seuilsCache.set(microcontroleur_id, DEFAULT_SEUILS.map(seuil => ({ ...seuil })));
        historiqueCache.set(microcontroleur_id, []);
    }
    return seuilsCache.get(microcontroleur_id);
}

/**
 * Simule le chargement des seuils actuels pour un microcontroleur.
 * API cible : GET /api/seuils?microcontroleur_id={id}
 * Retourne : [{ id, type_mesure, valeur_min, valeur_max, nom, code, unite, icone }]
 */
export async function charger_seuils_actuels(microcontroleur_id) {
    const controllerId = charger_microcontroleur_local();

    console.log('Requête API GET /api/seuils', { microcontroleur_id: controllerId });
    await new Promise(resolve => setTimeout(resolve, 500));

    return initialiserDonneesSeuils(controllerId);
}

/**
 * Simule la mise à jour d’un seuil existant.
 * API cible : POST /api/seuils
 * Body : { seuil_id, valeur_min, valeur_max }
 */
export async function enregistrer_nouveau_seuil(donnees) {
    const { seuil_id, valeur_min, valeur_max } = donnees;

    console.log('Requête API POST /api/seuils', donnees);
    await new Promise(resolve => setTimeout(resolve, 800));

    const min = parseFloat(valeur_min);
    const max = parseFloat(valeur_max);

    if (Number.isNaN(min) || Number.isNaN(max)) {
        throw new Error('Les valeurs doivent être numériques.');
    }

    if (min >= max) {
        throw new Error('La valeur minimale doit être inférieure à la valeur maximale.');
    }

    const seuilTrouve = Array.from(seuilsCache.values())
        .flat()
        .find(seuil => seuil.id === seuil_id);

    if (!seuilTrouve) {
        throw new Error('Seuil introuvable.');
    }

    seuilTrouve.valeur_min = min;
    seuilTrouve.valeur_max = max;

    const microcontroleur_id = Array.from(seuilsCache.entries())
        .find(([, seuils]) => seuils.some(seuil => seuil.id === seuil_id))?.[0];

    if (microcontroleur_id) {
        const historique = historiqueCache.get(microcontroleur_id) || [];
        historique.unshift({
            id: `${seuil_id}-${Date.now()}`,
            seuil_id,
            type_mesure: seuilTrouve.type_mesure,
            valeur_min: min,
            valeur_max: max,
            date: new Date().toISOString()
        });
        historiqueCache.set(microcontroleur_id, historique);
    }

    return {
        success: true,
        message: 'Seuil mis à jour avec succès.',
        seuil: { ...seuilTrouve }
    };
}
