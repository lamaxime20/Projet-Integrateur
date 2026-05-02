const LOCAL_ACTIONNEUR_CHOISI = "actionneur_choisi";
const UNE_HEURE_EN_MINUTES = 60;
const DOUZE_HEURES_EN_MINUTES = 12 * UNE_HEURE_EN_MINUTES;

export function enregistrer_actionneur_choisi(actionneur) {
    localStorage.setItem(LOCAL_ACTIONNEUR_CHOISI, JSON.stringify(actionneur));
}

export function charger_actionneur_choisi() {
    return JSON.parse(localStorage.getItem(LOCAL_ACTIONNEUR_CHOISI));
}

export function supprimer_actionneur_choisi() {
    localStorage.removeItem(LOCAL_ACTIONNEUR_CHOISI);
}

export function obtenir_couleur_etat_actionneur(etat) {
    if (etat === "running") {
        return "vert";
    }

    if (etat === "stopped") {
        return "orange";
    }

    if (etat === "defaillant") {
        return "rouge";
    }

    return "";
}

export function obtenir_libelle_etat_actionneur(etat, vocabulaire) {
    return vocabulaire[etat] ?? "État inconnu";
}

export function obtenir_classe_temperature(temperature, seuils) {
    if (temperature > seuils["temperature_max"]) {
        return "temperature-rouge";
    }

    if (temperature < seuils["temperature_min"]) {
        return "temperature-orange";
    }

    return "temperature-vert";
}

export function obtenir_classe_humidite_sol(humiditeSol, seuils) {
    if (humiditeSol < seuils["humidite_sol_min"]) {
        return "humidite-orange";
    }

    if (humiditeSol > seuils["humidite_sol_max"]) {
        return "humidite-rouge";
    }

    return "humidite-vert";
}

export function obtenir_classe_niveau_reservoir(niveauReservoir, seuils) {
    if (niveauReservoir < seuils["niveau_reservoir_min"]) {
        return "niveau-rouge";
    }

    if (niveauReservoir < seuils["niveau_reservoir_moyen"]) {
        return "niveau-orange";
    }

    return "niveau-vert";
}

export function obtenir_classe_luminosite(luminosite, seuils) {
    if (luminosite < seuils["luminosite_min"]) {
        return "luminosite-orange";
    }

    if (luminosite > seuils["luminosite_max"]) {
        return "luminosite-rouge";
    }

    return "luminosite-vert";
}

export function obtenir_classe_angle_porte(anglePorte) {
    if (anglePorte >= 70) {
        return "angle-vert";
    }

    if (anglePorte > 0) {
        return "angle-orange";
    }

    return "angle-rouge";
}

export async function charger_etat_ventilateur(setVentilateurState) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/ventilateur/etat avec l'identifiant du microcontroleur en query/header.
    // Recevoir: { etat: "running" | "stopped" | "defaillant" }.

    setVentilateurState("running");
}

export async function charger_temperature_actuelle(setTemperatureActuelle) {
    // API plus tard:
    // Envoyer: GET /api/capteurs/temperature/actuelle avec l'identifiant du microcontroleur en query/header.
    // Recevoir: { temperature: number } en degres Celsius.

    setTemperatureActuelle(20);
}

export async function charger_temperature_seuils(setTemperatureSeuils) {
    // API plus tard:
    // Envoyer: GET /api/seuils/temperature avec l'identifiant user ou microcontroleur.
    // Recevoir: { temperature_min: number, temperature_max: number }.
    
    setTemperatureSeuils({
        "temperature_min": 10,
        "temperature_max": 30
    })
}

export async function charger_etat_pompe(setPompeState) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/pompe/etat avec l'identifiant du microcontroleur.
    // Recevoir: { etat: "running" | "stopped" | "defaillant" }.

    setPompeState("running");
}

export async function charger_humidite_sol_actuelle(setHumiditeSol) {
    // API plus tard:
    // Envoyer: GET /api/capteurs/humidite-sol/actuelle avec l'identifiant du microcontroleur.
    // Recevoir: { humidite_sol: number } en pourcentage.

    setHumiditeSol(42);
}

export async function charger_niveau_reservoir_actuel(setNiveauReservoir) {
    // API plus tard:
    // Envoyer: GET /api/capteurs/reservoir/niveau-actuel avec l'identifiant du microcontroleur.
    // Recevoir: { niveau_reservoir: number } en pourcentage.

    setNiveauReservoir(68);
}

export async function charger_pompe_seuils(setPompeSeuils) {
    // API plus tard:
    // Envoyer: GET /api/seuils/pompe avec l'identifiant user ou microcontroleur.
    // Recevoir: {
    //   humidite_sol_min: number,
    //   humidite_sol_max: number,
    //   niveau_reservoir_min: number,
    //   niveau_reservoir_moyen: number
    // }.

    setPompeSeuils({
        "humidite_sol_min": 35,
        "humidite_sol_max": 75,
        "niveau_reservoir_min": 20,
        "niveau_reservoir_moyen": 45
    });
}

export async function charger_etat_ampoule(setAmpouleState) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/ampoule/etat avec l'identifiant du microcontroleur.
    // Recevoir: { etat: "running" | "stopped" | "defaillant" }.

    setAmpouleState("running");
}

export async function charger_luminosite_actuelle(setLuminosite) {
    // API plus tard:
    // Envoyer: GET /api/capteurs/luminosite/actuelle avec l'identifiant du microcontroleur.
    // Recevoir: { luminosite: number } en lux.

    setLuminosite(540);
}

