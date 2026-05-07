import { useEffect, useMemo, useRef, useState } from "react";
import { charger_mesures_capteur } from "../../utils/statistiques";
import { generer_rapport_mesures_capteur } from "../../utils/rapport";
import "../../assets/styles/components/rapports/RapportCourbeCapteur.css";

const AUJOURD_HUI = new Date().toISOString().split("T")[0];
const IL_Y_A_7J = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

const LARGEUR = 1200;
const HAUTEUR = 340;
const MARGE_GAUCHE = 72;
const MARGE_DROITE = 32;
const MARGE_HAUT = 28;
const MARGE_BAS = 42;

function formaterTemps(isoString) {
    return new Date(isoString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formaterHeure(isoString) {
    return new Date(isoString).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function construireCourbe(points, largeur, hauteur) {
    if (!points.length) return { path: "", pointsSvg: [] };

    const valeurs = points.map((p) => Number(p.valeur));

    let min = Math.min(...valeurs);
    let max = Math.max(...valeurs);

    if (min === max) {
        min -= 1;
        max += 1;
    }

    const largeurGraph = largeur - MARGE_GAUCHE - MARGE_DROITE;
    const hauteurGraph = hauteur - MARGE_HAUT - MARGE_BAS;

    const pointsSvg = points.map((point, index) => {
        const x = MARGE_GAUCHE + (index / (points.length - 1 || 1)) * largeurGraph;

        const ratio = (Number(point.valeur) - min) / (max - min);

        const y =
            hauteur - MARGE_BAS - ratio * hauteurGraph;

        return {
            ...point,
            x,
            y,
        };
    });

    let path = `M ${pointsSvg[0].x} ${pointsSvg[0].y}`;

    for (let i = 0; i < pointsSvg.length - 1; i++) {
        const current = pointsSvg[i];
        const next = pointsSvg[i + 1];

        const xc = (current.x + next.x) / 2;

        path += ` C ${xc} ${current.y}, ${xc} ${next.y}, ${next.x} ${next.y}`;
    }

    return { path, pointsSvg, min, max };
}

function RapportCourbeCapteur({ capteur, titre, unite: uniteFallback }) {
    const [dateDebut, setDateDebut] = useState(IL_Y_A_7J);
    const [dateFin, setDateFin] = useState(AUJOURD_HUI);
    const [format, setFormat] = useState("csv");

    const [mesures, setMesures] = useState({
        points: [],
        unite: uniteFallback,
    });

    const [chargement, setChargement] = useState(false);
    const [chargementRapport, setChargementRapport] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [erreurRapport, setErreurRapport] = useState(null);

    const [hoverPoint, setHoverPoint] = useState(null);

    const scrollRef = useRef(null);

    useEffect(() => {
        let actif = true;

        const cached = localStorage.getItem(
            `mesures_capteur_${capteur}_${dateDebut}_${dateFin}`
        );

        if (cached) {
            setMesures(JSON.parse(cached));
        }

        const charger = async () => {
            setChargement(true);
            setErreur(null);

            try {
                const data = await charger_mesures_capteur(
                    capteur,
                    dateDebut,
                    dateFin
                );

                if (actif) {
                    setMesures(data);
                }
            } catch {
                if (actif) {
                    setErreur(
                        "Impossible de charger les mesures sur cette période."
                    );
                }
            } finally {
                if (actif) {
                    setChargement(false);
                }
            }
        };

        charger();

        return () => {
            actif = false;
        };
    }, [capteur, dateDebut, dateFin]);

    const points = mesures.points ?? [];

    const unite =
        mesures.unite === "digital"
            ? ""
            : mesures.unite ?? uniteFallback ?? "";

    const valeurs = points.map((p) => Number(p.valeur));

    const minValeur = valeurs.length ? Math.min(...valeurs) : 0;
    const maxValeur = valeurs.length ? Math.max(...valeurs) : 0;
    const moyenneValeur = valeurs.length
        ? (
            valeurs.reduce((a, b) => a + b, 0) / valeurs.length
        ).toFixed(1)
        : 0;

    const { path, pointsSvg } = useMemo(() => {
        return construireCourbe(points, LARGEUR, HAUTEUR);
    }, [points]);

    const handleGenerer = () => {
        generer_rapport_mesures_capteur(
            capteur,
            format,
            dateDebut,
            dateFin,
            setChargementRapport,
            setErreurRapport
        );
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
                        <label className="rapport-label">
                            Du
                            <input
                                type="date"
                                value={dateDebut}
                                max={dateFin}
                                onChange={(e) => setDateDebut(e.target.value)}
                                className="rapport-input-date"
                            />
                        </label>

                        <label className="rapport-label">
                            Au
                            <input
                                type="date"
                                value={dateFin}
                                min={dateDebut}
                                max={AUJOURD_HUI}
                                onChange={(e) => setDateFin(e.target.value)}
                                className="rapport-input-date"
                            />
                        </label>
                    </div>

                    <fieldset className="rapport-format">
                        <legend className="rapport-etats-legend">
                            Format
                        </legend>

                        <label className="rapport-radio">
                            <input
                                type="radio"
                                value="csv"
                                checked={format === "csv"}
                                onChange={() => setFormat("csv")}
                            />
                            CSV
                        </label>

                        <label className="rapport-radio">
                            <input
                                type="radio"
                                value="pdf"
                                checked={format === "pdf"}
                                onChange={() => setFormat("pdf")}
                            />
                            PDF
                        </label>
                    </fieldset>
                </div>

                <button
                    type="button"
                    className="rapport-btn-generer"
                    onClick={handleGenerer}
                    disabled={chargementRapport}
                >
                    <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                    >
                        download
                    </span>

                    {chargementRapport
                        ? "Génération en cours…"
                        : "Exporter les mesures"}
                </button>

                {erreurRapport && (
                    <p className="rapport-erreur">{erreurRapport}</p>
                )}
            </div>

            <div className="rapportCourbe-wrapper" ref={scrollRef}>
                {chargement && (
                    <p className="rapportCourbe-message">
                        Chargement des mesures…
                    </p>
                )}

                {!chargement && erreur && (
                    <p className="rapport-erreur">{erreur}</p>
                )}

                {!chargement && !erreur && points.length > 0 && (
                    <svg
                        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
                        className="rapportCourbe-svg"
                    >
                        {/* AXES */}
                        <line
                            x1={MARGE_GAUCHE}
                            y1={HAUTEUR - MARGE_BAS}
                            x2={LARGEUR - MARGE_DROITE}
                            y2={HAUTEUR - MARGE_BAS}
                            className="rapportCourbe-axis"
                        />

                        <line
                            x1={MARGE_GAUCHE}
                            y1={MARGE_HAUT}
                            x2={MARGE_GAUCHE}
                            y2={HAUTEUR - MARGE_BAS}
                            className="rapportCourbe-axis"
                        />

                        {/* GRADUATIONS */}
                        <text
                            x="10"
                            y={HAUTEUR - MARGE_BAS}
                            className="rapportCourbe-label"
                        >
                            0{unite}
                        </text>

                        <text
                            x="10"
                            y={(HAUTEUR - MARGE_BAS + MARGE_HAUT) / 2}
                            className="rapportCourbe-label"
                        >
                            {moyenneValeur}
                            {unite}
                        </text>

                        <text
                            x="10"
                            y={MARGE_HAUT}
                            className="rapportCourbe-label"
                        >
                            {maxValeur}
                            {unite}
                        </text>

                        {/* COURBE */}
                        <path
                            d={path}
                            className="rapportCourbe-line"
                        />

                        {/* ZONE SOUS LA COURBE */}
                        <path
                            d={`${path} 
                            L ${pointsSvg[pointsSvg.length - 1]?.x} ${HAUTEUR - MARGE_BAS}
                            L ${pointsSvg[0]?.x} ${HAUTEUR - MARGE_BAS}
                            Z`}
                            className="rapportCourbe-area"
                        />

                        {/* POINTS */}
                        {pointsSvg.map((point, index) => (
                            <g key={index}>
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="6"
                                    className="rapportCourbe-hoverZone"
                                    onMouseEnter={() =>
                                        setHoverPoint(point)
                                    }
                                    onMouseLeave={() =>
                                        setHoverPoint(null)
                                    }
                                />

                                {hoverPoint === point && (
                                    <>
                                        <line
                                            x1={point.x}
                                            y1={point.y}
                                            x2={point.x}
                                            y2={HAUTEUR - MARGE_BAS}
                                            className="rapportCourbe-dashed"
                                        />

                                        <line
                                            x1={MARGE_GAUCHE}
                                            y1={point.y}
                                            x2={point.x}
                                            y2={point.y}
                                            className="rapportCourbe-dashed"
                                        />

                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r="5"
                                            className="rapportCourbe-point"
                                        />

                                        <foreignObject
                                            x={point.x - 75}
                                            y={point.y - 85}
                                            width="150"
                                            height="70"
                                        >
                                            <div className="rapportCourbe-tooltip">
                                                <span>
                                                    {formaterTemps(
                                                        point.date_arrivee
                                                    )}
                                                </span>

                                                <strong>
                                                    {point.valeur}
                                                    {unite}
                                                </strong>
                                            </div>
                                        </foreignObject>
                                    </>
                                )}
                            </g>
                        ))}

                        {/* TEMPS */}
                        {pointsSvg.map((point, index) => {
                            if (
                                index %
                                Math.ceil(pointsSvg.length / 6) !==
                                0
                            )
                                return null;

                            return (
                                <text
                                    key={index}
                                    x={point.x}
                                    y={HAUTEUR - 10}
                                    className="rapportCourbe-time"
                                >
                                    {formaterHeure(point.date_arrivee)}
                                </text>
                            );
                        })}
                    </svg>
                )}
            </div>

            {points.length > 0 && (
                <div className="rapportCourbe-meta">
                    <span>{points.length} mesures</span>

                    <span>
                        Début :{" "}
                        {formaterTemps(points[0].date_arrivee)}
                    </span>

                    <span>
                        Fin :{" "}
                        {formaterTemps(
                            points[points.length - 1].date_arrivee
                        )}
                    </span>
                </div>
            )}
        </section>
    );
}

export default RapportCourbeCapteur;
