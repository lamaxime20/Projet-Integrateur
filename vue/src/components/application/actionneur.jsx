import { useEffect, useState } from "react";
import VentilateurDetails from "./actionneur/ventilateurDetails";
import PompeDetails from "./actionneur/pompeDetails";
import AmpouleDetails from "./actionneur/ampouleDetails";
import ServoMoteurDetails from "./actionneur/servoMoteurDetails";
import {
    enregistrer_actionneur_choisi,
    charger_actionneur_choisi,
    obtenir_couleur_etat_actionneur,
    obtenir_libelle_etat_actionneur,
    charger_etat_ventilateur,
    charger_etat_pompe,
    charger_etat_ampoule,
    charger_etat_servo_moteur,
} from "../../utils/actionneur";
import "../../assets/styles/components/application/actionneur.css";

function Actionneur() {
    const [ventilateurState, setVentilateurState] = useState("running");
    const [pompeState, setPompeState] = useState("running");
    const [ampouleState, setAmpouleState] = useState("running");
    const [servoMoteurState, setServoMoteurState] = useState("running");
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

    useEffect(() => {
        const intervals = [
            charger_etat_ventilateur(setVentilateurState),
            charger_etat_pompe(setPompeState),
            charger_etat_ampoule(setAmpouleState),
            charger_etat_servo_moteur(setServoMoteurState),
        ];

        return () => intervals.forEach(clearInterval);
    }, []);

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
            <PompeDetails
                retourner={() => choisirActionneur(AUCUN)}
            />
        )
    }

    if(actionneurChoisi === AMPOULE) {
        return (
            <AmpouleDetails
                retourner={() => choisirActionneur(AUCUN)}
            />
        )
    }

    if(actionneurChoisi === SERVO_MOTEUR) {
        return (
            <ServoMoteurDetails
                retourner={() => choisirActionneur(AUCUN)}
            />
        )
    }

    return (
        <div className="actionneur-root">
            <header className="actionneur-header">
                <p className="actionneur-eyebrow">Contrôle doux</p>
                <h1 className="actionneur-titre">Équipements de la serre</h1>
                <p>
                    Vérifie la pompe, la ventilation, la lumière et la porte sans perdre le fil.
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
