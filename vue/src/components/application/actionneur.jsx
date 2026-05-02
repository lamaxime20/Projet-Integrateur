import { useState } from "react";
import VentilateurDetails from "./actionneur/ventilateurDetails";
import {
    enregistrer_actionneur_choisi,
    charger_actionneur_choisi,
    obtenir_couleur_etat_actionneur,
    obtenir_libelle_etat_actionneur,
} from "../../utils/actionneur";
import "../../assets/styles/components/application/actionneur.css";

function Actionneur() {
    const [ventilateurState] = useState("running");
    const [pompeState] = useState("running");
    const [ampouleState] = useState("running");
    const [servoMoteurState] = useState("running");
    const [actionneurChoisi, setActionneurChoisi] = useState(charger_actionneur_choisi());
    const vocabulaire = {
        ventilateur: {
            running: "En marche",
            stopped: "Arrêté",
            defaillant: "Défaillant",
        },
        pompe: {
            running: "En marche",
            stopped: "Arrêtée",
            defaillant: "Défaillante",
        },
        ampoule: {
            running: "Allumée",
            stopped: "Éteinte",
            defaillant: "Défaillante",
        },
        porte: {
            running: "Ouverte",
            stopped: "Fermée",
            defaillant: "Défaillante",
        },
    };

    const choisirActionneur = (actionneur) => {
        setActionneurChoisi(actionneur);
        enregistrer_actionneur_choisi(actionneur);
    }

    if(actionneurChoisi === VENTILATEUR) {
        return (
            <VentilateurDetails 
                retourner={() => choisirActionneur(AUCUN)}
            />
        )
    }

    if(actionneurChoisi === POMPE) {
        return (
            <div className="actionneur-root">
                <button
                    className="actionneur-retour"
                    onClick={() => {
                        setActionneurChoisi(AUCUN);
                        enregistrer_actionneur_choisi(AUCUN)
                    }}
                >
                    Retour
                </button>
                <h1>Pompe choisi</h1>
            </div>
        )
    }

    if(actionneurChoisi === AMPOULE) {
        return (
            <div className="actionneur-root">
                <button
                    className="actionneur-retour"
                    onClick={() => {
                        setActionneurChoisi(AUCUN);
                        enregistrer_actionneur_choisi(AUCUN)
                    }}
                >
                    Retour
                </button>
                <h1>
                    Ampoule choisi
                </h1>
            </div>
        )
    }

    if(actionneurChoisi === SERVO_MOTEUR) {
        return (
            <div className="actionneur-root">
                <button
                    className="actionneur-retour"
                    onClick={() => {
                        setActionneurChoisi(AUCUN);
                        enregistrer_actionneur_choisi(AUCUN)
                    }}
                >
                    Retour
                </button>
                <h1>
                    Porte choisi
                </h1>
            </div>
        )
    }

    return (
        <div className="actionneur-root">
            <header className="actionneur-header">
                <h1>Actionneur</h1>
                <p>
                    Regarde l’état de tes actionneurs et garde le contrôle sur la qualité de ta terre.
                </p>
            </header>
            <div className="actionneur-content">
                <button 
                    className="actionneur-ventilateur"
                    onClick={() => choisirActionneur(VENTILATEUR)}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">mode_fan</span>
                    <h2>Ventilateur</h2>
                    <div className="actionneur-ventilateur-state">
                        <span 
                            className={`actionneur-point-lumineux ${obtenir_couleur_etat_actionneur(ventilateurState)}`}
                        ></span>
                        <p>{obtenir_libelle_etat_actionneur(ventilateurState, vocabulaire.ventilateur)}</p>
                    </div>
                </button>
                <button 
                    className="actionneur-pompe"
                    onClick={() => choisirActionneur(POMPE)}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">water_pump</span>
                    <h2>Pompe</h2>
                    <div className="actionneur-pompe-state">
                        <span 
                            className={`actionneur-point-lumineux ${obtenir_couleur_etat_actionneur(pompeState)}`}
                        ></span>
                        <p>{obtenir_libelle_etat_actionneur(pompeState, vocabulaire.pompe)}</p>
                    </div>
                </button>
                <button 
                    className="actionneur-ampoule"
                    onClick={() => choisirActionneur(AMPOULE)}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">lightbulb</span>
                    <h2>Ampoule</h2>
                    <div className="actionneur-ampoule-state">
                        <span 
                            className={`actionneur-point-lumineux ${obtenir_couleur_etat_actionneur(ampouleState)}`}
                        ></span>
                        <p>{obtenir_libelle_etat_actionneur(ampouleState, vocabulaire.ampoule)}</p>
                    </div>
                </button>
                <button 
                    className="actionneur-servo-moteur"
                    onClick={() => choisirActionneur(SERVO_MOTEUR)}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">door_open</span>
                    <h2>Porte</h2>
                    <div className="actionneur-servo-moteur-state">
                        <span 
                            className={`actionneur-point-lumineux ${obtenir_couleur_etat_actionneur(servoMoteurState)}`}
                        ></span>
                        <p>{obtenir_libelle_etat_actionneur(servoMoteurState, vocabulaire.porte)}</p>
                    </div>
                </button>
            </div>
        </div>
    )
}

export default Actionneur;
const VENTILATEUR = "ventilateur";
const POMPE = "pompe";
const AMPOULE = "ampoule";
const SERVO_MOTEUR = "servo-moteur";
const AUCUN = "aucun";
