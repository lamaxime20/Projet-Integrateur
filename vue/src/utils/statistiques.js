import API_BASE_URL from './config.js';
import { debutJourUTC, finJourUTC } from './date.js';

const UNE_HEURE_EN_MINUTES = 60;
const DOUZE_HEURES_EN_MINUTES = 12 * UNE_HEURE_EN_MINUTES;
const INTERVALLE_TEMPS_REEL_MS = 20000;

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

function lancerChargementTempsReel(charger) {
    charger();
    return setInterval(charger, INTERVALLE_TEMPS_REEL_MS);
}

// ============================================================
//  MICROCONTRÔLEUR
// ============================================================

export function charger_historique_microcontroleur(setHistorique) {
    return lancerChargementTempsReel(async () => {
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
    });
}

// ============================================================
//  CAPTEURS — MOYENNES 7 JOURS
// ============================================================

export function charger_moyennes_capteurs_7j(setMoyennes) {
    return lancerChargementTempsReel(async () => {
        try {
            const data = await getApi('/capteurs/moyennes?periode=7j');
            setMoyennes(data);
            localStorage.setItem('moyennes_capteurs_7j', JSON.stringify(data));
        } catch {
            const data = {
                temperature: { valeur: 24.3, unite: "°C" },
                humiditeSol: { valeur: 48.7, unite: "%" },
                luminosite: { valeur: 62.1, unite: "%" },
                co2: { valeur: 38.4, unite: "ppm" },
            };
            setMoyennes(data);
        }
    });
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
    return lancerChargementTempsReel(async () => {
        try {
            const data = await getApi(`/capteurs/${capteur}/etat`);
            setEtat(data.etat);
            localStorage.setItem(`etat_capteur_${capteur}`, JSON.stringify(data.etat));
        } catch {
            const data = ETATS_CAPTEURS_SIMULES[capteur] ?? "stopped";
            setEtat(data);
        }
    });
}

// ============================================================
//  ACTIONNEURS — TEMPS D'ACTIVATION TOTAL 7 JOURS (en minutes)
// ============================================================

export function charger_temps_activation_actionneurs_7j(setTemps) {
    return lancerChargementTempsReel(async () => {
        try {
            const data = await getApi('/actionneurs/temps-activation?periode=7j');
            setTemps(data);
            localStorage.setItem('temps_activation_actionneurs_7j', JSON.stringify(data));
        } catch {
            const data = {
                ventilateur: 1470,
                pompe: 840,
                ampoule: 2940,
                servoMoteur: 420,
            };
            setTemps(data);
        }
    });
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
    return lancerChargementTempsReel(async () => {
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
    });
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
    return lancerChargementTempsReel(async () => {
        try {
            const data = await getApi(`/capteurs/${capteur}/stats?periode=7j`);
            setStats(data);
            localStorage.setItem(`stats_capteur_${capteur}`, JSON.stringify(data));
        } catch {
            const data = STATS_CAPTEURS_SIMULES[capteur] ?? { max: 0, min: 0, moy: 0, unite: "" };
            setStats(data);
        }
    });
}

export async function charger_mesures_capteur(capteur, dateDebut, dateFin) {
    // dateDebut / dateFin sont des "YYYY-MM-DD" locaux (valeurs d'un <input type="date">).
    // On les convertit en ISO UTC avant d'interroger l'API pour que le backend
    // compare les plages dans le bon fuseau, quelle que soit la localisation du serveur.
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
//  RAPPORT — HISTORIQUE ACTIONNEUR (pages rapports actionneurs)
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
    return lancerChargementTempsReel(async () => {
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
    });
}

// ============================================================
//  RAPPORT — INSTRUCTIONS ACTIONNEUR
// ============================================================

export function charger_instructions_actionneur(actionneur, setInstructions) {
    return lancerChargementTempsReel(async () => {
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
    });
}

// ============================================================
//  RAPPORT — GRANDEURS PHYSIQUES D'UN ACTIONNEUR
// ============================================================

export function charger_grandeurs_actionneur(actionneur, setGrandeurs) {
    return lancerChargementTempsReel(async () => {
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
            const data = simulations[actionneur] ?? {};
            setGrandeurs(data);
        }
    });
}
