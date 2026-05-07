import Sidebar from "./sidebar";
import Dashboard from "./dashboard";
import Actionneur from "./actionneur";
import Statistiques from "./statistiques";
import Seuils from "./seuils";
import Notifications from "./notifications";
import { DASHBOARD, ACTIONNEUR, SEUIL, STATISTIQUE, NOTIFICATION } from "../../utils/sidebar-constants";
import '../../assets/styles/components/application/application_principale.css'

function Application_pricipale({onglet = DASHBOARD}) {
    return (
        <section className="application_principale-root">
            <div className="application_principale-ambient" aria-hidden="true"></div>
            <Sidebar
                ongletActif={onglet}
            />
            <div className="application_principale-content">
                {onglet === DASHBOARD && <Dashboard />}
                {onglet === ACTIONNEUR && <Actionneur />}
                {onglet === SEUIL && <Seuils />}
                {onglet === STATISTIQUE && <Statistiques />}
                {onglet === NOTIFICATION && <Notifications />}
            </div>
        </section>
    )
}

export default Application_pricipale;
