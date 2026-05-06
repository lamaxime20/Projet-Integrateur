import { useEffect, useMemo, useState } from "react";
import { charger_mesures_capteur } from "../../utils/statistiques";
import { generer_rapport_mesures_capteur } from "../../utils/rapport";
import "../../assets/styles/components/rapports/RapportCourbeCapteur.css";

const AUJOURD_HUI = new Date().toISOString().split("T")[0];
const IL_Y_A_7J = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

function formaterTemps(isoString) {
    return new Date(isoString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function construirePolyline(points, largeur, hauteur, marge) {
    if (points.length === 0) return "";

    const valeurs = points.map((point) => Number(point.valeur));
    let min = Math.min(...valeurs);
    let max = Math.max(...valeurs);

    if (min === max) {
        min -= 1;
        max += 1;
    }

    return points.map((point, index) => {
        const x = marge + (points.length === 1 ? 0 : (index / (points.length - 1)) * (largeur - marge * 2));
        const ratio = (Number(point.valeur) - min) / (max - min);
        const y = hauteur - marge - ratio * (hauteur - marge * 2);
        return `${x},${y}`;
    }).join(" ");
}

function RapportCourbeCapteur({ capteur, titre, unite: uniteFallback }) {
    const [dateDebut, setDateDebut] = useState(IL_Y_A_7J);
    const [dateFin, setDateFin] = useState(AUJOURD_HUI);
    const [format, setFormat] = useState("csv");
    const [mesures, setMesures] = useState({ points: [], unite: uniteFallback });
    const [chargement, setChargement] = useState(false);
    const [chargementRapport, setChargementRapport] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [erreurRapport, setErreurRapport] = useState(null);

    useEffect(() => {
        let actif = true;

        // Charger les données du localStorage
        const cached = localStorage.getItem(`mesures_capteur_${capteur}_${dateDebut}_${dateFin}`);
        if (cached) setMesures(JSON.parse(cached));

        const charger = async () => {
            setChargement(true);
            setErreur(null);

            try {
                const data = await charger_mesures_capteur(capteur, dateDebut, dateFin);
                if (actif) setMesures(data);
            } catch {
                if (actif) setErreur("Impossible de charger les mesures sur cette période.");
            } finally {
                if (actif) setChargement(false);
            }
        };

        charger();

        return () => {
            actif = false;
        };
    }, [capteur, dateDebut, dateFin]);

    const points = mesures.points ?? [];
    const valeurs = points.map((point) => Number(point.valeur));
    const min = valeurs.length ? Math.min(...valeurs) : null;
    const max = valeurs.length ? Math.max(...valeurs) : null;
    const polyline = useMemo(() => construirePolyline(points, 640, 260, 42), [points]);
    const unite = mesures.unite === "digital" ? "" : (mesures.unite ?? uniteFallback ?? "");

    const handleGenerer = () => {
        generer_rapport_mesures_capteur(capteur, format, dateDebut, dateFin, setChargementRapport, setErreurRapport);
    };

    return (
        <section className="rapport-section rapportCourbe-root">
            <div className="rapport-section-heading">
                <h2>Évolution des mesures</h2>
                <p>{titre} en fonction du temps.</p>
            </div>

            <div className="rapport-controls">
                <div className="rapport-controls-row">
                    <div className="rapport-periode">
                        <label className="rapport-label" htmlFor={`${capteur}-courbe-debut`}>
                            Du
                            <input
                                id={`${capteur}-courbe-debut`}
                                type="date"
                                value={dateDebut}
                                max={dateFin}
                                onChange={(event) => setDateDebut(event.target.value)}
                                className="rapport-input-date"
                            />
                        </label>
                        <label className="rapport-label" htmlFor={`${capteur}-courbe-fin`}>
                            Au
                            <input
                                id={`${capteur}-courbe-fin`}
                                type="date"
                                value={dateFin}
                                min={dateDebut}
                                max={AUJOURD_HUI}
                                onChange={(event) => setDateFin(event.target.value)}
                                className="rapport-input-date"
                            />
                        </label>
                    </div>

                    <fieldset className="rapport-format">
                        <legend className="rapport-etats-legend">Format</legend>
                        <label className="rapport-radio">
                            <input type="radio" name={`${capteur}-mesures-format`} value="csv" checked={format === "csv"} onChange={() => setFormat("csv")} />
                            CSV
                        </label>
                        <label className="rapport-radio">
                            <input type="radio" name={`${capteur}-mesures-format`} value="pdf" checked={format === "pdf"} onChange={() => setFormat("pdf")} />
                            PDF
                        </label>
                    </fieldset>
                </div>

                <button type="button" className="rapport-btn-generer" onClick={handleGenerer} disabled={chargementRapport}>
                    <span className="material-symbols-outlined" aria-hidden="true">download</span>
                    {chargementRapport ? "Génération en cours…" : "Générer le rapport des mesures"}
                </button>
                {erreurRapport && <p className="rapport-erreur" role="alert">{erreurRapport}</p>}
            </div>

            <div className="rapportCourbe-graph" aria-label={`Courbe des mesures ${titre}`}>
                {chargement && <p className="rapportCourbe-message">Chargement des mesures…</p>}
                {!chargement && erreur && <p className="rapport-erreur" role="alert">{erreur}</p>}
                {!chargement && !erreur && points.length === 0 && <p className="rapportCourbe-message">Aucune mesure sur cette période.</p>}
                {!chargement && !erreur && points.length > 0 && (
                    <svg viewBox="0 0 640 260" role="img" aria-label={`Courbe ${titre}`}>
                        <line x1="42" y1="218" x2="612" y2="218" className="rapportCourbe-axis" />
                        <line x1="42" y1="24" x2="42" y2="218" className="rapportCourbe-axis" />
                        <text x="12" y="32" className="rapportCourbe-label">{max}{unite}</text>
                        <text x="12" y="220" className="rapportCourbe-label">{min}{unite}</text>
                        <polyline points={polyline} className="rapportCourbe-line" />
                        {points.map((point, index) => {
                            const [x, y] = polyline.split(" ")[index].split(",");
                            return <circle key={`${point.date_arrivee}-${index}`} cx={x} cy={y} r="3.5" className="rapportCourbe-point" />;
                        })}
                    </svg>
                )}
            </div>

            {points.length > 0 && (
                <div className="rapportCourbe-meta">
                    <span>{points.length} mesures</span>
                    <span>Début : {formaterTemps(points[0].date_arrivee)}</span>
                    <span>Fin : {formaterTemps(points[points.length - 1].date_arrivee)}</span>
                </div>
            )}
        </section>
    );
}

export default RapportCourbeCapteur;
