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
import { creer_instruction_simule } from "../../utils/actionneur";
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

function RapportsServoMoteur() {
    const navigate = useNavigate();

    const [etatPorte, setEtatPorte] = useState("stopped");
    const [historique, setHistorique] = useState([]);
    const [grandeurs, setGrandeurs] = useState({});
    const [dateDebutGraph, setDateDebutGraph] = useState(IL_Y_A_7J);
    const [dateFinGraph, setDateFinGraph] = useState(AUJOURD_HUI);
    const [etatsGraph, setEtatsGraph] = useState({ running: true, stopped: true, defaillant: true });
    const [formatGraph, setFormatGraph] = useState("csv");
    const [chargementGraph, setChargementGraph] = useState(false);
    const [erreurGraph, setErreurGraph] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    const [instructions, setInstructions] = useState([]);
    const [dateDebutInstr, setDateDebutInstr] = useState(IL_Y_A_7J);
    const [dateFinInstr, setDateFinInstr] = useState(AUJOURD_HUI);
    const [filtreStatut, setFiltreStatut] = useState("tous");
    const [recherche, setRecherche] = useState("");
    const [formatInstr, setFormatInstr] = useState("csv");
    const [chargementInstr, setChargementInstr] = useState(false);
    const [erreurInstr, setErreurInstr] = useState(null);

    useEffect(() => {
        charger_historique_actionneur_rapport("servo-moteur", setHistorique);
        charger_grandeurs_actionneur("servo-moteur", setGrandeurs);
        charger_instructions_actionneur("servo-moteur", setInstructions);
    }, []);

    const handleToggleEtat = (etat) => setEtatsGraph((prev) => ({ ...prev, [etat]: !prev[etat] }));

    const handleGenererGraph = () => {
        const etatsSelectionnes = Object.keys(etatsGraph).filter((k) => etatsGraph[k]);
        generer_rapport_actionneur("servo-moteur", formatGraph, dateDebutGraph, dateFinGraph, etatsSelectionnes, setChargementGraph, setErreurGraph);
    };

    const handleConfirmInstruction = (dureeMinutes) => {
        creer_instruction_simule("servo-moteur", modalAction, dureeMinutes);
        if (modalAction === "allumer") setEtatPorte("running");
        else if (modalAction === "arreter") setEtatPorte("stopped");
        setIsModalOpen(false);
        setModalAction(null);
    };

    const handleGenererInstructions = () => {
        generer_rapport_instructions("servo-moteur", formatInstr, dateDebutInstr, dateFinInstr, setChargementInstr, setErreurInstr);
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
            const actionLabel = instr.action === "allumer" ? "ouvrir" : "fermer";
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
                    <h1 className="rapport-titre">Rapport Porte CO2</h1>
                    <p className="rapport-sous-titre">Contrôle par le CO2 (GPIO 18) — capteur SEN0159 · Ouverte si CO2 élevé</p>
                </header>

                <section className="rapport-section">
                    <div className="rapport-section-heading"><h2>Historique d'activité</h2></div>

                    <div className="rapport-controls">
                        <div className="rapport-controls-row">
                            <div className="rapport-periode">
                                <label className="rapport-label" htmlFor="servo-debut">Du <input id="servo-debut" type="date" value={dateDebutGraph} max={dateFinGraph} onChange={(e) => setDateDebutGraph(e.target.value)} className="rapport-input-date" /></label>
                                <label className="rapport-label" htmlFor="servo-fin">Au <input id="servo-fin" type="date" value={dateFinGraph} min={dateDebutGraph} max={AUJOURD_HUI} onChange={(e) => setDateFinGraph(e.target.value)} className="rapport-input-date" /></label>
                            </div>
                            <fieldset className="rapport-etats">
                                <legend className="rapport-etats-legend">États à afficher</legend>
                                <label className="rapport-checkbox"><input type="checkbox" checked={etatsGraph.running} onChange={() => handleToggleEtat("running")} /><span className="rapport-dot vert" aria-hidden="true"></span>Ouverte</label>
                                <label className="rapport-checkbox"><input type="checkbox" checked={etatsGraph.stopped} onChange={() => handleToggleEtat("stopped")} /><span className="rapport-dot orange" aria-hidden="true"></span>Fermée</label>
                                <label className="rapport-checkbox"><input type="checkbox" checked={etatsGraph.defaillant} onChange={() => handleToggleEtat("defaillant")} /><span className="rapport-dot rouge" aria-hidden="true"></span>Défaillante</label>
                            </fieldset>
                            <fieldset className="rapport-format">
                                <legend className="rapport-etats-legend">Format</legend>
                                <label className="rapport-radio"><input type="radio" name="fmt-servo" value="csv" checked={formatGraph === "csv"} onChange={() => setFormatGraph("csv")} />CSV</label>
                                <label className="rapport-radio"><input type="radio" name="fmt-servo" value="pdf" checked={formatGraph === "pdf"} onChange={() => setFormatGraph("pdf")} />PDF</label>
                            </fieldset>
                        </div>
                        <button type="button" className="rapport-btn-generer" onClick={handleGenererGraph} disabled={chargementGraph}>
                            <span className="material-symbols-outlined" aria-hidden="true">download</span>
                            {chargementGraph ? "Génération en cours…" : "Générer le rapport"}
                        </button>
                        {erreurGraph && <p className="rapport-erreur" role="alert">{erreurGraph}</p>}
                    </div>

                    <div className="rapport-graph-wrapper">
                        <GrapheBatonnet historique={historiqueFiltré} vocabulaire={{ running: "Ouverte", stopped: "Fermée", defaillant: "Défaillante" }} />
                    </div>
                    <div className="rapport-legende">
                        <div className="rapport-legende-item"><span className="rapport-dot vert" aria-hidden="true"></span>Ouverte</div>
                        <div className="rapport-legende-item"><span className="rapport-dot orange" aria-hidden="true"></span>Fermée</div>
                        <div className="rapport-legende-item"><span className="rapport-dot rouge" aria-hidden="true"></span>Défaillante</div>
                    </div>

                    <div className="rapport-instruction-zone">
                        {etatPorte === "running" && (<><p>La porte est ouverte</p><button type="button" className="rapport-btn-instruction" onClick={() => { setModalAction("arreter"); setIsModalOpen(true); }}>Fermer</button></>)}
                        {etatPorte === "stopped" && (<><p>La porte est fermée</p><button type="button" className="rapport-btn-instruction" onClick={() => { setModalAction("allumer"); setIsModalOpen(true); }}>Ouvrir</button></>)}
                        {etatPorte === "defaillant" && (<><p>La porte est défaillante</p><button type="button" className="rapport-btn-instruction" disabled>Fermer</button></>)}
                    </div>

                    {grandeurs.co2 !== undefined && (
                        <div className="rapport-grandeurs">
                            <div className="rapport-grandeur-item">
                                <div className="rapport-grandeur-cercle">{grandeurs.co2}<span className="rapport-grandeur-unite">ppm</span></div>
                                <span className="rapport-grandeur-label">CO2 actuel</span>
                            </div>
                        </div>
                    )}
                </section>

                <section className="rapport-section">
                    <div className="rapport-section-heading"><h2>Historique des instructions</h2><p>Liste des commandes envoyées à la porte.</p></div>

                    <div className="rapport-instructions-filtres">
                        <div className="rapport-filtres-row">
                            <div className="rapport-periode">
                                <label className="rapport-label" htmlFor="instr-servo-debut">Du <input id="instr-servo-debut" type="date" value={dateDebutInstr} max={dateFinInstr} onChange={(e) => setDateDebutInstr(e.target.value)} className="rapport-input-date" /></label>
                                <label className="rapport-label" htmlFor="instr-servo-fin">Au <input id="instr-servo-fin" type="date" value={dateFinInstr} min={dateDebutInstr} max={AUJOURD_HUI} onChange={(e) => setDateFinInstr(e.target.value)} className="rapport-input-date" /></label>
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
                            <thead><tr><th>Date</th><th>Action</th><th>Durée</th><th>Statut</th></tr></thead>
                            <tbody>
                                {instructionsFiltrees.length === 0 ? (
                                    <tr><td colSpan={4} className="rapport-table-vide">Aucune instruction ne correspond aux critères.</td></tr>
                                ) : instructionsFiltrees.map((instr) => (
                                    <tr key={instr.id}>
                                        <td>{formater_date(instr.date_arrivee)}</td>
                                        <td>{instr.action === "allumer" ? "Ouvrir" : "Fermer"}</td>
                                        <td>{formater_duree(instr.duree)}</td>
                                        <td><span className={`rapport-badge ${instr.statut}`}>{LIBELLES_STATUT[instr.statut] ?? instr.statut}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="rapport-section-actions">
                        <fieldset className="rapport-format">
                            <legend className="rapport-etats-legend">Format</legend>
                            <label className="rapport-radio"><input type="radio" name="fmt-instr-servo" value="csv" checked={formatInstr === "csv"} onChange={() => setFormatInstr("csv")} />CSV</label>
                            <label className="rapport-radio"><input type="radio" name="fmt-instr-servo" value="pdf" checked={formatInstr === "pdf"} onChange={() => setFormatInstr("pdf")} />PDF</label>
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
                actionneur="servo-moteur"
                action={modalAction}
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setModalAction(null); }}
                onConfirm={handleConfirmInstruction}
            />
        </div>
    );
}

export default RapportsServoMoteur;
