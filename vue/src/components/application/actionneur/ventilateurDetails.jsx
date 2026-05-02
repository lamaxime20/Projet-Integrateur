import { useState, useEffect } from "react";
import GrapheBatonnet from "../grapheBatonnet";
import { charger_etat_ventilateur, charger_historique_ventilateur, charger_temperature_actuelle } from "../../../utils/actionneur";
import { charger_temperature_seuils } from "../../../utils/actionneur";
import { obtenir_classe_temperature } from "../../../utils/actionneur";
import '../../../assets/styles/components/application/actionneur/ventilateurDetails.css'

function VentilateurDetails({retourner}) {
    const [ventilateurState, setVentilateurState] = useState("running");
    const [temperature, setTemperature] = useState(19);
    const [historiqueVentilateur, setHistoriqueVentilateur] = useState([]);
    const [seuils, setSeuils] = useState({
        "temperature_min": 10,
        "temperature_max": 30,
    });

    useEffect(() => {
        charger_etat_ventilateur(setVentilateurState);
        charger_temperature_actuelle(setTemperature);
        charger_temperature_seuils(setSeuils);
        const intervalHistorique = charger_historique_ventilateur(setHistoriqueVentilateur);

        return () => clearInterval(intervalHistorique);
    }, []);

    const retour = () => {
        retourner();
    }

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
                                <button type="button">Arrêter</button>
                            </>
                        }

                        {ventilateurState === "stopped" && 
                            <>
                                <p>Le ventilateur est éteint</p>
                                <button type="button">Allumer</button>
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
        </div>
    )
}

export default VentilateurDetails;
