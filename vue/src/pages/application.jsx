import { useNavigate } from "react-router-dom";
import "../assets/styles/pages/application.css";
import { useAuth } from "../hooks/useAuth";

function Application() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <main className="application-root">
            <section className="application-panel">
                <div className="application-panel-header">
                    <p className="application-kicker">Session active</p>
                    <h1>Bienvenue, {user?.name ?? "Utilisateur"}</h1>
                    <p className="application-copy">
                        Cette page est protégée. La session simulée repose sur des credentials envoyés
                        automatiquement, sans exposer le token au frontend.
                    </p>
                </div>

                <dl className="application-user-grid">
                    <div>
                        <dt>Identifiant</dt>
                        <dd>{user?.id ?? "-"}</dd>
                    </div>
                    <div>
                        <dt>Email</dt>
                        <dd>{user?.email ?? "-"}</dd>
                    </div>
                    <div>
                        <dt>Rôle</dt>
                        <dd>{user?.role ?? "-"}</dd>
                    </div>
                    <div>
                        <dt>Expiration simulée</dt>
                        <dd>{user?.jour_expiration ?? "-"} minute(s)</dd>
                    </div>
                </dl>

                <div className="application-actions">
                    <button type="button" className="application-secondary" onClick={() => navigate("/")}>
                        Retour à l'accueil
                    </button>
                    <button type="button" className="application-primary" onClick={handleLogout}>
                        Se déconnecter
                    </button>
                </div>
            </section>
        </main>
    );
}

export default Application;
