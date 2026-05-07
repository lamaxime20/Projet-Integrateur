import { useState, useEffect } from "react";
import GrapheBatonnet from "../grapheBatonnet";
import InstructionModal from "./instructionModal";
import {
    charger_etat_pompe,
    charger_historique_pompe,
    charger_humidite_sol_actuelle,
    charger_niveau_eau_actuel,
    charger_pompe_seuils,
    obtenir_classe_humidite_sol,
    obtenir_classe_niveau_eau,
    creer_instruction_simule,
    microcontroleur_est_actif,
} from "../../../utils/actionneur";
import "../../../assets/styles/components/application/actionneur/pompeDetails.css";

function PompeDetails({ retourner }) {
    const [pompeState, setPompeState] = useState("running");
    const [humiditeSol, setHumiditeSol] = useState(42);
    const [niveauEau, setNiveauEau] = useState("OK");
    const [historiquePompe, setHistoriquePompe] = useState([]);
    const [seuils, setSeuils] = useState({
        "humidite_sol_min": 30,
        "humidite_sol_max": 70,
    });
    const [microcontroleurAllume, setMicrocontroleurAllume] = useState(microcontroleur_est_actif());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSendingInstruction, setIsSendingInstruction] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    useEffect(() => {
        const intervals = [
            charger_etat_pompe(setPompeState),
            charger_humidite_sol_actuelle(setHumiditeSol),
            charger_niveau_eau_actuel(setNiveauEau),
            charger_historique_pompe(setHistoriquePompe),
        ];
        charger_pompe_seuils(setSeuils);
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
            const instruction = await creer_instruction_simule("pompe", modalAction, dureeMinutes);
            console.log("Instruction créée :", instruction);

            if (modalAction === "allumer") {
                setPompeState("running");
            } else if (modalAction === "arreter") {
                setPompeState("stopped");
            }

            handleCloseModal();
        } finally {
            setIsSendingInstruction(false);
        }
    };

    return (
        <div className="pompeDetails-root">
            <header className="pompeDetails-header">
                <button
                    type="button"
                    className="pompeDetails-retour"
                    onClick={() => {
                        retour();
                    }}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                    Retour
                </button>
                <p className="pompeDetails-eyebrow">Irrigation</p>
                <h1 className="pompeDetails-titre">Pompe d’arrosage</h1>
            </header>
            <div className="pompeDetails-content">
                <section className="pompeDetails-state-graph">
                    <a href="#">Historique complet</a>
                    <div className="pompeDetails-graph">
                        <GrapheBatonnet
                            historique={historiquePompe}
                            vocabulaire={{
                                running: "En marche",
                                stopped: "Arrêtée",
                                defaillant: "Défaillante",
                            }}
                        />
                    </div>
                    <div className="pompeDetails-legende">
                        <div className="pompeDetails-item-legende">
                            <span className="pompeDetails-point vert"></span>
                            <p>En marche</p>
                        </div>
                        <div className="pompeDetails-item-legende">
                            <span className="pompeDetails-point orange"></span>
                            <p>Arrêtée</p>
                        </div>
                        <div className="pompeDetails-item-legende">
                            <span className="pompeDetails-point rouge"></span>
                            <p>Défaillante</p>
                        </div>
                    </div>
                </section>
                <section className="pompeDetails-other">
                    <div className="pompeDetails-instruction">
                        {pompeState === "running" &&
                            <>
                                <p>La pompe irrigue la culture</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("arreter")}
                                    disabled={!microcontroleurAllume || isSendingInstruction}
                                >
                                    Arrêter
                                </button>
                                {!microcontroleurAllume && <p className="pompeDetails-warning">Microcontrôleur éteint — impossible d'envoyer l'instruction.</p>}
                            </>
                        }

                        {pompeState === "stopped" &&
                            <>
                                <p>L’irrigation est en pause</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("allumer")}
                                    disabled={!microcontroleurAllume || isSendingInstruction}
                                >
                                    Allumer
                                </button>
                                {!microcontroleurAllume && <p className="pompeDetails-warning">Microcontrôleur éteint — impossible d'envoyer l'instruction.</p>}
                            </>
                        }

                        {pompeState === "defaillant" &&
                            <>
                                <p>La pompe est défaillante</p>
                                <button type="button" disabled={true}>
                                    Arrêter
                                </button>
                            </>
                        }
                    </div>
                    <hr />
                    <div className="pompeDetails-other-mesure">
                        <div className="pompeDetails-humidite">
                            <span className={`pompeDetails-mesure-icon ${obtenir_classe_humidite_sol(humiditeSol, seuils)}`} aria-hidden="true"></span>
                            <strong>{humiditeSol}%</strong>
                            <span>Humidité</span>
                        </div>
                        <div className="pompeDetails-reservoir">
                            <span className={`pompeDetails-mesure-icon ${obtenir_classe_niveau_eau(niveauEau)}`} aria-hidden="true"></span>
                            <strong>{niveauEau}</strong>
                            <span>Réservoir</span>
                        </div>
                    </div>
                </section>
            </div>

            <InstructionModal
                actionneur="pompe"
                action={modalAction}
                isOpen={isModalOpen}
                isSubmitting={isSendingInstruction}
                onClose={handleCloseModal}
                onConfirm={handleConfirmInstruction}
            />
        </div>
    );
}

export default PompeDetails;
