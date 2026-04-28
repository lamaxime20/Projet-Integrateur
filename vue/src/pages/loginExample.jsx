import { Link } from "react-router-dom";

function LoginExample() {
    return (
        <div className="login-page">
            <div className="login-left">
                <span className="brand-name">Agriculture Intelligente</span>

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

                <p className="left-tagline">
                    Surveillez, automatisez et optimisez
                    <br />
                    vos cultures en temps réel.
                </p>
            </div>

            <div className="login-right">
                <div className="login-card">
                    <h1 className="login-title">Se connecter</h1>
                    <p className="login-subtitle">Accédez à votre tableau de bord agricole</p>

                    <div className="field-group">
                        <label className="field-label" htmlFor="username">Nom d'utilisateur</label>
                        <input
                            id="username"
                            className="field-input"
                            type="text"
                            placeholder="ex : admin"
                            value=""
                            onChange={() => {}}
                            autoComplete="username"
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            className="field-input"
                            type="password"
                            placeholder="........"
                            value=""
                            onChange={() => {}}
                            autoComplete="current-password"
                        />
                    </div>

                    <button className="login-btn" type="button">
                        Se connecter
                    </button>

                    <Link className="back-link" to="/">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LoginExample;
