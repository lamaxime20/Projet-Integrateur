import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GrapheBatonnet from "./grapheBatonnet";
import {
    charger_historique_microcontroleur,
    charger_moyennes_capteurs_7j,
    charger_etat_capteur,
    charger_temps_activation_actionneurs_7j,
} from "../../utils/statistiques";
import { generer_rapport_microcontroleur } from "../../utils/rapport";
import {
    charger_etat_ventilateur,
    charger_etat_pompe,
    charger_etat_ampoule,
    charger_etat_servo_moteur,
} from "../../utils/actionneur";
import "../../assets/styles/components/application/statistiques.css";

const AUJOURD_HUI = new Date().toISOString().split("T")[0];
const IL_Y_A_7J = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

function formater_duree_minutes(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

function PointEtat({ etat }) {
    const classe = etat === "running" ? "vert" : etat === "stopped" ? "orange" : "rouge";
    return <span className={`statistiques-dot ${classe}`} aria-hidden="true"></span>;
}

function libelleEtatCapteur(etat) {
    if (etat === "running") return "Actif";
    if (etat === "stopped") return "Inactif";
    return "Défaillant";
}

function libelleEtatActionneur(etat) {
    if (etat === "running") return "En marche";
    if (etat === "stopped") return "Arrêté";
    return "Défaillant";
}

function Statistiques() {
    const navigate = useNavigate();

    // Section 1 — Microcontrôleur
    const [historiqueMicro, setHistoriqueMicro] = useState([]);
    const [dateDebutMicro, setDateDebutMicro] = useState(IL_Y_A_7J);
    const [dateFinMicro, setDateFinMicro] = useState(AUJOURD_HUI);
    const [etatsMicro, setEtatsMicro] = useState({ running: true, stopped: true });
    const [formatMicro, setFormatMicro] = useState("csv");
    const [chargementMicro, setChargementMicro] = useState(false);
    const [erreurMicro, setErreurMicro] = useState(null);

    // Section 2 — Capteurs
    const [moyennesCapteurs, setMoyennesCapteurs] = useState(null);
    const [etatsCapteurs, setEtatsCapteurs] = useState({});

    // Section 3 — Actionneurs
    const [tempsActionneurs, setTempsActionneurs] = useState(null);
    const [etatsActionneurs, setEtatsActionneurs] = useState({});

    useEffect(() => {
        const intervals = [
            charger_historique_microcontroleur(setHistoriqueMicro),
            charger_moyennes_capteurs_7j(setMoyennesCapteurs),
            charger_temps_activation_actionneurs_7j(setTempsActionneurs),
            charger_etat_ventilateur((e) => setEtatsActionneurs((prev) => ({ ...prev, ventilateur: e }))),
            charger_etat_pompe((e) => setEtatsActionneurs((prev) => ({ ...prev, pompe: e }))),
            charger_etat_ampoule((e) => setEtatsActionneurs((prev) => ({ ...prev, ampoule: e }))),
            charger_etat_servo_moteur((e) => setEtatsActionneurs((prev) => ({ ...prev, "servo-moteur": e }))),
        ];

        const capteurs = ["co2", "humidite-sol", "luminosite", "niveau-eau", "temperature"];
        capteurs.forEach((c) =>
            intervals.push(charger_etat_capteur(c, (e) => setEtatsCapteurs((prev) => ({ ...prev, [c]: e }))))
        );

        return () => intervals.forEach(clearInterval);
    }, []);

    const handleToggleEtatMicro = (etat) => {
        setEtatsMicro((prev) => ({ ...prev, [etat]: !prev[etat] }));
    };

    const handleGenererRapportMicro = () => {
        const etatsSelectionnes = Object.keys(etatsMicro).filter((k) => etatsMicro[k]);
        generer_rapport_microcontroleur(formatMicro, dateDebutMicro, dateFinMicro, etatsSelectionnes, setChargementMicro, setErreurMicro);
    };

    const historiqueMicroFiltre = historiqueMicro.filter((p) => etatsMicro[p.etat]);

    const CAPTEURS_CONFIG = [
        { cle: "co2", label: "CO2", icone: "air", route: "/application/rapports/co2" },
        { cle: "humidite-sol", label: "Humidité du sol", icone: "water_drop", route: "/application/rapports/humidite-sol" },
        { cle: "luminosite", label: "Luminosité", icone: "light_mode", route: "/application/rapports/luminosité" },
        { cle: "niveau-eau", label: "Niveau d'eau", icone: "water", route: "/application/rapports/niveau-eau" },
        { cle: "temperature", label: "Température", icone: "device_thermostat", route: "/application/rapports/temperature" },
    ];

    const ACTIONNEURS_CONFIG = [
        { cle: "ventilateur", label: "Ventilateur", icone: "mode_fan", route: "/application/rapports/ventilateur" },
        { cle: "pompe", label: "Pompe", icone: "water_pump", route: "/application/rapports/pompe" },
        { cle: "ampoule", label: "Ampoule", icone: "lightbulb", route: "/application/rapports/ampoule" },
        { cle: "servo-moteur", label: "Porte CO2", icone: "door_open", route: "/application/rapports/servo-moteur" },
    ];

    const moyenneJournaliereMin = (totalMin) => {
        const parJour = Math.round(totalMin / 7);
        return formater_duree_minutes(parJour);
    };

    return (
        <div className="statistiques-root">
            <header className="statistiques-header">
                <h1 className="statistiques-titre">Statistiques</h1>
                <p>Analyse les données de ton installation sur la période souhaitée et génère des rapports.</p>
            </header>

            {/* ── Section 1 : Microcontrôleur ── */}
            <section className="statistiques-section">
                <div className="statistiques-section-heading">
                    <h2>Microcontrôleur</h2>
                    <p>Visualise les périodes où le microcontrôleur était allumé ou éteint.</p>
                </div>

                <div className="statistiques-graph-wrapper">
                    <GrapheBatonnet
                        historique={historiqueMicroFiltre}
                        vocabulaire={{ running: "Allumé", stopped: "Éteint" }}
                    />
                </div>

                <div className="statistiques-legende">
                    <div className="statistiques-legende-item">
                        <span className="statistiques-dot vert" aria-hidden="true"></span>
                        <span>Allumé</span>
                    </div>
                    <div className="statistiques-legende-item">
                        <span className="statistiques-dot orange" aria-hidden="true"></span>
                        <span>Éteint</span>
                    </div>
                </div>

                <div className="statistiques-controls">
                    <div className="statistiques-controls-row">
                        <div className="statistiques-periode">
                            <label className="statistiques-label" htmlFor="micro-date-debut">
                                Du
                                <input
                                    id="micro-date-debut"
                                    type="date"
                                    value={dateDebutMicro}
                                    max={dateFinMicro}
                                    onChange={(e) => setDateDebutMicro(e.target.value)}
                                    className="statistiques-input-date"
                                />
                            </label>
                            <label className="statistiques-label" htmlFor="micro-date-fin">
                                Au
                                <input
                                    id="micro-date-fin"
                                    type="date"
                                    value={dateFinMicro}
                                    min={dateDebutMicro}
                                    max={AUJOURD_HUI}
                                    onChange={(e) => setDateFinMicro(e.target.value)}
                                    className="statistiques-input-date"
                                />
                            </label>
                        </div>

                        <fieldset className="statistiques-etats">
                            <legend className="statistiques-etats-legend">États à afficher</legend>
                            <label className="statistiques-checkbox">
                                <input
                                    type="checkbox"
                                    checked={etatsMicro.running}
                                    onChange={() => handleToggleEtatMicro("running")}
                                />
                                <span className="statistiques-dot vert" aria-hidden="true"></span>
                                Allumé
                            </label>
                            <label className="statistiques-checkbox">
                                <input
                                    type="checkbox"
                                    checked={etatsMicro.stopped}
                                    onChange={() => handleToggleEtatMicro("stopped")}
                                />
                                <span className="statistiques-dot orange" aria-hidden="true"></span>
                                Éteint
                            </label>
                        </fieldset>

                        <fieldset className="statistiques-format">
                            <legend className="statistiques-etats-legend">Format du rapport</legend>
                            <label className="statistiques-radio">
                                <input
                                    type="radio"
                                    name="format-micro"
                                    value="csv"
                                    checked={formatMicro === "csv"}
                                    onChange={() => setFormatMicro("csv")}
                                />
                                CSV
                            </label>
                            <label className="statistiques-radio">
                                <input
                                    type="radio"
                                    name="format-micro"
                                    value="pdf"
                                    checked={formatMicro === "pdf"}
                                    onChange={() => setFormatMicro("pdf")}
                                />
                                PDF
                            </label>
                        </fieldset>
                    </div>

                    <button
                        type="button"
                        className="statistiques-btn-generer"
                        onClick={handleGenererRapportMicro}
                        disabled={chargementMicro}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">download</span>
                        {chargementMicro ? "Génération en cours…" : "Générer le rapport"}
                    </button>
                    {erreurMicro && <p className="statistiques-erreur" role="alert">{erreurMicro}</p>}
                </div>
            </section>

            {/* ── Section 2 : Capteurs ── */}
            <section className="statistiques-section">
                <div className="statistiques-section-heading">
                    <h2>Capteurs</h2>
                    <p>Mesures moyennes sur les 7 derniers jours et état actuel de chaque capteur.</p>
                </div>

                {moyennesCapteurs && (
                    <div className="statistiques-kpi-grid">
                        {[
                            { label: "Température moy.", valeur: moyennesCapteurs.temperature.valeur, unite: moyennesCapteurs.temperature.unite, icone: "device_thermostat" },
                            { label: "Humidité sol moy.", valeur: moyennesCapteurs.humiditeSol.valeur, unite: moyennesCapteurs.humiditeSol.unite, icone: "water_drop" },
                            { label: "Luminosité moy.", valeur: moyennesCapteurs.luminosite.valeur, unite: moyennesCapteurs.luminosite.unite, icone: "light_mode" },
                            { label: "CO2 moy.", valeur: moyennesCapteurs.co2.valeur, unite: moyennesCapteurs.co2.unite, icone: "air" },
                        ].map((kpi) => (
                            <div className="statistiques-kpi-card" key={kpi.label}>
                                <span className="material-symbols-outlined statistiques-kpi-icone" aria-hidden="true">{kpi.icone}</span>
                                <span className="statistiques-kpi-label">{kpi.label}</span>
                                <span className="statistiques-kpi-valeur">{kpi.valeur}<span className="statistiques-kpi-unite">{kpi.unite}</span></span>
                                <span className="statistiques-kpi-periode">7 derniers jours</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="statistiques-cards-grid">
                    {CAPTEURS_CONFIG.map((capteur) => (
                        <button
                            key={capteur.cle}
                            type="button"
                            className="statistiques-card"
                            onClick={() => navigate(capteur.route)}
                            aria-label={`Voir le rapport ${capteur.label}`}
                        >
                            <span className="material-symbols-outlined statistiques-card-icone" aria-hidden="true">{capteur.icone}</span>
                            <h3 className="statistiques-card-nom">{capteur.label}</h3>
                            <div className="statistiques-card-etat">
                                <PointEtat etat={etatsCapteurs[capteur.cle]} />
                                <span>{libelleEtatCapteur(etatsCapteurs[capteur.cle])}</span>
                            </div>
                            <span className="statistiques-card-lien">
                                Voir le rapport
                                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Section 3 : Actionneurs ── */}
            <section className="statistiques-section">
                <div className="statistiques-section-heading">
                    <h2>Actionneurs</h2>
                    <p>Temps d'activation moyen par jour sur les 7 derniers jours et état actuel de chaque actionneur.</p>
                </div>

                {tempsActionneurs && (
                    <div className="statistiques-kpi-grid">
                        {[
                            { label: "Ventilateur", cle: "ventilateur", icone: "mode_fan" },
                            { label: "Pompe", cle: "pompe", icone: "water_pump" },
                            { label: "Ampoule", cle: "ampoule", icone: "lightbulb" },
                            { label: "Porte CO2", cle: "servoMoteur", icone: "door_open" },
                        ].map((item) => (
                            <div className="statistiques-kpi-card" key={item.cle}>
                                <span className="material-symbols-outlined statistiques-kpi-icone" aria-hidden="true">{item.icone}</span>
                                <span className="statistiques-kpi-label">{item.label}</span>
                                <span className="statistiques-kpi-valeur">
                                    {moyenneJournaliereMin(tempsActionneurs[item.cle])}
                                    <span className="statistiques-kpi-unite">/jour</span>
                                </span>
                                <span className="statistiques-kpi-periode">7 derniers jours</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="statistiques-cards-grid">
                    {ACTIONNEURS_CONFIG.map((actionneur) => (
                        <button
                            key={actionneur.cle}
                            type="button"
                            className="statistiques-card"
                            onClick={() => navigate(actionneur.route)}
                            aria-label={`Voir le rapport ${actionneur.label}`}
                        >
                            <span className="material-symbols-outlined statistiques-card-icone" aria-hidden="true">{actionneur.icone}</span>
                            <h3 className="statistiques-card-nom">{actionneur.label}</h3>
                            <div className="statistiques-card-etat">
                                <PointEtat etat={etatsActionneurs[actionneur.cle]} />
                                <span>{libelleEtatActionneur(etatsActionneurs[actionneur.cle])}</span>
                            </div>
                            <span className="statistiques-card-lien">
                                Voir le rapport
                                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                            </span>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Statistiques;
