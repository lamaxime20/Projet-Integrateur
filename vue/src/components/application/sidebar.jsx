import { charger_microcontroleur_local } from "../../utils/microcontroleur";
import { changer_microcontroleur_user } from "../../utils/microcontroleur";
import { logoutFromDatabase } from "../../utils/user";
import { DASHBOARD, ACTIONNEUR, SEUIL, STATISTIQUE, NOTIFICATION } from "./sidebar-constants";

function Sidebar({ongletActif}) {
    const microcontroleur = charger_microcontroleur_local();
    return (
        <nav className="sidebar-root">
            <section className="sidebar-ongletClassique">
                <div className="sidebar-header">
                    <h1>{microcontroleur.nom}</h1>
                    <div className="sidebar-connecte">
                        <span className={`choix-microcontroleur-point ${microcontroleur.allume ? "vert" : "rouge"}`} aria-hidden="true"></span>
                        {microcontroleur.allume ? "Connecté" : "Pas connecté"}
                    </div>
                    <button
                        className="sidebar-change_microcontroleur"
                        onClick={() => changer_microcontroleur_user()}
                    >
                        Changer de kit
                    </button>
                </div>
                <ul className="sidebar-menu">
                    <li className={ongletActif === DASHBOARD ? "is-active" : ""}>
                        <a href="application/dashboard">Dashboard</a>
                    </li>
                    <li className={ongletActif === ACTIONNEUR ? "is-active" : ""}>
                        <a href="application/actionneur">Actionneur</a>
                    </li>
                    <li className={ongletActif === SEUIL ? "is-active" : ""}>
                        <a href="application/seuil">Seuil</a>
                    </li>
                    <li className={ongletActif === STATISTIQUE ? "is-active" : ""}>
                        <a href="application/statistique">Statistique</a>
                    </li>
                    <li className={ongletActif === STATISTIQUE ? "is-active" : ""}>
                        <a href="application/parametre">Paramètres</a>
                    </li>
                </ul>
            </section>
            <section className="sidebar-otherPages">
                <a 
                    className="sidebar-otherPages-help"
                    href="/help"
                >
                    <span className="material-symbols-outlined" aria-hidden="true">help</span>
                    Aide
                </a>
                <a
                    className="sidebar-otherPages-settings"
                    href="/settings"
                >
                    Parametres
                </a>
                <button
                    className="sidebar-otherPages-logout"
                    onClick={() => logoutFromDatabase()}
                >
                    Deconnexion
                </button>
            </section>
        </nav>
    )
}

export default Sidebar;

export { DASHBOARD, ACTIONNEUR, SEUIL, STATISTIQUE, NOTIFICATION } from "./sidebar-constants";