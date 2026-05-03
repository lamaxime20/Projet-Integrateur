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

// ============================================================
//  MICROCONTRÔLEUR
// ============================================================

export async function charger_historique_microcontroleur(setHistorique) {
    // API plus tard:
    // Envoyer: GET /api/microcontroleur/historique?fenetre=12h avec l'identifiant du microcontrôleur.
    // Recevoir: [{ etat: "running" | "stopped", debut: ISOString, fin: ISOString }].

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
    setHistorique(scenario.map((p) => {
        const periode = creerPeriode(curseur, p.duree, p.etat);
        curseur = new Date(periode.fin);
        return periode;
    }));
}

// ============================================================
//  CAPTEURS — MOYENNES 7 JOURS
// ============================================================

export async function charger_moyennes_capteurs_7j(setMoyennes) {
    // API plus tard:
    // Envoyer: GET /api/capteurs/moyennes?periode=7j avec l'identifiant du microcontrôleur.
    // Recevoir: { temperature: number, humidite_sol: number, luminosite: number, co2: number }
    // Les unités sont : température (°C), humidité sol (%), luminosité (%), CO2 (ppm relatif 0-100).

    setMoyennes({
        temperature: { valeur: 24.3, unite: "°C" },
        humiditeSol: { valeur: 48.7, unite: "%" },
        luminosite: { valeur: 62.1, unite: "%" },
        co2: { valeur: 38.4, unite: "ppm" },
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

export async function charger_etat_capteur(capteur, setEtat) {
    // API plus tard:
    // Envoyer: GET /api/capteurs/{capteur}/etat avec l'identifiant du microcontrôleur.
    // Recevoir: { etat: "running" | "stopped" | "defaillant" }.

    setEtat(ETATS_CAPTEURS_SIMULES[capteur] ?? "stopped");
}

// ============================================================
//  ACTIONNEURS — TEMPS D'ACTIVATION TOTAL 7 JOURS (en minutes)
// ============================================================

export async function charger_temps_activation_actionneurs_7j(setTemps) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/temps-activation?periode=7j avec l'identifiant du microcontrôleur.
    // Recevoir: { ventilateur: number, pompe: number, ampoule: number, servo_moteur: number }
    // Les valeurs sont des durées totales en minutes sur les 7 derniers jours.

    setTemps({
        ventilateur: 1470,
        pompe: 840,
        ampoule: 2940,
        servoMoteur: 420,
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

export async function charger_historique_capteur(capteur, setHistorique) {
    // API plus tard:
    // Envoyer: GET /api/capteurs/{capteur}/historique?fenetre=12h avec l'identifiant du microcontrôleur.
    // Recevoir: [{ etat: "running" | "stopped" | "defaillant", debut: ISOString, fin: ISOString }].
    // running = capteur actif (mesures normales), stopped = capteur inactif, defaillant = erreur capteur.

    const debutFenetre = ajouterMinutes(new Date(), -DOUZE_HEURES_EN_MINUTES);
    const scenario = SCENARIOS_CAPTEURS[capteur] ?? SCENARIOS_CAPTEURS.temperature;
    let curseur = debutFenetre;

    setHistorique(scenario.map((p) => {
        const periode = creerPeriode(curseur, p.duree, p.etat);
        curseur = new Date(periode.fin);
        return periode;
    }));
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

export async function charger_stats_capteur(capteur, setStats) {
    // API plus tard:
    // Envoyer: GET /api/capteurs/{capteur}/stats?periode=7j avec l'identifiant du microcontrôleur.
    // Recevoir: { max: number, min: number, moy: number, unite: string }.

    setStats(STATS_CAPTEURS_SIMULES[capteur] ?? { max: 0, min: 0, moy: 0, unite: "" });
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

export async function charger_historique_actionneur_rapport(actionneur, setHistorique) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/{actionneur}/historique?fenetre=12h avec l'identifiant du microcontrôleur.
    // Recevoir: [{ etat: "running" | "stopped" | "defaillant", debut: ISOString, fin: ISOString }].

    const debutFenetre = ajouterMinutes(new Date(), -DOUZE_HEURES_EN_MINUTES);
    const scenario = SCENARIOS_ACTIONNEURS[actionneur] ?? SCENARIOS_ACTIONNEURS.ventilateur;
    let curseur = debutFenetre;

    setHistorique(scenario.map((p) => {
        const periode = creerPeriode(curseur, p.duree, p.etat);
        curseur = new Date(periode.fin);
        return periode;
    }));
}

// ============================================================
//  RAPPORT — INSTRUCTIONS ACTIONNEUR
// ============================================================

export async function charger_instructions_actionneur(actionneur, setInstructions) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/{actionneur}/instructions avec l'identifiant du microcontrôleur.
    // Recevoir: [{ id, action, duree, statut, date_arrivee, actionneur }].
    // Statuts possibles: "en_attente" | "en_cours" | "termine" | "annule".

    const now = new Date();
    const etats = ["termine", "en_cours", "en_attente", "annule", "termine", "termine"];
    const actions = ["allumer", "arreter"];
    const durees = [15, 30, 45, 60, 90, 120];

    setInstructions(Array.from({ length: 12 }, (_, i) => ({
        id: `instr_${i + 1}`,
        action: actions[i % 2],
        duree: durees[i % durees.length],
        statut: etats[i % etats.length],
        date_arrivee: new Date(now.getTime() - i * 3.5 * 60 * 60 * 1000).toISOString(),
        actionneur,
    })));
}

// ============================================================
//  RAPPORT — GRANDEURS PHYSIQUES D'UN ACTIONNEUR
// ============================================================

export async function charger_grandeurs_actionneur(actionneur, setGrandeurs) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/{actionneur}/grandeurs avec l'identifiant du microcontrôleur.
    // Recevoir les valeurs actuelles des grandeurs physiques influençant l'actionneur :
    //   - ventilateur: { temperature: number (°C), humidite_air: number (%) }  → DHT22
    //   - pompe: { humidite_sol: number (%), niveau_eau: "OK" | "Bas" }         → YL-69 + flotteur
    //   - ampoule: { luminosite: number (%) }                                   → LDR
    //   - servo-moteur: { co2: number (ppm relatif 0-100) }                     → SEN0159

    const simulations = {
        ventilateur: { temperature: 24.3, humidite_air: 58 },
        pompe: { humidite_sol: 42, niveau_eau: "OK" },
        ampoule: { luminosite: 62 },
        "servo-moteur": { co2: 45 },
    };

    setGrandeurs(simulations[actionneur] ?? {});
}
