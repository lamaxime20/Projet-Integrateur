const LOCAL_ACTIONNEUR_CHOISI = "actionneur_choisi";

export function enregistrer_actionneur_choisi(actionneur) {
    localStorage.setItem(LOCAL_ACTIONNEUR_CHOISI, JSON.stringify(actionneur));
}

export function charger_actionneur_choisi() {
    return JSON.parse(localStorage.getItem(LOCAL_ACTIONNEUR_CHOISI));
}

export function supprimer_actionneur_choisi() {
    localStorage.removeItem(LOCAL_ACTIONNEUR_CHOISI);
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