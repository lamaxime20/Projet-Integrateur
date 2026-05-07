import { useEffect, useMemo, useState } from "react";
import {
    charger_dashboard_temps_reel,
    couleur_etat_dashboard,
    formater_date_dashboard,
    formater_heure_dashboard,
    libelle_etat_dashboard,
} from "../../utils/dashboard";
import "../../assets/styles/components/application/dashboard.css";

const DASHBOARD_INITIAL = {
    microcontroleur: null,
    capteurs: [],
    niveau_eau: null,
    actionneurs: [],
    analyses: {
        mesures_24h: {
            series: {},
            pagination: {
                page: 1,
                par_page: 18,
                total: 0,
                total_pages: 1,
                has_previous: false,
                has_next: false,
            },
        },
        activite_microcontroleur: [],
    },
    notifications: [],
    journal: [],
    updated_at: null,
};

function valeurMaxSerie(series) {
    const valeurs = Object.values(series ?? {})
        .flat()
        .map(point => Number(point.valeur))
        .filter(Number.isFinite);

    return Math.max(1, ...valeurs);
}

function Dashboard() {
    const [dashboard, setDashboard] = useState(DASHBOARD_INITIAL);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [mesuresPage, setMesuresPage] = useState(1);

    useEffect(() => {
        setChargement(true);
        return charger_dashboard_temps_reel(setDashboard, setErreur, setChargement, {
            mesuresPage,
            mesuresParPage: 18,
        });
    }, [mesuresPage]);

    const maxMesures = useMemo(
        () => valeurMaxSerie(dashboard.analyses?.mesures_24h?.series),
        [dashboard.analyses?.mesures_24h?.series]
    );

    const micro = dashboard.microcontroleur;
    const estEnLigne = micro?.etat === "online";
    const paginationMesures = dashboard.analyses?.mesures_24h?.pagination ?? DASHBOARD_INITIAL.analyses.mesures_24h.pagination;

    return (
        <div className="dashboard-root">
            <header className="dashboard-header">
                <div>
                    <p className="dashboard-eyebrow">Écosystème vivant</p>
                    <h1>État de la serre</h1>
                    <p>Les capteurs, équipements et alertes regroupés pour agir sans chercher.</p>
                </div>

                <div className={`dashboard-status ${estEnLigne ? "vert" : "rouge"}`}>
                    <span className="dashboard-status-dot" aria-hidden="true"></span>
                    <div>
                        <strong>{estEnLigne ? "En ligne" : "Hors ligne"}</strong>
                        <span>{micro?.nom ?? "Microcontrôleur"}</span>
                    </div>
                </div>
            </header>

            {erreur && (
                <div className="dashboard-alert">
                    <span className="material-symbols-outlined" aria-hidden="true">warning</span>
                    <span>{erreur}</span>
                </div>
            )}

            <section className="dashboard-section dashboard-overview" aria-busy={chargement}>
                <div className="dashboard-section-heading">
                    <h2>Conditions des cultures</h2>
                    <span>Mis à jour à {formater_heure_dashboard(dashboard.updated_at)}</span>
                </div>

                <div className="dashboard-kpi-grid">
                    {dashboard.capteurs.map(capteur => (
                        <article className="dashboard-kpi" key={capteur.code}>
                            <div
                                className="dashboard-kpi-ring"
                                style={{ "--progress": `${Math.min(100, Math.max(0, capteur.valeur))}%` }}
                            >
                                <span className="material-symbols-outlined" aria-hidden="true">{capteur.icone}</span>
                            </div>
                            <div>
                                <h3>{capteur.nom}</h3>
                                <strong>{capteur.valeur}<small>{capteur.unite}</small></strong>
                                <p>Dernière mesure : {formater_heure_dashboard(capteur.date_arrivee)}</p>
                            </div>
                        </article>
                    ))}

                    <article className="dashboard-kpi dashboard-reservoir">
                        <div className="dashboard-reservoir-jauge" aria-hidden="true">
                            <span style={{ height: `${dashboard.niveau_eau?.pourcentage ?? 0}%` }}></span>
                        </div>
                        <div>
                            <h3>Niveau d’eau</h3>
                            <strong>{dashboard.niveau_eau?.etat ?? "Inconnu"}</strong>
                            <p>État hydrique pour l’irrigation.</p>
                        </div>
                    </article>
                </div>
            </section>

            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <h2>Équipements actifs</h2>
                    <span>Pompe, ventilation, lumière et porte</span>
                </div>

                <div className="dashboard-actionneurs">
                    {dashboard.actionneurs.map(actionneur => (
                        <article className="dashboard-actionneur" key={actionneur.code}>
                            <span className="material-symbols-outlined" aria-hidden="true">{actionneur.icone}</span>
                            <div>
                                <h3>{actionneur.nom}</h3>
                                <p className={couleur_etat_dashboard(actionneur.etat)}>
                                    {libelle_etat_dashboard(actionneur.etat)}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="dashboard-section dashboard-analytics">
                <div className="dashboard-section-heading">
                    <h2>Tendances utiles</h2>
                    <span>Dernières 24 heures · page {paginationMesures.page}/{paginationMesures.total_pages}</span>
                </div>

                <div className="dashboard-chart">
                    {Object.entries(dashboard.analyses?.mesures_24h?.series ?? {}).map(([code, points]) => (
                        <div className={`dashboard-chart-row ${code}`} key={code}>
                            <span>{code.replace("_", " ")}</span>
                            <div>
                                {points.slice(-18).map((point, index) => (
                                    <i
                                        key={`${point.date_arrivee}-${index}`}
                                        style={{ height: `${Math.max(8, (point.valeur / maxMesures) * 100)}%` }}
                                        title={`${point.valeur} à ${formater_heure_dashboard(point.date_arrivee)}`}
                                    ></i>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-pagination" aria-label="Pagination des mesures">
                    <button
                        type="button"
                        onClick={() => setMesuresPage(page => Math.max(1, page - 1))}
                        disabled={!paginationMesures.has_previous || chargement}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
                        Plus récent
                    </button>
                    <span>{paginationMesures.total} mesures</span>
                    <button
                        type="button"
                        onClick={() => setMesuresPage(page => page + 1)}
                        disabled={!paginationMesures.has_next || chargement}
                    >
                        Plus ancien
                        <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                    </button>
                </div>

                <div className="dashboard-activity">
                    {dashboard.analyses?.activite_microcontroleur?.map((periode, index) => (
                        <span
                            key={`${periode.debut}-${index}`}
                            className={couleur_etat_dashboard(periode.etat)}
                            title={`${libelle_etat_dashboard(periode.etat)} de ${formater_heure_dashboard(periode.debut)} à ${formater_heure_dashboard(periode.fin)}`}
                        ></span>
                    ))}
                </div>
            </section>

            <section className="dashboard-lists">
                <article className="dashboard-section">
                    <div className="dashboard-section-heading">
                        <h2>Alertes</h2>
                        <span>{dashboard.notifications.length} récentes</span>
                    </div>

                    <div className="dashboard-feed">
                        {dashboard.notifications.length === 0 && <p>Aucune alerte récente.</p>}
                        {dashboard.notifications.map(notification => (
                            <div className="dashboard-feed-item" key={notification.id}>
                                <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
                                <div>
                                    <strong>{notification.type}</strong>
                                    <p>{notification.message}</p>
                                    <small>{formater_date_dashboard(notification.date_arrivee)}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="dashboard-section">
                    <div className="dashboard-section-heading">
                    <h2>Activité</h2>
                    <span>Derniers gestes du système</span>
                    </div>

                    <div className="dashboard-feed">
                        {dashboard.journal.length === 0 && <p>Aucun événement récent.</p>}
                        {dashboard.journal.map((item, index) => (
                            <div className="dashboard-feed-item" key={`${item.date}-${index}`}>
                                <span className="material-symbols-outlined" aria-hidden="true">
                                    {item.type === "instruction" ? "bolt" : "history"}
                                </span>
                                <div>
                                    <strong>{item.titre}</strong>
                                    <p>{item.description}</p>
                                    <small>{formater_date_dashboard(item.date)}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );
}

export default Dashboard;
