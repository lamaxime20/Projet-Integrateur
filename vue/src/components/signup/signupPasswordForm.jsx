import "../../assets/styles/components/signup/signupPasswordForm.css";

function SignupPasswordForm({
    values,
    errors,
    globalError,
    isSubmitting,
    onChange,
    onPrevious,
    onSubmit,
}) {
    return (
        <form className="signup-step-form" onSubmit={onSubmit}>
            <div className="signup-step-copy">
                <h2>Sécurise l’accès</h2>
                <p>Un mot de passe clair pour toi, solide pour protéger la serre.</p>
            </div>

            <div className="signup-field-list">
                <label className="signup-field">
                    <span>Mot de passe</span>
                    <input
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        value={values.password}
                        onChange={onChange}
                        placeholder="Au moins 8 caractères"
                        disabled={isSubmitting}
                    />
                    <p>{errors.password}</p>
                </label>

                <label className="signup-field">
                    <span>Confirmation du mot de passe</span>
                    <input
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={values.confirmPassword}
                        onChange={onChange}
                        placeholder="Répète le mot de passe"
                        disabled={isSubmitting}
                    />
                    <p>{errors.confirmPassword}</p>
                </label>
            </div>

            <div className="signup-step-actions signup-step-actions-inline">
                <button type="button" className="signup-button-ghost" onClick={onPrevious} disabled={isSubmitting}>
                    Précédent
                </button>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Création..." : "Créer l’accès"}
                </button>
            </div>

            <p className="signup-global-error">{globalError}</p>
        </form>
    );
}

export default SignupPasswordForm;
