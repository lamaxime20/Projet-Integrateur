import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { buildRedirectTarget } from "../utils/auth";
import { useAuth } from "../hooks/useAuth";
import "../assets/styles/pages/login.css";

function Login() {
    const { isAuthenticated, isLoading, login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    if (!isLoading && isAuthenticated) {
        return <Navigate to={buildRedirectTarget(location.state)} replace />;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        const success = await login(formData);

        setIsSubmitting(false);

        if (!success) {
            setErrorMessage("Impossible d'ouvrir la session. Vérifie tes informations.");
            return;
        }

        navigate(buildRedirectTarget(location.state), { replace: true });
    };

    return (
        <main className="login-root">
            <section className="login-panel" aria-labelledby="login-title">
                <div className="login-panel-heading">
                    <p className="login-kicker">Connexion sécurisée</p>
                    <h1 id="login-title">Accède à ton espace Agrico-Tech</h1>
                    <p className="login-copy">
                        Le front simule ici un cookie HttpOnly. Après connexion, toutes les requêtes
                        partent simplement avec les credentials de session.
                    </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@mail.com"
                    />

                    <label htmlFor="password">Mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Entre ton mot de passe"
                    />

                    {errorMessage ? <p className="login-error">{errorMessage}</p> : null}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Connexion en cours..." : "Se connecter"}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default Login;
