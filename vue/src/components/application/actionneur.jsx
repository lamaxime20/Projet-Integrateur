import { useState } from "react";
import VentilateurDetails from "./actionneur/ventilateurDetails";
import { enregistrer_actionneur_choisi, charger_actionneur_choisi } from "../../utils/actionneur";

function Actionneur() {
    const [ventilateurState, setVentilateurState] = useState("running");
    const [pompeState, setPompeState] = useState("running");
    const [ampouleState, setAmpouleState] = useState("running");
    const [servoMoteurState, setServomoteurState] = useState("running");
    const [actionneurChoisi, setActionneurChoisi] = useState(charger_actionneur_choisi());

    const choisirActionneur = (actionneur) => {
        setActionneurChoisi(actionneur);
        enregistrer_actionneur_choisi(actionneur);
    }

    if(actionneurChoisi === VENTILATEUR) {
        return (
            <VentilateurDetails 
                retourner={(e) => choisirActionneur(AUCUN)}
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
                    Regarde l'etat de tes capteurs, garantit la properite de ta terre
                    En manageant l'etat des actionneurs
                </p>
            </header>
            <div className="actionneur-content">
                <button 
                    className="actionneur-ventilateur"
                    onClick={() => choisirActionneur(VENTILATEUR)}
                >
                    <span className="material-symbols-outlined" aria-hidden="true"></span>
                    <h2>Ventilateur</h2>
                    <div className="actionneur-ventilateur-state">
                        <span 
                            className={`actionneur-point-lumineux 
                                ${ventilateurState === "running" && "vert"}
                                ${ventilateurState === "stopped" && "rouge"}
                                ${ventilateurState === "defaillant" && "orange"}
                            `}
                        ></span>
                        <p>
                            {`
                                ${ventilateurState === "running" && "En marche"}
                                ${ventilateurState === "stopped" && "Arrêté"}
                                ${ventilateurState === "defaillant" && "Défaillant"}
                            `}
                        </p>
                    </div>
                </button>
                <button 
                    className="actionneur-pompe"
                    onClick={() => choisirActionneur(POMPE)}
                >
                    <span className="material-symbols-outlined" aria-hidden="true"></span>
                    <h2>Pompe</h2>
                    <div className="actionneur-pompe-state">
                        <span 
                            className={`actionneur-point-lumineux 
                                ${pompeState === "running" && "vert"}
                                ${pompeState === "stopped" && "rouge"}
                                ${pompeState === "defaillant" && "orange"}
                            `}
                        ></span>
                        <p>
                            {`
                                ${pompeState === "running" && "En marche"}
                                ${pompeState === "stopped" && "Arrêté"}
                                ${pompeState === "defaillant" && "Défaillant"}
                            `}
                        </p>
                    </div>
                </button>
                <button 
                    className="actionneur-ampoule"
                    onClick={() => choisirActionneur(AMPOULE)}
                >
                    <span className="material-symbols-outlined" aria-hidden="true"></span>
                    <h2>Ampoule</h2>
                    <div className="actionneur-ampoule-state">
                        <span 
                            className={`actionneur-point-lumineux 
                                ${ampouleState === "running" && "vert"}
                                ${ampouleState === "stopped" && "rouge"}
                                ${ampouleState === "defaillant" && "orange"}
                            `}
                        ></span>
                        <p>
                            {`
                                ${ampouleState === "running" && "Allumé"}
                                ${ampouleState === "stopped" && "Eteint"}
                                ${ampouleState === "defaillant" && "Défaillant"}
                            `}
                        </p>
                    </div>
                </button>
                <button 
                    className="actionneur-servo-moteur"
                    onClick={() => choisirActionneur(SERVO_MOTEUR)}
                >
                    <span className="material-symbols-outlined" aria-hidden="true"></span>
                    <h2>Porte</h2>
                    <div className="actionneur-servo-moteur-state">
                        <span 
                            className={`actionneur-point-lumineux 
                                ${servoMoteurState === "running" && "vert"}
                                ${servoMoteurState === "stopped" && "rouge"}
                                ${servoMoteurState === "defaillant" && "orange"}
                            `}
                        ></span>
                        <p>
                            {`
                                ${servoMoteurState === "running" && "Ouverte"}
                                ${servoMoteurState === "stopped" && "Fermée"}
                                ${servoMoteurState === "defaillant" && "Défaillante"}
                            `}
                        </p>
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