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

export async function charger_etat_ventilateur(setVentilateurState) {
    // La fonction ci va communiquer avec le backend pour avoir l'etat du ventilateur
    // en temps reel

    setVentilateurState("running");
}

export function charger_temperature_actuelle(setTemperatureActuelle) {
    // La fonction ci va communiquer avec le backend pour avoir la temperature
    // du capteur en temps reel

    setTemperatureActuelle(20);
}

export function charger_temperature_seuils(setTemperatureSeuils) {
    // Appel API qui va renvoyant les seuils de temperatures fixes par l'utilisateur
    
    setTemperatureSeuils({
        "temperature_min": 10,
        "temperature_max": 30
    })
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
    const debutFenetre = ajouterMinutes(dateActuelle, -DOUZE_HEURES_EN_MINUTES);
    const scenario = [
        { etat: "running", duree: 95 },
        { etat: "stopped", duree: 125 },
        { etat: "defaillant", duree: 40 },
        { etat: "stopped", duree: 80 },
        { etat: "running", duree: 135 },
        { etat: "defaillant", duree: 55 },
        { etat: "stopped", duree: 100 },
        { etat: "running", duree: 90 },
    ];

    let curseur = debutFenetre;

    return scenario.map((periode) => {
        const periodeCreee = creerPeriodeActionneur(curseur, periode.duree, periode.etat);
        curseur = new Date(periodeCreee.fin);
        return periodeCreee;
    });
}

export function charger_historique_ventilateur(setHistoriqueVentilateur) {
    // Simulation temps reel: le backend pourra renvoyer le meme format de periodes.
    const envoyerHistorique = () => {
        setHistoriqueVentilateur(generer_historique_ventilateur_simule());
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
