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
    //Simulation d'un appel API qui va prendre l'identifiant du microcontroleur
    // et son passkey, verifier si il appartient deja a quelqu'un
    // sinon,
    // il va renvoyer une connfirmation avec toutes les infos du microcontroleur

    return {
        "success": true,
        "message": "Microcontroleur enregistré avec succès",
        "microcontroleur": {
            "nom": "champ de pascal",
            "mac_address": 12345,
            "identifiant": "yess",
            "reference": "Mince",
            "allume": true,
            "last_connexion": "29-01-2025",
            "date_installation": "29-01-2025",
            "passkey": "123456789",
        }
    }
}

export async function charger_liste_microcontroleurs_user() {
    // Utiliser les credentials pour chercher a partir du token d'un utilisateur
    // les microcontroleurs qui l'appartiennent et renvoyer les noms de ces microcontroleurs
    // et leurs etats allume ou eteint sous forme de liste

    const data = [
        {
            "nom": "champ de pascal",
            "allume": true,
        },
        {
            "nom": "champ de tomate",
            "allume": false,
        },
        {
            "nom": "champ de raisin",
            "allume": true,
        },
    ]

    return data;
}

export async function charger_microcontroleur_user(nom_microcontroleur) {
    // En utilisant les credentials pour avoir le token de l'utilisateur
    // utilise le nom du microcontroleur et le token de l'utilisateur pour
    // avoir toutes les informations du microcontroleur

    const result = {
        "success": true,
        "message": "Microcontroleur chargé avec succès",
        "microcontroleur": {
            "nom": "champ de pascal",
            "mac_address": 12345,
            "identifiant": "yess",
            "reference": "Mince",
            "allume": true,
            "last_connexion": "29-01-2025",
            "date_installation": "29-01-2025",
            "passkey": "123456789",
        }
    }

    enregistrer_microcontroleur_local(result.microcontroleur);

    return result.success;
}

export function changer_microcontroleur_user() {
    supprimer_microcontroleur_local();
    window.location.reload();
}