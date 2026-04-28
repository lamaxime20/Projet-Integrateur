import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { buildRedirectTarget } from "../utils/auth";
import { useAuth } from "../hooks/useAuth";
import "../assets/styles/pages/login.css";
import googleLogo from '../assets/images/googleLogo.svg'

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
            <section className="login-left">
                <div className="tree-wrapper">
                    <svg viewBox="0 0 260 320" xmlns="http://www.w3.org/2000/svg" className="tree-svg">
                        <ellipse cx="130" cy="300" rx="70" ry="10" fill="#a8c97f" opacity="0.3" />
                        <rect x="119" y="210" width="22" height="90" rx="6" fill="#6b4f2a" />
                        <path d="M130 240 Q90 210 70 185" stroke="#6b4f2a" strokeWidth="8" fill="none" strokeLinecap="round" />
                        <path d="M130 235 Q170 205 190 178" stroke="#6b4f2a" strokeWidth="8" fill="none" strokeLinecap="round" />
                        <path d="M125 255 Q85 235 65 215" stroke="#7a5a33" strokeWidth="5" fill="none" strokeLinecap="round" />
                        <path d="M135 250 Q170 235 188 220" stroke="#7a5a33" strokeWidth="5" fill="none" strokeLinecap="round" />
                        <ellipse cx="130" cy="155" rx="72" ry="58" fill="#3d6e30" opacity="0.45" />
                        <ellipse cx="108" cy="128" rx="58" ry="50" fill="#4e8c3f" opacity="0.6" />
                        <ellipse cx="154" cy="123" rx="55" ry="48" fill="#4e8c3f" opacity="0.6" />
                        <ellipse cx="130" cy="106" rx="62" ry="55" fill="#63a84a" opacity="0.85" />
                        <ellipse cx="116" cy="86" rx="36" ry="28" fill="#82c95e" opacity="0.55" />
                        <circle cx="96" cy="118" r="5" fill="#e07b39" opacity="0.9" />
                        <circle cx="163" cy="109" r="4" fill="#e07b39" opacity="0.85" />
                        <circle cx="141" cy="136" r="4.5" fill="#e07b39" opacity="0.8" />
                        <circle cx="109" cy="150" r="3.5" fill="#c0392b" opacity="0.65" />
                    </svg>
                </div>
                <p className="login-left-tagline">
                    Rejoins l'avenir de l'agriculture
                </p>
            </section>
            <section className="login-right">
                <form className="login-form" onSubmit={handleSubmit}>
                    <header className="login-header">
                        <h1 className="login-title">Se connecter</h1>
                    </header>
                    <div className="login-main">
                        <div className="login-input">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@mail.com"
                            />

                            <input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Entre ton mot de passe"
                            />

                            <a
                                className="login-forgot-password-link"
                                href="/verification-password"
                            >
                                Mot de passe oublié ?
                            </a>
                        </div>

                        <div className="login-submit">
                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Connexion en cours..." : "Se connecter"}
                            </button>
                            {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
                        </div>

                        <div className="login-footer">
                            <p>Ou connecte toi avec</p>
                            <div className="login-social-links">
                                <button
                                    type="button"
                                    className="login-social-button"
                                    aria-label="Continuer avec Google"
                                >
                                    <img
                                        className="login-social-button-image"
                                        src={googleLogo}
                                        alt="Continuer avec Google"
                                    />
                                </button>
                            </div>
                            <a
                                className="login-policy"
                                href="#"
                            >
                                Politique de confidentialité
                            </a>
                            <p className="login-create-account">
                                Pas encore de compte ? <Link to="/signup">Créer mon accès</Link>
                            </p>
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default Login;
