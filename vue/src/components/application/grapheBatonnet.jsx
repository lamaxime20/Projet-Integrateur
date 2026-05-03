import { construire_batonnets_historique_actionneur } from "../../utils/actionneur";
import "../../assets/styles/components/application/grapheBatonnet.css";

const vocabulaireDefaut = {
    running: "Activé",
    stopped: "Arrêté",
    defaillant: "Défaillant",
};

function GrapheBatonnet({ historique = [], vocabulaire = vocabulaireDefaut }) {
    const batonnets = construire_batonnets_historique_actionneur(historique);

    return (
        <div className="grapheBatonnet-root">
            <div className="grapheBatonnet-y-axis" aria-hidden="true">
                <span>1 h</span>
                <span>30 min</span>
                <span>0</span>
            </div>
            <div className="grapheBatonnet-scroll" role="img" aria-label="Temps passé par état sur les douze dernières heures">
                <div className="grapheBatonnet-track">
                    {batonnets.map((batonnet, index) => (
                        <div className="grapheBatonnet-item" key={`${batonnet.heureDebut}-${batonnet.etat}-${index}`}>
                            <div className="grapheBatonnet-bar-area">
                                <span
                                    className={`grapheBatonnet-bar grapheBatonnet-bar-${batonnet.etat}`}
                                    style={{ height: `${Math.min(100, (batonnet.minutes / 60) * 100)}%` }}
                                    title={`${vocabulaire[batonnet.etat] ?? batonnet.etat} pendant ${batonnet.minutes} min`}
                                ></span>
                            </div>
                            <span className="grapheBatonnet-time">{batonnet.heureDebut}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GrapheBatonnet;
