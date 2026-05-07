import { useState, useEffect } from "react";
import GrapheBatonnet from "../grapheBatonnet";
import InstructionModal from "./instructionModal";
import { charger_etat_ventilateur, charger_historique_ventilateur, charger_temperature_actuelle, charger_temperature_seuils, obtenir_classe_temperature, creer_instruction_simule, microcontroleur_est_actif } from "../../../utils/actionneur";
import '../../../assets/styles/components/application/actionneur/ventilateurDetails.css'

function VentilateurDetails({retourner}) {
    const [ventilateurState, setVentilateurState] = useState("running");
    const [temperature, setTemperature] = useState(19);
    const [historiqueVentilateur, setHistoriqueVentilateur] = useState([]);
    const [seuils, setSeuils] = useState({
        "temperature_min": 10,
        "temperature_max": 30,
    });
    const [microcontroleurAllume, setMicrocontroleurAllume] = useState(microcontroleur_est_actif());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSendingInstruction, setIsSendingInstruction] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    useEffect(() => {
        const intervals = [
            charger_etat_ventilateur(setVentilateurState),
            charger_temperature_actuelle(setTemperature),
            charger_historique_ventilateur(setHistoriqueVentilateur),
        ];
        charger_temperature_seuils(setSeuils);
        setMicrocontroleurAllume(microcontroleur_est_actif());

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

    const handleConfirmInstruction = async (dureeMinutes) => {
        if (isSendingInstruction) return;

        setIsSendingInstruction(true);

        try {
            const instruction = await creer_instruction_simule("ventilateur", modalAction, dureeMinutes);
            console.log("Instruction créée :", instruction);

            // Simuler le changement d'état
            if (modalAction === "allumer") {
                setVentilateurState("running");
            } else if (modalAction === "arreter") {
                setVentilateurState("stopped");
            }

            handleCloseModal();
        } finally {
            setIsSendingInstruction(false);
        }
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
                <p className="ventilateurDetails-eyebrow">Ventilation</p>
                <h1 className="ventilateurDetails-titre">Air de la serre</h1>
            </header>
            <div className="ventilateurDetails-content">
                <section className="ventilateurDetails-state-graph">
                    <a
                        href="#"
                    >
                        Historique complet
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
                                <p>La ventilation protège la culture</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("arreter")}
                                    disabled={!microcontroleurAllume || isSendingInstruction}
                                >
                                    Arrêter
                                </button>
                                {!microcontroleurAllume && <p className="ventilateurDetails-warning">Microcontrôleur éteint — impossible d'envoyer l'instruction.</p>}
                            </>
                        }

                        {ventilateurState === "stopped" &&
                            <>
                                <p>La ventilation est en pause</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("allumer")}
                                    disabled={!microcontroleurAllume || isSendingInstruction}
                                >
                                    Allumer
                                </button>
                                {!microcontroleurAllume && <p className="ventilateurDetails-warning">Microcontrôleur éteint — impossible d'envoyer l'instruction.</p>}
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
                isSubmitting={isSendingInstruction}
                onClose={handleCloseModal}
                onConfirm={handleConfirmInstruction}
            />
        </div>
    )
}

export default VentilateurDetails;
