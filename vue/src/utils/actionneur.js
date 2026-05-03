import API_BASE_URL from './config.js';

const LOCAL_ACTIONNEUR_CHOISI = "actionneur_choisi";
const UNE_HEURE_EN_MINUTES = 60;
const DOUZE_HEURES_EN_MINUTES = 12 * UNE_HEURE_EN_MINUTES;
const INTERVALLE_TEMPS_REEL_MS = 20000;

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

// Le niveau d'eau est un capteur digital (HIGH = "OK", LOW = "Bas") — pas de pourcentage.
export function obtenir_classe_niveau_eau(niveauEau) {
    if (niveauEau === "OK") return "niveau-vert";
    return "niveau-rouge";
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

// La porte s'ouvre quand le CO2 dépasse co2_max, se ferme quand il est sous co2_min.
export function obtenir_classe_co2(co2, seuils) {
    if (co2 > seuils["co2_max"]) return "co2-rouge";
    if (co2 < seuils["co2_min"]) return "co2-orange";
    return "co2-vert";
}

// ============================================================
//  HELPERS INTERNES
// ============================================================

function obtenirNomMicrocontroleur() {
    try {
        const micro = JSON.parse(localStorage.getItem('microcontroleur_actuel'));
        return micro?.nom ?? null;
    } catch {
        return null;
    }
}

export function microcontroleur_est_actif() {
    try {
        const micro = JSON.parse(localStorage.getItem('microcontroleur_actuel'));
        return Boolean(micro?.allume);
    } catch {
        return false;
    }
}

function construireParams(nomMicro) {
    return nomMicro ? `?microcontroleur=${encodeURIComponent(nomMicro)}` : '';
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

function normaliserEtat(etat) {
    if (etat === "actif") return "running";
    if (etat === "inactif") return "stopped";
    return etat ?? "stopped";
}

function chargerEtatActionneur(actionneur, setter, fallback) {
    return lancerChargementTempsReel(async () => {
        try {
            const data = await getApi(`/actionneurs/${actionneur}/etat`);
            setter(normaliserEtat(data.etat));
        } catch {
            setter(fallback);
        }
    });
}

function chargerValeurCapteur(capteur, cle, setter, fallback) {
    return lancerChargementTempsReel(async () => {
        try {
            const data = await getApi(`/capteurs/${capteur}/actuelle`);
            setter(data[cle]);
        } catch {
            setter(fallback);
        }
    });
}

function chargerHistoriqueActionneur(actionneur, setter, fallback) {
    return lancerChargementTempsReel(async () => {
        try {
            const data = await getApi(`/actionneurs/${actionneur}/historique?fenetre=12h`);
            setter(data);
        } catch {
            setter(fallback());
        }
    });
}

// ============================================================
//  CHARGEMENT DES ÉTATS ACTIONNEURS
// ============================================================

export function charger_etat_ventilateur(setVentilateurState) {
    return chargerEtatActionneur("ventilateur", setVentilateurState, "running");
}

export function charger_etat_pompe(setPompeState) {
    return chargerEtatActionneur("pompe", setPompeState, "running");
}

export function charger_etat_ampoule(setAmpouleState) {
    return chargerEtatActionneur("ampoule", setAmpouleState, "running");
}

export function charger_etat_servo_moteur(setServoMoteurState) {
    return chargerEtatActionneur("servo-moteur", setServoMoteurState, "stopped");
}

// ============================================================
//  CHARGEMENT DES VALEURS CAPTEURS
// ============================================================

export function charger_temperature_actuelle(setTemperatureActuelle) {
    return chargerValeurCapteur("temperature", "temperature", setTemperatureActuelle, 20);
}

export function charger_humidite_sol_actuelle(setHumiditeSol) {
    return chargerValeurCapteur("humidite-sol", "humidite_sol", setHumiditeSol, 42);
}

// Le capteur de niveau d'eau est digital : "OK" (réservoir plein) ou "Bas" (réservoir vide).
export function charger_niveau_eau_actuel(setNiveauEau) {
    return chargerValeurCapteur("niveau-eau", "niveau_eau", setNiveauEau, "OK");
}

export function charger_luminosite_actuelle(setLuminosite) {
    return chargerValeurCapteur("luminosite", "luminosite", setLuminosite, 54);
}

export function charger_co2_actuel(setCo2) {
    return chargerValeurCapteur("co2", "co2", setCo2, 45);
}

// ============================================================
//  CHARGEMENT DES SEUILS (appels API réels)
// ============================================================

export async function charger_temperature_seuils(setTemperatureSeuils) {
    const nomMicro = obtenirNomMicrocontroleur();
    const params = construireParams(nomMicro);

    try {
        const response = await fetch(`${API_BASE_URL}/seuils/temperature${params}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setTemperatureSeuils({
            temperature_min: data.temperature_min,
            temperature_max: data.temperature_max,
        });
    } catch {
        setTemperatureSeuils({ temperature_min: 18, temperature_max: 35 });
    }
}

export async function charger_pompe_seuils(setPompeSeuils) {
    // Le niveau d'eau est binaire (OK/Bas) — il n'a pas de seuil min/max.
    const nomMicro = obtenirNomMicrocontroleur();
    const params = construireParams(nomMicro);

    try {
        const response = await fetch(`${API_BASE_URL}/seuils/pompe${params}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setPompeSeuils({
            humidite_sol_min: data.humidite_sol_min,
            humidite_sol_max: data.humidite_sol_max,
        });
    } catch {
        setPompeSeuils({ humidite_sol_min: 30, humidite_sol_max: 70 });
    }
}

export async function charger_luminosite_seuils(setLuminositeSeuils) {
    const nomMicro = obtenirNomMicrocontroleur();
    const params = construireParams(nomMicro);

    try {
        const response = await fetch(`${API_BASE_URL}/seuils/luminosite${params}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setLuminositeSeuils({
            luminosite_min: data.luminosite_min,
            luminosite_max: data.luminosite_max,
        });
    } catch {
        setLuminositeSeuils({ luminosite_min: 20, luminosite_max: 80 });
    }
}

export async function chargerCo2Seuil(setCo2Seuil) {
    const nomMicro = obtenirNomMicrocontroleur();
    const params = construireParams(nomMicro);

    try {
        const response = await fetch(`${API_BASE_URL}/seuils/co2${params}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setCo2Seuil({
            co2_min: data.co2_min,
            co2_max: data.co2_max,
        });
    } catch {
        setCo2Seuil({ co2_min: 20, co2_max: 70 });
    }
}

// ============================================================
//  HISTORIQUES (intervalle 15 s)
// ============================================================

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
    return chargerHistoriqueActionneur("ventilateur", setHistoriqueVentilateur, generer_historique_ventilateur_simule);
}

export function charger_historique_pompe(setHistoriquePompe) {
    return chargerHistoriqueActionneur("pompe", setHistoriquePompe, () => generer_historique_actionneur_simule("pompe"));
}

export function charger_historique_ampoule(setHistoriqueAmpoule) {
    return chargerHistoriqueActionneur("ampoule", setHistoriqueAmpoule, () => generer_historique_actionneur_simule("ampoule"));
}

export function charger_historique_servo_moteur(setHistoriqueServoMoteur) {
    return chargerHistoriqueActionneur("servo-moteur", setHistoriqueServoMoteur, () => generer_historique_actionneur_simule("servoMoteur"));
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

export async function creer_instruction_simule(actionneur, action, dureeMinutes) {
    try {
        const nomMicro = obtenirNomMicrocontroleur();
        const params = construireParams(nomMicro);
        const response = await fetch(`${API_BASE_URL}/instructions${params}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ actionneur, action, duree_minutes: dureeMinutes }),
        });

        if (!response.ok) throw new Error("Erreur API");
        return await response.json();
    } catch {
        return {
            id: crypto.getRandomValues(new Uint8Array(16)).toString(),
            action,
            duree: dureeMinutes * 60,
            statut: 'en_attente',
            date_arrivee: new Date().toISOString(),
            actionneur,
        };
    }
}
