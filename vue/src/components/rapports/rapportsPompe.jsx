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

function RapportsPompe() {
    const navigate = useNavigate();

    const [etatPompe, setEtatPompe] = useState("stopped");
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
            charger_historique_actionneur_rapport("pompe", setHistorique),
            charger_grandeurs_actionneur("pompe", setGrandeurs),
            charger_instructions_actionneur("pompe", setInstructions),
        ];
        setMicrocontroleurAllume(microcontroleur_est_actif());
        return () => intervals.forEach(clearInterval);
    }, []);

    const handleToggleEtat = (etat) => setEtatsGraph((prev) => ({ ...prev, [etat]: !prev[etat] }));

    const handleGenererGraph = () => {
        const etatsSelectionnes = Object.keys(etatsGraph).filter((k) => etatsGraph[k]);
        generer_rapport_actionneur("pompe", formatGraph, dateDebutGraph, dateFinGraph, etatsSelectionnes, setChargementGraph, setErreurGraph);
    };

    const handleConfirmInstruction = async (dureeMinutes) => {
        await creer_instruction_simule("pompe", modalAction, dureeMinutes);
        if (modalAction === "allumer") setEtatPompe("running");
        else if (modalAction === "arreter") setEtatPompe("stopped");
        setIsModalOpen(false);
        setModalAction(null);
    };

    const handleGenererInstructions = () => {
        generer_rapport_instructions("pompe", formatInstr, dateDebutInstr, dateFinInstr, setChargementInstr, setErreurInstr);
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
                    <h1 className="rapport-titre">Rapport Pompe</h1>
                    <p className="rapport-sous-titre">Contrôle par l'humidité du sol et le niveau d'eau (GPIO 5)</p>
                </header>

                <section className="rapport-section">
                    <div className="rapport-section-heading"><h2>Historique d'activité</h2></div>

                    <div className="rapport-controls">
                        <div className="rapport-controls-row">
                            <div className="rapport-periode">
                                <label className="rapport-label" htmlFor="pompe-debut">Du <input id="pompe-debut" type="date" value={dateDebutGraph} max={dateFinGraph} onChange={(e) => setDateDebutGraph(e.target.value)} className="rapport-input-date" /></label>
                                <label className="rapport-label" htmlFor="pompe-fin">Au <input id="pompe-fin" type="date" value={dateFinGraph} min={dateDebutGraph} max={AUJOURD_HUI} onChange={(e) => setDateFinGraph(e.target.value)} className="rapport-input-date" /></label>
                            </div>
                            <fieldset className="rapport-etats">
                                <legend className="rapport-etats-legend">États à afficher</legend>
                                <label className="rapport-checkbox"><input type="checkbox" checked={etatsGraph.running} onChange={() => handleToggleEtat("running")} /><span className="rapport-dot vert" aria-hidden="true"></span>En marche</label>
                                <label className="rapport-checkbox"><input type="checkbox" checked={etatsGraph.stopped} onChange={() => handleToggleEtat("stopped")} /><span className="rapport-dot orange" aria-hidden="true"></span>Arrêtée</label>
                                <label className="rapport-checkbox"><input type="checkbox" checked={etatsGraph.defaillant} onChange={() => handleToggleEtat("defaillant")} /><span className="rapport-dot rouge" aria-hidden="true"></span>Défaillante</label>
                            </fieldset>
                            <fieldset className="rapport-format">
                                <legend className="rapport-etats-legend">Format</legend>
                                <label className="rapport-radio"><input type="radio" name="fmt-pompe" value="csv" checked={formatGraph === "csv"} onChange={() => setFormatGraph("csv")} />CSV</label>
                                <label className="rapport-radio"><input type="radio" name="fmt-pompe" value="pdf" checked={formatGraph === "pdf"} onChange={() => setFormatGraph("pdf")} />PDF</label>
                            </fieldset>
                        </div>
                        <button type="button" className="rapport-btn-generer" onClick={handleGenererGraph} disabled={chargementGraph}>
                            <span className="material-symbols-outlined" aria-hidden="true">download</span>
                            {chargementGraph ? "Génération en cours…" : "Générer le rapport"}
                        </button>
                        {erreurGraph && <p className="rapport-erreur" role="alert">{erreurGraph}</p>}
                    </div>

                    <div className="rapport-graph-wrapper">
                        <GrapheBatonnet historique={historiqueFiltré} vocabulaire={{ running: "En marche", stopped: "Arrêtée", defaillant: "Défaillante" }} />
                    </div>
                    <div className="rapport-legende">
                        <div className="rapport-legende-item"><span className="rapport-dot vert" aria-hidden="true"></span>En marche</div>
                        <div className="rapport-legende-item"><span className="rapport-dot orange" aria-hidden="true"></span>Arrêtée</div>
                        <div className="rapport-legende-item"><span className="rapport-dot rouge" aria-hidden="true"></span>Défaillante</div>
                    </div>

                    <div className="rapport-instruction-zone">
                        {etatPompe === "running" && (<><p>La pompe est en marche</p><button type="button" className="rapport-btn-instruction" onClick={() => { setModalAction("arreter"); setIsModalOpen(true); }} disabled={!microcontroleurAllume}>Arrêter</button>{!microcontroleurAllume && <p className="rapport-warning">Microcontrôleur éteint — impossible d'envoyer l'instruction.</p>}</>)}
                        {etatPompe === "stopped" && (<><p>La pompe est arrêtée</p><button type="button" className="rapport-btn-instruction" onClick={() => { setModalAction("allumer"); setIsModalOpen(true); }} disabled={!microcontroleurAllume}>Allumer</button>{!microcontroleurAllume && <p className="rapport-warning">Microcontrôleur éteint — impossible d'envoyer l'instruction.</p>}</>)}
                        {etatPompe === "defaillant" && (<><p>La pompe est défaillante</p><button type="button" className="rapport-btn-instruction" disabled>Arrêter</button></>)}
                    </div>

                    <div className="rapport-grandeurs">
                        {grandeurs.humidite_sol !== undefined && (
                            <div className="rapport-grandeur-item">
                                <div className="rapport-grandeur-cercle">{grandeurs.humidite_sol}<span className="rapport-grandeur-unite">%</span></div>
                                <span className="rapport-grandeur-label">Humidité du sol</span>
                            </div>
                        )}
                        {grandeurs.niveau_eau !== undefined && (
                            <div className="rapport-grandeur-item">
                                <span className={`rapport-grandeur-statut ${grandeurs.niveau_eau === "OK" ? "ok" : "bas"}`}>
                                    <span className={`rapport-dot ${grandeurs.niveau_eau === "OK" ? "vert" : "rouge"}`} aria-hidden="true"></span>
                                    Niveau d'eau : {grandeurs.niveau_eau}
                                </span>
                                <span className="rapport-grandeur-label">Réservoir</span>
                            </div>
                        )}
                    </div>
                </section>

                <section className="rapport-section">
                    <div className="rapport-section-heading"><h2>Historique des instructions</h2><p>Liste des commandes envoyées à la pompe.</p></div>

                    <div className="rapport-instructions-filtres">
                        <div className="rapport-filtres-row">
                            <div className="rapport-periode">
                                <label className="rapport-label" htmlFor="instr-pompe-debut">Du <input id="instr-pompe-debut" type="date" value={dateDebutInstr} max={dateFinInstr} onChange={(e) => setDateDebutInstr(e.target.value)} className="rapport-input-date" /></label>
                                <label className="rapport-label" htmlFor="instr-pompe-fin">Au <input id="instr-pompe-fin" type="date" value={dateFinInstr} min={dateDebutInstr} max={AUJOURD_HUI} onChange={(e) => setDateFinInstr(e.target.value)} className="rapport-input-date" /></label>
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
                                        <td>{instr.action === "allumer" ? "Allumer" : "Arrêter"}</td>
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
                            <label className="rapport-radio"><input type="radio" name="fmt-instr-pompe" value="csv" checked={formatInstr === "csv"} onChange={() => setFormatInstr("csv")} />CSV</label>
                            <label className="rapport-radio"><input type="radio" name="fmt-instr-pompe" value="pdf" checked={formatInstr === "pdf"} onChange={() => setFormatInstr("pdf")} />PDF</label>
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
                actionneur="pompe"
                action={modalAction}
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setModalAction(null); }}
                onConfirm={handleConfirmInstruction}
            />
        </div>
    );
}

export default RapportsPompe;
