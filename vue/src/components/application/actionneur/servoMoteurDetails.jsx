import { useState, useEffect } from "react";
import GrapheBatonnet from "../grapheBatonnet";
import InstructionModal from "./instructionModal";
import {
    charger_etat_servo_moteur,
    charger_historique_servo_moteur,
    charger_co2_actuel,
    chargerCo2Seuil,
    obtenir_classe_co2,
    creer_instruction_simule,
    microcontroleur_est_actif,
} from "../../../utils/actionneur";
import "../../../assets/styles/components/application/actionneur/servoMoteurDetails.css";

function ServoMoteurDetails({ retourner }) {
    const [servoMoteurState, setServoMoteurState] = useState("stopped");
    const [co2, setCo2] = useState(45);
    const [co2Seuils, setCo2Seuils] = useState({ co2_min: 20, co2_max: 70 });
    const [historiqueServoMoteur, setHistoriqueServoMoteur] = useState([]);
    const [microcontroleurAllume, setMicrocontroleurAllume] = useState(microcontroleur_est_actif());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSendingInstruction, setIsSendingInstruction] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    useEffect(() => {
        const intervals = [
            charger_etat_servo_moteur(setServoMoteurState),
            charger_co2_actuel(setCo2),
            charger_historique_servo_moteur(setHistoriqueServoMoteur),
        ];
        chargerCo2Seuil(setCo2Seuils);
        setMicrocontroleurAllume(microcontroleur_est_actif());

        return () => intervals.forEach(clearInterval);
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

    const handleConfirmInstruction = async (dureeMinutes) => {
        if (isSendingInstruction) return;

        setIsSendingInstruction(true);

        try {
            const instruction = await creer_instruction_simule("porte", modalAction, dureeMinutes);
            console.log("Instruction créée :", instruction);

            if (modalAction === "allumer") {
                setServoMoteurState("running");
            } else if (modalAction === "arreter") {
                setServoMoteurState("stopped");
            }

            handleCloseModal();
        } finally {
            setIsSendingInstruction(false);
        }
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
                <p className="servoMoteurDetails-eyebrow">Air et CO2</p>
                <h1 className="servoMoteurDetails-titre">Porte de ventilation</h1>
            </header>
            <div className="servoMoteurDetails-content">
                <section className="servoMoteurDetails-state-graph">
                    <a href="#">Historique complet</a>
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
                                <p>La porte ventile la serre</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("arreter")}
                                    disabled={!microcontroleurAllume || isSendingInstruction}
                                >
                                    Fermer
                                </button>
                                {!microcontroleurAllume && <p className="servoMoteurDetails-warning">Microcontrôleur éteint — impossible d'envoyer l'instruction.</p>}
                            </>
                        }

                        {servoMoteurState === "stopped" &&
                            <>
                                <p>La porte garde l’air stable</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("allumer")}
                                    disabled={!microcontroleurAllume || isSendingInstruction}
                                >
                                    Ouvrir
                                </button>
                                {!microcontroleurAllume && <p className="servoMoteurDetails-warning">Microcontrôleur éteint — impossible d'envoyer l'instruction.</p>}
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
                    <div className="servoMoteurDetails-co2">
                        <a className={`servoMoteurDetails-item-co2 ${obtenir_classe_co2(co2, co2Seuils)}`}>
                            {co2}%
                        </a>
                        <span>Qualité de l'air (CO2)</span>
                        <p className="servoMoteurDetails-co2-explication">
                            {co2 > co2Seuils.co2_max
                                ? "CO2 élevé — la porte s'ouvre pour ventiler."
                                : co2 < co2Seuils.co2_min
                                    ? "CO2 bas — la porte reste fermée."
                                    : "Qualité de l'air normale — porte fermée."}
                        </p>
                    </div>
                </section>
            </div>

            <InstructionModal
                actionneur="porte"
                action={modalAction}
                isOpen={isModalOpen}
                isSubmitting={isSendingInstruction}
                onClose={handleCloseModal}
                onConfirm={handleConfirmInstruction}
            />
        </div>
    );
}

export default ServoMoteurDetails;
