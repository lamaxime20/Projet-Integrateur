import { useState, useEffect } from "react";
import GrapheBatonnet from "../grapheBatonnet";
import {
    charger_etat_ampoule,
    charger_historique_ampoule,
    charger_luminosite_actuelle,
    charger_luminosite_seuils,
    obtenir_classe_luminosite,
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

    useEffect(() => {
        charger_etat_ampoule(setAmpouleState);
        charger_luminosite_actuelle(setLuminosite);
        charger_luminosite_seuils(setSeuils);
        const intervalHistorique = charger_historique_ampoule(setHistoriqueAmpoule);

        return () => clearInterval(intervalHistorique);
    }, []);

    const retour = () => {
        retourner();
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
                                <p>L’ampoule est allumée</p>
                                <button type="button">Éteindre</button>
                            </>
                        }

                        {ampouleState === "stopped" &&
                            <>
                                <p>L’ampoule est éteinte</p>
                                <button type="button">Allumer</button>
                            </>
                        }

                        {ampouleState === "defaillant" &&
                            <>
                                <p>L’ampoule est défaillante</p>
                                <button type="button" disabled={true}>Éteindre</button>
                            </>
                        }
                    </div>
                    <hr />
                    <div className="ampouleDetails-luminosite">
                        <div className={`ampouleDetails-item-luminosite ${obtenir_classe_luminosite(luminosite, seuils)}`}>
                            <span className="material-symbols-outlined" aria-hidden="true">wb_sunny</span>
                            <strong>{luminosite}</strong>
                            <span>lux</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AmpouleDetails;
