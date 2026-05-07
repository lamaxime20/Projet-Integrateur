import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    appliquer_action_notifications,
    charger_notifications_temps_reel,
    marquer_notification_lue,
    marquer_toutes_notifications_lues,
    obtenir_route_notification,
} from "../../utils/notifications";
import "../../assets/styles/components/application/notifications.css";

const FILTRES = {
    TOUTES: "toutes",
    NON_LUES: "non-lues",
    LUES: "lues",
};

function formaterDate(isoString) {
    if (!isoString) return "";

    return new Date(isoString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function obtenirIcone(type) {
    const texte = type.toLowerCase();

    if (texte.includes("temperature") || texte.includes("température")) return "device_thermostat";
    if (texte.includes("humidite") || texte.includes("humidité")) return "water_drop";
    if (texte.includes("luminosite") || texte.includes("luminosité")) return "light_mode";
    if (texte.includes("co2") || texte.includes("air")) return "air";
    if (texte.includes("eau")) return "water";
    if (texte.includes("actionneur")) return "toggle_on";
    if (texte.includes("seuil")) return "tune";

    return "notifications";
}

function Notifications() {
    const navigate = useNavigate();
    const [filtre, setFiltre] = useState(FILTRES.TOUTES);
    const [notifications, setNotifications] = useState([]);
    const [compteurs, setCompteurs] = useState({ toutes: 0, lues: 0, non_lues: 0 });
    const [selectionActive, setSelectionActive] = useState(false);
    const [selection, setSelection] = useState(() => new Set());
    const [erreur, setErreur] = useState(null);
    const [chargementAction, setChargementAction] = useState(false);
    const [notificationEnCours, setNotificationEnCours] = useState(null);
    const longPressTimer = useRef(null);
    const longPressDeclenche = useRef(false);

    useEffect(() => {
        const unsubscribe = charger_notifications_temps_reel(filtre, setNotifications, setCompteurs, setErreur);
        return () => unsubscribe();
    }, [filtre]);

    const rechargerApresAction = () => {
        charger_notifications_temps_reel(filtre, setNotifications, setCompteurs, setErreur);
    };

    const basculerSelection = (id) => {
        setSelection((selectionActuelle) => {
            const prochaineSelection = new Set(selectionActuelle);

            if (prochaineSelection.has(id)) {
                prochaineSelection.delete(id);
            } else {
                prochaineSelection.add(id);
            }

            if (prochaineSelection.size === 0) {
                setSelectionActive(false);
            }

            return prochaineSelection;
        });
    };

    const activerSelection = (id) => {
        setSelectionActive(true);
        setSelection(new Set([id]));
    };

    const annulerSelection = () => {
        setSelectionActive(false);
        setSelection(new Set());
    };

    const handleNotificationClick = async (notification) => {
        if (chargementAction || notificationEnCours) return;

        if (longPressDeclenche.current) {
            longPressDeclenche.current = false;
            return;
        }

        if (selectionActive) {
            basculerSelection(notification.id);
            return;
        }

        try {
            if (!notification.vu) {
                setNotificationEnCours(notification.id);
                await marquer_notification_lue(notification.id);
            }
        } catch (error) {
            setErreur(error.message);
        } finally {
            setNotificationEnCours(null);
            navigate(obtenir_route_notification(notification));
        }
    };

    const demarrerLongPress = (notification, event) => {
        if (event.pointerType === "mouse") return;

        longPressTimer.current = setTimeout(() => {
            longPressDeclenche.current = true;
            activerSelection(notification.id);
        }, 520);
    };

    const arreterLongPress = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const appliquerAction = async (action) => {
        const ids = Array.from(selection);
        if (ids.length === 0) return;

        setChargementAction(true);
        setErreur(null);

        try {
            await appliquer_action_notifications(ids, action);
            annulerSelection();
            rechargerApresAction();
        } catch (error) {
            setErreur(error.message);
        } finally {
            setChargementAction(false);
        }
    };

    const marquerToutLu = async () => {
        setChargementAction(true);
        setErreur(null);

        try {
            await marquer_toutes_notifications_lues();
            rechargerApresAction();
        } catch (error) {
            setErreur(error.message);
        } finally {
            setChargementAction(false);
        }
    };

    const nombreSelectionne = selection.size;

    return (
        <div className="notifications-root">
            <header className="notifications-header">
                <div>
                    <h1 className="notifications-titre">Notifications</h1>
                    <p>Consulte les alertes importantes de ton installation et traite-les rapidement.</p>
                </div>
                <button
                    type="button"
                    className="notifications-btn-secondaire"
                    onClick={marquerToutLu}
                    disabled={chargementAction || compteurs.non_lues === 0}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">done_all</span>
                    Tout marquer comme lu
                </button>
            </header>

            <section className="notifications-toolbar" aria-label="Filtres des notifications">
                <div className="notifications-filtres">
                    <button
                        type="button"
                        className={filtre === FILTRES.TOUTES ? "is-active" : ""}
                        onClick={() => setFiltre(FILTRES.TOUTES)}
                    >
                        Toutes <span>{compteurs.toutes}</span>
                    </button>
                    <button
                        type="button"
                        className={filtre === FILTRES.NON_LUES ? "is-active" : ""}
                        onClick={() => setFiltre(FILTRES.NON_LUES)}
                    >
                        Non lues <span>{compteurs.non_lues}</span>
                    </button>
                    <button
                        type="button"
                        className={filtre === FILTRES.LUES ? "is-active" : ""}
                        onClick={() => setFiltre(FILTRES.LUES)}
                    >
                        Lues <span>{compteurs.lues}</span>
                    </button>
                </div>

                <button
                    type="button"
                    className="notifications-btn-secondaire notifications-selection-toggle"
                    onClick={() => selectionActive ? annulerSelection() : setSelectionActive(true)}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">
                        {selectionActive ? "close" : "checklist"}
                    </span>
                    {selectionActive ? "Annuler" : "Sélectionner"}
                </button>
            </section>

            {selectionActive && (
                <section className="notifications-actions" aria-label="Actions sur la sélection">
                    <span>{nombreSelectionne} sélectionnée{nombreSelectionne > 1 ? "s" : ""}</span>
                    <button type="button" onClick={() => appliquerAction("marquer_lues")} disabled={chargementAction || nombreSelectionne === 0}>
                        <span className="material-symbols-outlined" aria-hidden="true">mark_email_read</span>
                        Marquer lues
                    </button>
                    <button type="button" onClick={() => appliquerAction("marquer_non_lues")} disabled={chargementAction || nombreSelectionne === 0}>
                        <span className="material-symbols-outlined" aria-hidden="true">mark_email_unread</span>
                        Marquer non lues
                    </button>
                    <button type="button" className="is-danger" onClick={() => appliquerAction("supprimer")} disabled={chargementAction || nombreSelectionne === 0}>
                        <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                        Supprimer
                    </button>
                </section>
            )}

            {erreur && <p className="notifications-erreur" role="alert">{erreur}</p>}

            <section className="notifications-liste" aria-label="Liste des notifications">
                {notifications.length === 0 ? (
                    <div className="notifications-vide">
                        <span className="material-symbols-outlined" aria-hidden="true">notifications_off</span>
                        <h2>Aucune notification</h2>
                        <p>Les nouvelles alertes apparaîtront ici dès qu’elles seront disponibles.</p>
                    </div>
                ) : notifications.map((notification) => {
                    const estSelectionnee = selection.has(notification.id);

                    return (
                        <article
                            key={notification.id}
                            className={`notifications-card ${notification.vu ? "is-read" : "is-unread"} ${estSelectionnee ? "is-selected" : ""}`}
                            onClick={() => handleNotificationClick(notification)}
                            aria-busy={notificationEnCours === notification.id}
                            onPointerDown={(event) => demarrerLongPress(notification, event)}
                            onPointerUp={arreterLongPress}
                            onPointerLeave={arreterLongPress}
                        >
                            <label className="notifications-checkbox" onClick={(event) => event.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={estSelectionnee}
                                    disabled={chargementAction || Boolean(notificationEnCours)}
                                    onChange={() => {
                                        setSelectionActive(true);
                                        basculerSelection(notification.id);
                                    }}
                                    aria-label={`Sélectionner la notification ${notification.type}`}
                                />
                            </label>

                            <div className="notifications-icone" aria-hidden="true">
                                <span className="material-symbols-outlined">{obtenirIcone(notification.type)}</span>
                            </div>

                            <div className="notifications-contenu">
                                <div className="notifications-card-header">
                                    <h2>{notification.type}</h2>
                                    {!notification.vu && <span className="notifications-badge">Non lue</span>}
                                </div>
                                <p>{notification.message}</p>
                                <time dateTime={notification.date_arrivee}>{formaterDate(notification.date_arrivee)}</time>
                            </div>

                            <span className="material-symbols-outlined notifications-arrow" aria-hidden="true">arrow_forward</span>
                        </article>
                    );
                })}
            </section>
        </div>
    );
}

export default Notifications;
