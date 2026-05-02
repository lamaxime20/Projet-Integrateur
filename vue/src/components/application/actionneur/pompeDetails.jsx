import { useState, useEffect } from "react";
import GrapheBatonnet from "../grapheBatonnet";
import InstructionModal from "./instructionModal";
import {
    charger_etat_pompe,
    charger_historique_pompe,
    charger_humidite_sol_actuelle,
    charger_niveau_reservoir_actuel,
    charger_pompe_seuils,
    obtenir_classe_humidite_sol,
    obtenir_classe_niveau_reservoir,
    creer_instruction_simule,
} from "../../../utils/actionneur";
import "../../../assets/styles/components/application/actionneur/pompeDetails.css";

function PompeDetails({ retourner }) {
    const [pompeState, setPompeState] = useState("running");
    const [humiditeSol, setHumiditeSol] = useState(42);
    const [niveauReservoir, setNiveauReservoir] = useState(68);
    const [historiquePompe, setHistoriquePompe] = useState([]);
    const [seuils, setSeuils] = useState({
        "humidite_sol_min": 35,
        "humidite_sol_max": 75,
        "niveau_reservoir_min": 20,
        "niveau_reservoir_moyen": 45,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    useEffect(() => {
        charger_etat_pompe(setPompeState);
        charger_humidite_sol_actuelle(setHumiditeSol);
        charger_niveau_reservoir_actuel(setNiveauReservoir);
        charger_pompe_seuils(setSeuils);
        const intervalHistorique = charger_historique_pompe(setHistoriquePompe);

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
        const instruction = creer_instruction_simule("pompe", modalAction, dureeMinutes);
        console.log("Instruction créée :", instruction);

        if (modalAction === "allumer") {
            setPompeState("running");
        } else if (modalAction === "arreter") {
            setPompeState("stopped");
        }

        handleCloseModal();
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
                <h1 className="pompeDetails-titre">Pompe</h1>
            </header>
            <div className="pompeDetails-content">
                <section className="pompeDetails-state-graph">
                    <a href="#">Voir plus</a>
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
                                <p>La pompe est en marche</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("arreter")}
                                >
                                    Arrêter
                                </button>
                            </>
                        }

                        {pompeState === "stopped" &&
                            <>
                                <p>La pompe est arrêtée</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("allumer")}
                                >
                                    Allumer
                                </button>
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
                            <span className={`pompeDetails-mesure-icon ${obtenir_classe_niveau_reservoir(niveauReservoir, seuils)}`} aria-hidden="true"></span>
                            <strong>{niveauReservoir}%</strong>
                            <span>Réservoir</span>
                        </div>
                    </div>
                </section>
            </div>

            <InstructionModal
                actionneur="pompe"
                action={modalAction}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmInstruction}
            />
        </div>
    );
}

export default PompeDetails;
