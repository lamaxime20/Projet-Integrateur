import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { charger_microcontroleur_local, charger_etat_microcontroleur_temps_reel } from "../../utils/microcontroleur";
import { changer_microcontroleur_user } from "../../utils/microcontroleur";
import { logoutFromDatabase } from "../../utils/user";
import { DASHBOARD, ACTIONNEUR, SEUIL, STATISTIQUE, NOTIFICATION } from "../../utils/sidebar-constants";
import '../../assets/styles/components/application/sidebar.css'
import { useAuth } from "../../hooks/useAuth";

function Sidebar({ongletActif}) {
    const [microcontroleur, setMicrocontroleur] = useState(charger_microcontroleur_local());
    const [sidebarEpinglee, setSidebarEpinglee] = useState(false);
    const logout = useAuth().logout;

    useEffect(() => {
        const interval = charger_etat_microcontroleur_temps_reel(setMicrocontroleur);
        return () => clearInterval(interval);
    }, []);

    const basculerSidebarEpinglee = (event) => {
        setSidebarEpinglee((epinglee) => !epinglee);
        event.currentTarget.blur();
    };
    const onglets = [
        { id: DASHBOARD, label: "Dashboard", href: "/application/dashboard", icon: "dashboard" },
        { id: ACTIONNEUR, label: "Actionneur", href: "/application/actionneur", icon: "toggle_on" },
        { id: SEUIL, label: "Seuil", href: "/application/seuil", icon: "tune" },
        { id: STATISTIQUE, label: "Statistique", href: "/application/statistique", icon: "monitoring" },
        { id: NOTIFICATION, label: "Notification", href: "/application/notification", icon: "notifications" },
    ];

    const handleLogout = () => {
        logout();
        localStorage.clear();
        window.location.href = "/";
    }

    return (
        <nav className={`sidebar-root ${sidebarEpinglee ? "is-pinned" : ""}`} aria-label="Navigation de l'application">
            <section className="sidebar-ongletClassique">
                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={basculerSidebarEpinglee}
                    aria-label={sidebarEpinglee ? "Réduire la barre latérale" : "Épingler la barre latérale"}
                    aria-pressed={sidebarEpinglee}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">
                        {sidebarEpinglee ? "left_panel_close" : "left_panel_open"}
                    </span>
                </button>
                <div className="sidebar-header">
                    <h1>{microcontroleur?.nom}</h1>
                    <div className="sidebar-connecte">
                        <span className={`choix-microcontroleur-point ${microcontroleur?.allume ? "vert" : "rouge"}`} aria-hidden="true"></span>
                        {microcontroleur?.allume ? "Connecté" : "Pas connecté"}
                    </div>
                    <button
                        className="sidebar-change_microcontroleur"
                        onClick={() => changer_microcontroleur_user()}
                    >
                        Changer de kit
                    </button>
                </div>
                <ul className="sidebar-menu">
                    {onglets.map((onglet) => (
                        <li className={ongletActif === onglet.id ? "is-active" : ""} key={onglet.id}>
                            <Link to={onglet.href} aria-current={ongletActif === onglet.id ? "page" : undefined}>
                                <span className="material-symbols-outlined sidebar-icon" aria-hidden="true">{onglet.icon}</span>
                                <span className="sidebar-label">{onglet.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
            <section className="sidebar-otherPages">
                <a 
                    className="sidebar-otherPages-help"
                    href="/help"
                >
                    <span className="material-symbols-outlined" aria-hidden="true">help</span>
                    <span className="sidebar-label">Aide</span>
                </a>
                <a
                    className="sidebar-otherPages-settings"
                    href="/settings"
                >
                    <span className="material-symbols-outlined" aria-hidden="true">settings</span>
                    <span className="sidebar-label">Paramètres</span>
                </a>
                <button
                    type="button"
                    className="sidebar-otherPages-logout"
                    onClick={() => handleLogout()}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">logout</span>
                    <span className="sidebar-label">Déconnexion</span>
                </button>
            </section>
        </nav>
    )
}

export default Sidebar;

export { DASHBOARD, ACTIONNEUR, SEUIL, STATISTIQUE, NOTIFICATION } from "../../utils/sidebar-constants";
