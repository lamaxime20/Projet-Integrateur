import API_BASE_URL from './config.js';

/**
 * Simule le chargement des seuils actuels pour un microcontrôleur.
 * API cible : GET /api/seuils?microcontroleur_id={id}
 */
export async function charger_seuils_actuels(microcontroleur_id) {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    // Données simulées basées sur agriculture_v1.ino et bd.sql
    return [
        {
            id: "g1",
            nom: "Température",
            code: "temperature",
            valeur_min: 18.0,
            valeur_max: 35.0,
            unite: "°C",
            icone: "fa-thermometer-half"
        },
        {
            id: "g2",
            nom: "Humidité du sol",
            code: "humidite_sol",
            valeur_min: 30.0,
            valeur_max: 70.0,
            unite: "%",
            icone: "fa-tint"
        },
        {
            id: "g3",
            nom: "Qualité de l'air (CO2)",
            code: "co2",
            valeur_min: 20.0,
            valeur_max: 70.0, // Valeur relative 0-100 selon l'ino
            unite: "%",
            icone: "fa-wind"
        },
        {
            id: "g4",
            nom: "Luminosité",
            code: "luminosite",
            valeur_min: 20.0,
            valeur_max: 80.0,
            unite: "%",
            icone: "fa-sun"
        }
    ];
}

/**
 * Simule l'enregistrement d'un nouveau seuil.
 * API cible : POST /api/seuils
 * Body : { microcontroleur_id, grandeur_id, valeur_min, valeur_max }
 */
export async function enregistrer_nouveau_seuil(donnees) {
    console.log("Envoi à l'API :", donnees);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Le backend doit valider que valeur_min < valeur_max (seuils_check001 dans bd.sql)
    if (parseFloat(donnees.valeur_min) >= parseFloat(donnees.valeur_max)) {
        throw new Error("La valeur minimale doit être inférieure à la valeur maximale.");
    }

    return { success: true, message: "Seuil mis à jour avec succès." };
}

/**
 * Simule la récupération de l'historique des modifications.
 * API cible : GET /api/seuils/historique?microcontroleur_id={id}
 */
export async function charger_historique_seuils(microcontroleur_id) {
    await new Promise(resolve => setTimeout(resolve, 400));

    return [
        {
            id: 1,
            date: "2024-05-20 14:30",
            capteur: "Température",
            ancien_min: 20,
            ancien_max: 30,
            nouveau_min: 18,
            nouveau_max: 35,
            auteur: "Jean Dupont"
        },
        {
            id: 2,
            date: "2024-05-18 09:15",
            capteur: "Humidité du sol",
            ancien_min: 40,
            ancien_max: 60,
            nouveau_min: 30,
            nouveau_max: 70,
            auteur: "Système (Auto)"
        }
    ];
}