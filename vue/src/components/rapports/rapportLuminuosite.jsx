import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GrapheBatonnet from "../application/grapheBatonnet";
import RapportCourbeCapteur from "./RapportCourbeCapteur";
import { charger_historique_capteur, charger_stats_capteur } from "../../utils/statistiques";
import { generer_rapport_capteur } from "../../utils/rapport";
import "../../assets/styles/components/rapports/rapportCapteur.css";

const AUJOURD_HUI = new Date().toISOString().split("T")[0];
const IL_Y_A_7J = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

function RapportLuminuosite() {
    const navigate = useNavigate();
    const [historique, setHistorique] = useState([]);
    const [stats, setStats] = useState(null);
    const [dateDebut, setDateDebut] = useState(IL_Y_A_7J);
    const [dateFin, setDateFin] = useState(AUJOURD_HUI);
    const [etats, setEtats] = useState({ running: true, stopped: true, defaillant: true });
    const [format, setFormat] = useState("csv");
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        // Charger les données du localStorage
        const cachedHistorique = localStorage.getItem('historique_capteur_luminosite');
        if (cachedHistorique) setHistorique(JSON.parse(cachedHistorique));

        const cachedStats = localStorage.getItem('stats_capteur_luminosite');
        if (cachedStats) setStats(JSON.parse(cachedStats));

        const intervals = [
            charger_historique_capteur("luminosite", setHistorique),
            charger_stats_capteur("luminosite", setStats),
        ];
        return () => intervals.forEach(clearInterval);
    }, []);

    const handleToggleEtat = (etat) => setEtats((prev) => ({ ...prev, [etat]: !prev[etat] }));

    const handleGenerer = () => {
        const etatsSelectionnes = Object.keys(etats).filter((k) => etats[k]);
        generer_rapport_capteur("luminosite", format, dateDebut, dateFin, etatsSelectionnes, setChargement, setErreur);
    };

    const historiqueFiltré = historique.filter((p) => etats[p.etat]);

    return (
        <div className="rapport-root">
            <div className="rapport-shell">
                <header className="rapport-header">
                    <button type="button" className="rapport-retour" onClick={() => navigate("/application/statistique")}>
                        <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                        Retour
                    </button>
                    <h1 className="rapport-titre">Lumière de culture</h1>
                    <p className="rapport-sous-titre">Historique de luminosité pour comprendre l’exposition de la serre.</p>
                </header>

                <section className="rapport-section">
                    <div className="rapport-controls">
                        <div className="rapport-controls-row">
                            <div className="rapport-periode">
                                <label className="rapport-label" htmlFor="lum-debut">
                                    Du
                                    <input id="lum-debut" type="date" value={dateDebut} max={dateFin} onChange={(e) => setDateDebut(e.target.value)} className="rapport-input-date" />
                                </label>
                                <label className="rapport-label" htmlFor="lum-fin">
                                    Au
                                    <input id="lum-fin" type="date" value={dateFin} min={dateDebut} max={AUJOURD_HUI} onChange={(e) => setDateFin(e.target.value)} className="rapport-input-date" />
                                </label>
                            </div>
                            <fieldset className="rapport-etats">
                                <legend className="rapport-etats-legend">États à afficher</legend>
                                <label className="rapport-checkbox">
                                    <input type="checkbox" checked={etats.running} onChange={() => handleToggleEtat("running")} />
                                    <span className="rapport-dot vert" aria-hidden="true"></span>Actif
                                </label>
                                <label className="rapport-checkbox">
                                    <input type="checkbox" checked={etats.stopped} onChange={() => handleToggleEtat("stopped")} />
                                    <span className="rapport-dot orange" aria-hidden="true"></span>Inactif
                                </label>
                                <label className="rapport-checkbox">
                                    <input type="checkbox" checked={etats.defaillant} onChange={() => handleToggleEtat("defaillant")} />
                                    <span className="rapport-dot rouge" aria-hidden="true"></span>Défaillant
                                </label>
                            </fieldset>
                            <fieldset className="rapport-format">
                                <legend className="rapport-etats-legend">Format</legend>
                                <label className="rapport-radio"><input type="radio" name="fmt-lum" value="csv" checked={format === "csv"} onChange={() => setFormat("csv")} />CSV</label>
                                <label className="rapport-radio"><input type="radio" name="fmt-lum" value="pdf" checked={format === "pdf"} onChange={() => setFormat("pdf")} />PDF</label>
                            </fieldset>
                        </div>
                        <button type="button" className="rapport-btn-generer" onClick={handleGenerer} disabled={chargement}>
                            <span className="material-symbols-outlined" aria-hidden="true">download</span>
                            {chargement ? "Génération en cours…" : "Générer le rapport"}
                        </button>
                        {erreur && <p className="rapport-erreur" role="alert">{erreur}</p>}
                    </div>

                    <div className="rapport-graph-wrapper">
                        <GrapheBatonnet historique={historiqueFiltré} vocabulaire={{ running: "Actif", stopped: "Inactif", defaillant: "Défaillant" }} />
                    </div>
                    <div className="rapport-legende">
                        <div className="rapport-legende-item"><span className="rapport-dot vert" aria-hidden="true"></span>Actif</div>
                        <div className="rapport-legende-item"><span className="rapport-dot orange" aria-hidden="true"></span>Inactif</div>
                        <div className="rapport-legende-item"><span className="rapport-dot rouge" aria-hidden="true"></span>Défaillant</div>
                    </div>
                </section>

                <RapportCourbeCapteur capteur="luminosite" titre="Luminosité" unite="%" />

                {stats && stats.unite !== "digital" && (
                    <section className="rapport-section">
                        <div className="rapport-section-heading"><h2>Mesures sur la période</h2></div>
                        <div className="rapport-kpi-grid">
                            <div className="rapport-kpi-card">
                                <span className="rapport-kpi-label">Valeur maximale</span>
                                <span className="rapport-kpi-valeur rouge">{stats.max}<span className="rapport-kpi-unite">{stats.unite}</span></span>
                            </div>
                            <div className="rapport-kpi-card">
                                <span className="rapport-kpi-label">Valeur minimale</span>
                                <span className="rapport-kpi-valeur bleu">{stats.min}<span className="rapport-kpi-unite">{stats.unite}</span></span>
                            </div>
                            <div className="rapport-kpi-card">
                                <span className="rapport-kpi-label">Valeur moyenne</span>
                                <span className="rapport-kpi-valeur vert">{stats.moy}<span className="rapport-kpi-unite">{stats.unite}</span></span>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default RapportLuminuosite;