export async function charger_luminosite_seuils(setLuminositeSeuils) {
    // API plus tard:
    // Envoyer: GET /api/seuils/luminosite avec l'identifiant user ou microcontroleur.
    // Recevoir: { luminosite_min: number, luminosite_max: number }.

    setLuminositeSeuils({
        "luminosite_min": 250,
        "luminosite_max": 900
    });
}

export async function charger_etat_servo_moteur(setServoMoteurState) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/porte/etat avec l'identifiant du microcontroleur.
    // Recevoir: { etat: "running" | "stopped" | "defaillant" }.

    setServoMoteurState("stopped");
}

export async function charger_angle_porte_actuel(setAnglePorte) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/porte/angle-actuel avec l'identifiant du microcontroleur.
    // Recevoir: { angle_porte: number } en degres, entre 0 et 90.

    setAnglePorte(12);
}

function ajouterMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60 * 1000);
}

function creerPeriodeActionneur(debut, dureeEnMinutes, etat) {
    return {
        etat,
        debut: debut.toISOString(),
        fin: ajouterMinutes(debut, dureeEnMinutes).toISOString(),
    };
}

export function generer_historique_ventilateur_simule(dateActuelle = new Date()) {
    return generer_historique_actionneur_simule("ventilateur", dateActuelle);
}

function generer_historique_actionneur_simule(actionneur, dateActuelle = new Date()) {
    const debutFenetre = ajouterMinutes(dateActuelle, -DOUZE_HEURES_EN_MINUTES);
    const scenarios = {
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
        servoMoteur: [
            { etat: "stopped", duree: 220 },
            { etat: "running", duree: 30 },
            { etat: "stopped", duree: 250 },
            { etat: "defaillant", duree: 20 },
            { etat: "running", duree: 40 },
            { etat: "stopped", duree: 160 },
        ],
    };
    const scenario = scenarios[actionneur] ?? scenarios.ventilateur;

    let curseur = debutFenetre;

    return scenario.map((periode) => {
        const periodeCreee = creerPeriodeActionneur(curseur, periode.duree, periode.etat);
        curseur = new Date(periodeCreee.fin);
        return periodeCreee;
    });
}

export function charger_historique_ventilateur(setHistoriqueVentilateur) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/ventilateur/historique?fenetre=12h.
    // Recevoir: [{ etat: "running" | "stopped" | "defaillant", debut: ISOString, fin: ISOString }].
    const envoyerHistorique = () => {
        setHistoriqueVentilateur(generer_historique_ventilateur_simule());
    };

    envoyerHistorique();

    return setInterval(envoyerHistorique, 15000);
}

export function charger_historique_pompe(setHistoriquePompe) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/pompe/historique?fenetre=12h.
    // Recevoir: [{ etat: "running" | "stopped" | "defaillant", debut: ISOString, fin: ISOString }].
    const envoyerHistorique = () => {
        setHistoriquePompe(generer_historique_actionneur_simule("pompe"));
    };

    envoyerHistorique();

    return setInterval(envoyerHistorique, 15000);
}

export function charger_historique_ampoule(setHistoriqueAmpoule) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/ampoule/historique?fenetre=12h.
    // Recevoir: [{ etat: "running" | "stopped" | "defaillant", debut: ISOString, fin: ISOString }].
    const envoyerHistorique = () => {
        setHistoriqueAmpoule(generer_historique_actionneur_simule("ampoule"));
    };

    envoyerHistorique();

    return setInterval(envoyerHistorique, 15000);
}

export function charger_historique_servo_moteur(setHistoriqueServoMoteur) {
    // API plus tard:
    // Envoyer: GET /api/actionneurs/porte/historique?fenetre=12h.
    // Recevoir: [{ etat: "running" | "stopped" | "defaillant", debut: ISOString, fin: ISOString }].
    const envoyerHistorique = () => {
        setHistoriqueServoMoteur(generer_historique_actionneur_simule("servoMoteur"));
    };

    envoyerHistorique();

    return setInterval(envoyerHistorique, 15000);
}

export function construire_batonnets_historique_actionneur(historique, dateActuelle = new Date()) {
    const debutFenetre = ajouterMinutes(dateActuelle, -DOUZE_HEURES_EN_MINUTES);
    const batonnets = [];

    historique.forEach((periode) => {
        const debutPeriode = new Date(periode.debut);
        const finPeriode = new Date(periode.fin);
        let curseur = new Date(Math.max(debutPeriode.getTime(), debutFenetre.getTime()));
        const finVisible = new Date(Math.min(finPeriode.getTime(), dateActuelle.getTime()));

        while (curseur < finVisible) {
            const finBatonnet = new Date(Math.min(
                ajouterMinutes(curseur, UNE_HEURE_EN_MINUTES).getTime(),
                finVisible.getTime()
            ));
            const minutes = Math.max(1, Math.round((finBatonnet - curseur) / 60000));

            batonnets.push({
                etat: periode.etat,
                minutes,
                heureDebut: curseur.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            });

            curseur = finBatonnet;
        }
    });

    return batonnets;
}

export function creer_instruction_simule(actionneur, action, dureeMinutes) {
    // API plus tard:
    // Envoyer: POST /api/instructions avec { actionneur_id, action, duree_minutes }
    // Recevoir: { id, action, duree, statut, date_arrivee, user_id, actionneur_id }

    const instruction = {
        id: crypto.getRandomValues(new Uint8Array(16)).toString(),
        action,
        duree: dureeMinutes * 60, // en secondes pour la BD
        statut: 'en_attente',
        date_arrivee: new Date().toISOString(),
        actionneur,
    };

    return instruction;
}