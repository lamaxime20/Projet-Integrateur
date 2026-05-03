import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GrapheBatonnet from "../application/grapheBatonnet";
import InstructionModal from "../application/actionneur/instructionModal";
import {
    charger_historique_actionneur_rapport,
    charger_grandeurs_actionneur,
    charger_instructions_actionneur,
} from "../../utils/statistiques";
import { generer_rapport_actionneur, generer_rapport_instructions } from "../../utils/rapport";
import { creer_instruction_simule, microcontroleur_est_actif } from "../../utils/actionneur";
import "../../assets/styles/components/rapports/rapportActionneur.css";

const AUJOURD_HUI = new Date().toISOString().split("T")[0];
const IL_Y_A_7J = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

function formater_duree(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

function formater_date(isoString) {
    return new Date(isoString).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

const LIBELLES_STATUT = { termine: "Terminé", en_cours: "En cours", en_attente: "En attente", annule: "Annulé" };

function RapportsVentilateur() {
    const navigate = useNavigate();

    // Section 1
    const [etatVentilateur, setEtatVentilateur] = useState("running");
    const [historique, setHistorique] = useState([]);
    const [grandeurs, setGrandeurs] = useState({});
    const [microcontroleurAllume, setMicrocontroleurAllume] = useState(microcontroleur_est_actif());
    const [dateDebutGraph, setDateDebutGraph] = useState(IL_Y_A_7J);
    const [dateFinGraph, setDateFinGraph] = useState(AUJOURD_HUI);
    const [etatsGraph, setEtatsGraph] = useState({ running: true, stopped: true, defaillant: true });
    const [formatGraph, setFormatGraph] = useState("csv");
    const [chargementGraph, setChargementGraph] = useState(false);
    const [erreurGraph, setErreurGraph] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    // Section 2
    const [instructions, setInstructions] = useState([]);
    const [dateDebutInstr, setDateDebutInstr] = useState(IL_Y_A_7J);
    const [dateFinInstr, setDateFinInstr] = useState(AUJOURD_HUI);
    const [filtreStatut, setFiltreStatut] = useState("tous");
    const [recherche, setRecherche] = useState("");
    const [formatInstr, setFormatInstr] = useState("csv");
    const [chargementInstr, setChargementInstr] = useState(false);
    const [erreurInstr, setErreurInstr] = useState(null);

    useEffect(() => {
        const intervals = [
            charger_historique_actionneur_rapport("ventilateur", setHistorique),
            charger_grandeurs_actionneur("ventilateur", setGrandeurs),
            charger_instructions_actionneur("ventilateur", setInstructions),
        ];
        setMicrocontroleurAllume(microcontroleur_est_actif());
        return () => intervals.forEach(clearInterval);
    }, []);

    const handleToggleEtat = (etat) => setEtatsGraph((prev) => ({ ...prev, [etat]: !prev[etat] }));

    const handleGenererGraph = () => {
        const etatsSelectionnes = Object.keys(etatsGraph).filter((k) => etatsGraph[k]);
        generer_rapport_actionneur("ventilateur", formatGraph, dateDebutGraph, dateFinGraph, etatsSelectionnes, setChargementGraph, setErreurGraph);
    };

    const handleConfirmInstruction = async (dureeMinutes) => {
        await creer_instruction_simule("ventilateur", modalAction, dureeMinutes);
        if (modalAction === "allumer") setEtatVentilateur("running");
        else if (modalAction === "arreter") setEtatVentilateur("stopped");
        setIsModalOpen(false);
        setModalAction(null);
    };

    const handleGenererInstructions = () => {
        generer_rapport_instructions("ventilateur", formatInstr, dateDebutInstr, dateFinInstr, setChargementInstr, setErreurInstr);
    };

    const historiqueFiltré = historique.filter((p) => etatsGraph[p.etat]);

    const instructionsFiltrees = instructions.filter((instr) => {
        const dateInstr = new Date(instr.date_arrivee);
        const debut = new Date(dateDebutInstr);
        const fin = new Date(dateFinInstr);
        fin.setHours(23, 59, 59);
        if (dateInstr < debut || dateInstr > fin) return false;
        if (filtreStatut !== "tous" && instr.statut !== filtreStatut) return false;
        if (recherche) {
            const q = recherche.toLowerCase();
            const actionLabel = instr.action === "allumer" ? "allumer" : "arrêter";
            if (!actionLabel.includes(q) && !formater_duree(instr.duree).includes(q) && !formater_date(instr.date_arrivee).includes(q)) return false;
        }
        return true;
    });

    return (
        <div className="rapport-root">
            <div className="rapport-shell">
                <header className="rapport-header">
                    <button type="button" className="rapport-retour" onClick={() => navigate("/application/statistique")}>
                        <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                        Retour
                    </button>
                    <h1 className="rapport-titre">Rapport Ventilateur</h1>
                    <p className="rapport-sous-titre">Contrôle par la température (GPIO 6) — capteur DHT22</p>
                </header>

                {/* ── Section 1 : Historique ── */}
                <section className="rapport-section">
                    <div className="rapport-section-heading">
                        <h2>Historique d'activité</h2>
                    </div>

                    <div className="rapport-controls">
                        <div className="rapport-controls-row">
                            <div className="rapport-periode">
                                <label className="rapport-label" htmlFor="vent-debut">
                                    Du
                                    <input id="vent-debut" type="date" value={dateDebutGraph} max={dateFinGraph} onChange={(e) => setDateDebutGraph(e.target.value)} className="rapport-input-date" />
                                </label>
                                <label className="rapport-label" htmlFor="vent-fin">
                                    Au
                                    <input id="vent-fin" type="date" value={dateFinGraph} min={dateDebutGraph} max={AUJOURD_HUI} onChange={(e) => setDateFinGraph(e.target.value)} className="rapport-input-date" />
                                </label>
                            </div>
                            <fieldset className="rapport-etats">
                                <legend className="rapport-etats-legend">États à afficher</legend>
                                <label className="rapport-checkbox">
                                    <input type="checkbox" checked={etatsGraph.running} onChange={() => handleToggleEtat("running")} />
                                    <span className="rapport-dot vert" aria-hidden="true"></span>En marche
                                </label>
                                <label className="rapport-checkbox">
                                    <input type="checkbox" checked={etatsGraph.stopped} onChange={() => handleToggleEtat("stopped")} />
                                    <span className="rapport-dot orange" aria-hidden="true"></span>Arrêté
                                </label>
                                <label className="rapport-checkbox">
                                    <input type="checkbox" checked={etatsGraph.defaillant} onChange={() => handleToggleEtat("defaillant")} />
                                    <span className="rapport-dot rouge" aria-hidden="true"></span>Défaillant
                                </label>
                            </fieldset>
                            <fieldset className="rapport-format">
                                <legend className="rapport-etats-legend">Format</legend>
                                <label className="rapport-radio"><input type="radio" name="fmt-vent" value="csv" checked={formatGraph === "csv"} onChange={() => setFormatGraph("csv")} />CSV</label>
                                <label className="rapport-radio"><input type="radio" name="fmt-vent" value="pdf" checked={formatGraph === "pdf"} onChange={() => setFormatGraph("pdf")} />PDF</label>
                            </fieldset>
                        </div>
                        <button type="button" className="rapport-btn-generer" onClick={handleGenererGraph} disabled={chargementGraph}>
                            <span className="material-symbols-outlined" aria-hidden="true">download</span>
                            {chargementGraph ? "Génération en cours…" : "Générer le rapport"}
                        </button>
                        {erreurGraph && <p className="rapport-erreur" role="alert">{erreurGraph}</p>}
                    </div>

                    <div className="rapport-graph-wrapper">
                        <GrapheBatonnet historique={historiqueFiltré} vocabulaire={{ running: "En marche", stopped: "Arrêté", defaillant: "Défaillant" }} />
                    </div>
                    <div className="rapport-legende">
                        <div className="rapport-legende-item"><span className="rapport-dot vert" aria-hidden="true"></span>En marche</div>
                        <div className="rapport-legende-item"><span className="rapport-dot orange" aria-hidden="true"></span>Arrêté</div>
                        <div className="rapport-legende-item"><span className="rapport-dot rouge" aria-hidden="true"></span>Défaillant</div>
                    </div>

                    <div className="rapport-instruction-zone">
                        {etatVentilateur === "running" && (
                            <>
                                <p>Le ventilateur est en marche</p>
                                <button type="button" className="rapport-btn-instruction" onClick={() => { setModalAction("arreter"); setIsModalOpen(true); }} disabled={!microcontroleurAllume}>Arrêter</button>
                                {!microcontroleurAllume && <p className="rapport-warning">Microcontrôleur éteint — impossible d'envoyer l'instruction.</p>}
                            </>
                        )}
                        {etatVentilateur === "stopped" && (
                            <>
                                <p>Le ventilateur est arrêté</p>
                                <button type="button" className="rapport-btn-instruction" onClick={() => { setModalAction("allumer"); setIsModalOpen(true); }} disabled={!microcontroleurAllume}>Allumer</button>
                                {!microcontroleurAllume && <p className="rapport-warning">Microcontrôleur éteint — impossible d'envoyer l'instruction.</p>}
                            </>
                        )}
                        {etatVentilateur === "defaillant" && (
                            <>
                                <p>Le ventilateur est défaillant</p>
                                <button type="button" className="rapport-btn-instruction" disabled>Arrêter</button>
                            </>
                        )}
                    </div>

                    {grandeurs.temperature !== undefined && (
                        <div className="rapport-grandeurs">
                            <div className="rapport-grandeur-item">
                                <div className="rapport-grandeur-cercle">{grandeurs.temperature}°C</div>
                                <span className="rapport-grandeur-label">Température</span>
                            </div>
                            {grandeurs.humidite_air !== undefined && (
                                <div className="rapport-grandeur-item">
                                    <div className="rapport-grandeur-cercle">{grandeurs.humidite_air}<span className="rapport-grandeur-unite">%</span></div>
                                    <span className="rapport-grandeur-label">Humidité de l'air</span>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* ── Section 2 : Instructions ── */}
                <section className="rapport-section">
                    <div className="rapport-section-heading">
                        <h2>Historique des instructions</h2>
                        <p>Liste des commandes envoyées au ventilateur.</p>
                    </div>

                    <div className="rapport-instructions-filtres">
                        <div className="rapport-filtres-row">
                            <div className="rapport-periode">
                                <label className="rapport-label" htmlFor="instr-vent-debut">
                                    Du <input id="instr-vent-debut" type="date" value={dateDebutInstr} max={dateFinInstr} onChange={(e) => setDateDebutInstr(e.target.value)} className="rapport-input-date" />
                                </label>
                                <label className="rapport-label" htmlFor="instr-vent-fin">
                                    Au <input id="instr-vent-fin" type="date" value={dateFinInstr} min={dateDebutInstr} max={AUJOURD_HUI} onChange={(e) => setDateFinInstr(e.target.value)} className="rapport-input-date" />
                                </label>
                            </div>
                            <select className="rapport-select" value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} aria-label="Filtrer par statut">
                                <option value="tous">Tous les statuts</option>
                                <option value="en_attente">En attente</option>
                                <option value="en_cours">En cours</option>
                                <option value="termine">Terminé</option>
                                <option value="annule">Annulé</option>
                            </select>
                            <input type="search" className="rapport-input-search" placeholder="Rechercher (action, durée, date…)" value={recherche} onChange={(e) => setRecherche(e.target.value)} aria-label="Rechercher une instruction" />
                        </div>
                    </div>

                    <div className="rapport-table-wrapper">
                        <table className="rapport-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Action</th>
                                    <th>Durée</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {instructionsFiltrees.length === 0 ? (
                                    <tr><td colSpan={4} className="rapport-table-vide">Aucune instruction ne correspond aux critères.</td></tr>
                                ) : (
                                    instructionsFiltrees.map((instr) => (
                                        <tr key={instr.id}>
                                            <td>{formater_date(instr.date_arrivee)}</td>
                                            <td>{instr.action === "allumer" ? "Allumer" : "Arrêter"}</td>
                                            <td>{formater_duree(instr.duree)}</td>
                                            <td><span className={`rapport-badge ${instr.statut}`}>{LIBELLES_STATUT[instr.statut] ?? instr.statut}</span></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="rapport-section-actions">
                        <fieldset className="rapport-format">
                            <legend className="rapport-etats-legend">Format</legend>
                            <label className="rapport-radio"><input type="radio" name="fmt-instr-vent" value="csv" checked={formatInstr === "csv"} onChange={() => setFormatInstr("csv")} />CSV</label>
                            <label className="rapport-radio"><input type="radio" name="fmt-instr-vent" value="pdf" checked={formatInstr === "pdf"} onChange={() => setFormatInstr("pdf")} />PDF</label>
                        </fieldset>
                        <button type="button" className="rapport-btn-generer" onClick={handleGenererInstructions} disabled={chargementInstr}>
                            <span className="material-symbols-outlined" aria-hidden="true">download</span>
                            {chargementInstr ? "Génération en cours…" : "Exporter les instructions"}
                        </button>
                        {erreurInstr && <p className="rapport-erreur" role="alert">{erreurInstr}</p>}
                    </div>
                </section>
            </div>

            <InstructionModal
                actionneur="ventilateur"
                action={modalAction}
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setModalAction(null); }}
                onConfirm={handleConfirmInstruction}
            />
        </div>
    );
}

export default RapportsVentilateur;
