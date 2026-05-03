import { useState, useEffect } from "react";
import GrapheBatonnet from "../grapheBatonnet";
import InstructionModal from "./instructionModal";
import { charger_etat_ventilateur, charger_historique_ventilateur, charger_temperature_actuelle } from "../../../utils/actionneur";
import { charger_temperature_seuils } from "../../../utils/actionneur";
import { obtenir_classe_temperature, creer_instruction_simule } from "../../../utils/actionneur";
import '../../../assets/styles/components/application/actionneur/ventilateurDetails.css'

function VentilateurDetails({retourner}) {
    const [ventilateurState, setVentilateurState] = useState("running");
    const [temperature, setTemperature] = useState(19);
    const [historiqueVentilateur, setHistoriqueVentilateur] = useState([]);
    const [seuils, setSeuils] = useState({
        "temperature_min": 10,
        "temperature_max": 30,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    useEffect(() => {
        const intervals = [
            charger_etat_ventilateur(setVentilateurState),
            charger_temperature_actuelle(setTemperature),
            charger_historique_ventilateur(setHistoriqueVentilateur),
        ];
        charger_temperature_seuils(setSeuils);

        return () => intervals.forEach(clearInterval);
    }, []);

    const retour = () => {
        retourner();
    }

    const handleOpenModal = (action) => {
        setModalAction(action);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalAction(null);
    };

    const handleConfirmInstruction = (dureeMinutes) => {
        const instruction = creer_instruction_simule("ventilateur", modalAction, dureeMinutes);
        console.log("Instruction créée :", instruction);

        // Simuler le changement d'état
        if (modalAction === "allumer") {
            setVentilateurState("running");
        } else if (modalAction === "arreter") {
            setVentilateurState("stopped");
        }

        handleCloseModal();
    };

    return (
        <div className="ventilateurDetails-root">
            <header className="ventilateurDetails-header">
                <button
                    type="button"
                    className="ventilateurDetails-retour"
                    onClick={() => {
                        retour();
                    }}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                    Retour
                </button>
                <h1 className="ventilateurDetails-titre">Ventilateur</h1>
            </header>
            <div className="ventilateurDetails-content">
                <section className="ventilateurDetails-state-graph">
                    <a
                        href="#"
                    >
                        Voir plus
                    </a>
                    <div className="ventilateurDetails-graph">
                        <GrapheBatonnet
                            historique={historiqueVentilateur}
                            vocabulaire={{
                                running: "En marche",
                                stopped: "Arrêté",
                                defaillant: "Défaillant",
                            }}
                        />
                    </div>
                    <div className="ventilateurDetails-legende">
                        <div className="ventilateurDetails-item-legende">
                            <span className="ventilateurDetails-point vert"></span>
                            <p>En marche</p>
                        </div>
                        <div className="ventilateurDetails-item-legende">
                            <span className="ventilateurDetails-point orange"></span>
                            <p>Arrêté</p>
                        </div>
                        <div className="ventilateurDetails-item-legende">
                            <span className="ventilateurDetails-point rouge"></span>
                            <p>Défaillant</p>
                        </div>
                    </div>
                </section>
                <section className="ventilateurDetails-other">
                    <div className="ventilateurDetails-instruction">
                        {ventilateurState === "running" &&
                            <>
                                <p>Le ventilateur est allumé</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("arreter")}
                                >
                                    Arrêter
                                </button>
                            </>
                        }

                        {ventilateurState === "stopped" &&
                            <>
                                <p>Le ventilateur est éteint</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("allumer")}
                                >
                                    Allumer
                                </button>
                            </>
                        }

                        {ventilateurState === "defaillant" &&
                            <>
                                <p>Le ventilateur est défaillant</p>
                                <button
                                    type="button"
                                    disabled={true}
                                >
                                    Arrêter
                                </button>
                            </>
                        }
                    </div>
                    <hr />
                    <div className="ventilateurDetails-temperature">
                        <a
                            className={`ventilateurDetails-item-temperature ${obtenir_classe_temperature(temperature, seuils)}`}
                        >
                            {temperature}°C
                        </a>
                    </div>
                </section>
            </div>

            <InstructionModal
                actionneur="ventilateur"
                action={modalAction}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmInstruction}
            />
        </div>
    )
}

export default VentilateurDetails;
