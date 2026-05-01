import Sidebar from "./sidebar";
import { DASHBOARD, ACTIONNEUR, SEUIL, STATISTIQUE, NOTIFICATION } from "./sidebar-constants";

function Application_pricipale({onglet = DASHBOARD}) {
    return (
        <section className="application_principale-root">
            <Sidebar
                ongletActif={onglet}
            />
            <div className="application_principale-content">
                {onglet === DASHBOARD && <h1>Dashboard</h1>}
                {onglet === ACTIONNEUR && <h1>Actionneur</h1>}
                {onglet === SEUIL && <h1>Seuil</h1>}
                {onglet === STATISTIQUE && <h1>Statistique</h1>}
                {onglet === NOTIFICATION && <h1>Notification</h1>}
            </div>
        </section>
    )
}

export default Application_pricipale;