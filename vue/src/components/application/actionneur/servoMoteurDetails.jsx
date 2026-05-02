import { useState, useEffect } from "react";
import GrapheBatonnet from "../grapheBatonnet";
import InstructionModal from "./instructionModal";
import {
    charger_angle_porte_actuel,
    charger_etat_servo_moteur,
    charger_historique_servo_moteur,
    obtenir_classe_angle_porte,
    creer_instruction_simule,
} from "../../../utils/actionneur";
import "../../../assets/styles/components/application/actionneur/servoMoteurDetails.css";

function ServoMoteurDetails({ retourner }) {
    const [servoMoteurState, setServoMoteurState] = useState("stopped");
    const [anglePorte, setAnglePorte] = useState(12);
    const [historiqueServoMoteur, setHistoriqueServoMoteur] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    useEffect(() => {
        charger_etat_servo_moteur(setServoMoteurState);
        charger_angle_porte_actuel(setAnglePorte);
        const intervalHistorique = charger_historique_servo_moteur(setHistoriqueServoMoteur);

        return () => clearInterval(intervalHistorique);
    }, []);

    const retour = () => {
        retourner();
    };

    const handleOpenModal = (action) => {
        setModalAction(action);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalAction(null);
    };

    const handleConfirmInstruction = (dureeMinutes) => {
        const instruction = creer_instruction_simule("porte", modalAction, dureeMinutes);
        console.log("Instruction créée :", instruction);

        if (modalAction === "allumer") {
            setServoMoteurState("running");
        } else if (modalAction === "arreter") {
            setServoMoteurState("stopped");
        }

        handleCloseModal();
    };

    return (
        <div className="servoMoteurDetails-root">
            <header className="servoMoteurDetails-header">
                <button
                    type="button"
                    className="servoMoteurDetails-retour"
                    onClick={() => {
                        retour();
                    }}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                    Retour
                </button>
                <h1 className="servoMoteurDetails-titre">Porte</h1>
            </header>
            <div className="servoMoteurDetails-content">
                <section className="servoMoteurDetails-state-graph">
                    <a href="#">Voir plus</a>
                    <div className="servoMoteurDetails-graph">
                        <GrapheBatonnet
                            historique={historiqueServoMoteur}
                            vocabulaire={{
                                running: "Ouverte",
                                stopped: "Fermée",
                                defaillant: "Défaillante",
                            }}
                        />
                    </div>
                    <div className="servoMoteurDetails-legende">
                        <div className="servoMoteurDetails-item-legende">
                            <span className="servoMoteurDetails-point vert"></span>
                            <p>Ouverte</p>
                        </div>
                        <div className="servoMoteurDetails-item-legende">
                            <span className="servoMoteurDetails-point orange"></span>
                            <p>Fermée</p>
                        </div>
                        <div className="servoMoteurDetails-item-legende">
                            <span className="servoMoteurDetails-point rouge"></span>
                            <p>Défaillante</p>
                        </div>
                    </div>
                </section>
                <section className="servoMoteurDetails-other">
                    <div className="servoMoteurDetails-instruction">
                        {servoMoteurState === "running" &&
                            <>
                                <p>La porte est ouverte</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("arreter")}
                                >
                                    Fermer
                                </button>
                            </>
                        }

                        {servoMoteurState === "stopped" &&
                            <>
                                <p>La porte est fermée</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("allumer")}
                                >
                                    Ouvrir
                                </button>
                            </>
                        }

                        {servoMoteurState === "defaillant" &&
                            <>
                                <p>La porte est défaillante</p>
                                <button type="button" disabled={true}>
                                    Fermer
                                </button>
                            </>
                        }
                    </div>
                    <hr />
                    <div className="servoMoteurDetails-angle">
                        <div className="servoMoteurDetails-item-angle">
                            <div className="servoMoteurDetails-jaugeAngle">
                                <div
                                    className={`servoMoteurDetails-jauge-graphique ${obtenir_classe_angle_porte(anglePorte)}`}
                                >
                                    <span
                                        className="servoMoteurDetails-angle-aiguille"
                                        style={{ transform: `rotate(${anglePorte}deg)` }}
                                    ></span>
                                </div>
                            </div>
                            <strong>{anglePorte}°</strong>
                            <span>Angle d'ouverture</span>
                        </div>
                    </div>
                </section>
            </div>

            <InstructionModal
                actionneur="porte"
                action={modalAction}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmInstruction}
            />
        </div>
    );
}

export default ServoMoteurDetails;
