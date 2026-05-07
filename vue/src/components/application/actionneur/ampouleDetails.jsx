import { useState, useEffect } from "react";
import GrapheBatonnet from "../grapheBatonnet";
import InstructionModal from "./instructionModal";
import {
    charger_etat_ampoule,
    charger_historique_ampoule,
    charger_luminosite_actuelle,
    charger_luminosite_seuils,
    obtenir_classe_luminosite,
    creer_instruction_simule,
    microcontroleur_est_actif,
} from "../../../utils/actionneur";
import "../../../assets/styles/components/application/actionneur/ampouleDetails.css";

function AmpouleDetails({ retourner }) {
    const [ampouleState, setAmpouleState] = useState("running");
    const [luminosite, setLuminosite] = useState(540);
    const [historiqueAmpoule, setHistoriqueAmpoule] = useState([]);
    const [seuils, setSeuils] = useState({
        "luminosite_min": 250,
        "luminosite_max": 900,
    });
    const [microcontroleurAllume, setMicrocontroleurAllume] = useState(microcontroleur_est_actif());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSendingInstruction, setIsSendingInstruction] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    useEffect(() => {
        charger_luminosite_seuils(setSeuils);
        setMicrocontroleurAllume(microcontroleur_est_actif());

        const cleanups = [
            charger_etat_ampoule(setAmpouleState),
            charger_luminosite_actuelle(setLuminosite),
            charger_historique_ampoule(setHistoriqueAmpoule),
        ];

        return () => cleanups.forEach(fn => fn());
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
            const instruction = await creer_instruction_simule("ampoule", modalAction, dureeMinutes);
            console.log("Instruction créée :", instruction);

            if (modalAction === "allumer") {
                setAmpouleState("running");
            } else if (modalAction === "arreter") {
                setAmpouleState("stopped");
            }

            handleCloseModal();
        } finally {
            setIsSendingInstruction(false);
        }
    };

    return (
        <div className="ampouleDetails-root">
            <header className="ampouleDetails-header">
                <button
                    type="button"
                    className="ampouleDetails-retour"
                    onClick={() => {
                        retour();
                    }}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                    Retour
                </button>
                <h1 className="ampouleDetails-titre">Ampoule</h1>
            </header>
            <div className="ampouleDetails-content">
                <section className="ampouleDetails-state-graph">
                    <a href="#">Voir plus</a>
                    <div className="ampouleDetails-graph">
                        <GrapheBatonnet
                            historique={historiqueAmpoule}
                            vocabulaire={{
                                running: "Allumée",
                                stopped: "Éteinte",
                                defaillant: "Défaillante",
                            }}
                        />
                    </div>
                    <div className="ampouleDetails-legende">
                        <div className="ampouleDetails-item-legende">
                            <span className="ampouleDetails-point vert"></span>
                            <p>Allumée</p>
                        </div>
                        <div className="ampouleDetails-item-legende">
                            <span className="ampouleDetails-point orange"></span>
                            <p>Éteinte</p>
                        </div>
                        <div className="ampouleDetails-item-legende">
                            <span className="ampouleDetails-point rouge"></span>
                            <p>Défaillante</p>
                        </div>
                    </div>
                </section>
                <section className="ampouleDetails-other">
                    <div className="ampouleDetails-instruction">
                        {ampouleState === "running" &&
                            <>
                                <p>L'ampoule est allumée</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("arreter")}
                                    disabled={!microcontroleurAllume || isSendingInstruction}
                                >
                                    Éteindre
                                </button>
                                {!microcontroleurAllume && <p className="ampouleDetails-warning">Microcontrôleur éteint — impossible d'envoyer l'instruction.</p>}
                            </>
                        }

                        {ampouleState === "stopped" &&
                            <>
                                <p>L'ampoule est éteinte</p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal("allumer")}
                                    disabled={!microcontroleurAllume || isSendingInstruction}
                                >
                                    Allumer
                                </button>
                                {!microcontroleurAllume && <p className="ampouleDetails-warning">Microcontrôleur éteint — impossible d'envoyer l'instruction.</p>}
                            </>
                        }

                        {ampouleState === "defaillant" &&
                            <>
                                <p>L'ampoule est défaillante</p>
                                <button type="button" disabled={true}>
                                    Éteindre
                                </button>
                            </>
                        }
                    </div>
                    <hr />
                    <div className="ampouleDetails-luminosite">
                        <div className="ampouleDetails-item-luminosite">
                            <span
                                className={`ampouleDetails-mesure-icon ${obtenir_classe_luminosite(luminosite, seuils)}`}
                                aria-hidden="true"
                            ></span>
                            <strong>{luminosite}</strong>
                            <span>lux</span>
                        </div>
                    </div>
                </section>
            </div>

            <InstructionModal
                actionneur="ampoule"
                action={modalAction}
                isOpen={isModalOpen}
                isSubmitting={isSendingInstruction}
                onClose={handleCloseModal}
                onConfirm={handleConfirmInstruction}
            />
        </div>
    );
}

export default AmpouleDetails;
