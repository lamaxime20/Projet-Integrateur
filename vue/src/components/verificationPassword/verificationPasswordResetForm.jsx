import "../../assets/styles/components/verificationPassword/verificationPasswordResetForm.css";

function VerificationPasswordResetForm({
    values,
    errors,
    globalError,
    isSubmitting,
    onChange,
    onPrevious,
    onSubmit,
}) {
    return (
        <form className="verificationPassword-step-form" onSubmit={onSubmit}>
            <div className="verificationPassword-step-copy">
                <h2>Choisis un nouveau mot de passe</h2>
                <p>Crée un accès simple à retenir pour toi, mais difficile à deviner pour les autres.</p>
            </div>

            <div className="verificationPassword-field-list">
                <label className="verificationPassword-field">
                    <span>Nouveau mot de passe</span>
                    <input
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        value={values.password}
                        onChange={onChange}
                        placeholder="Au moins 8 caractères"
                    />
                    <p>{errors.password}</p>
                </label>

                <label className="verificationPassword-field">
                    <span>Confirme le mot de passe</span>
                    <input
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={values.confirmPassword}
                        onChange={onChange}
                        placeholder="Répète le mot de passe"
                    />
                    <p>{errors.confirmPassword}</p>
                </label>
            </div>

            <div className="verificationPassword-step-actions verificationPassword-step-actions-inline">
                <button type="button" className="verificationPassword-button-ghost" onClick={onPrevious}>
                    Précédent
                </button>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Mise à jour..." : "Changer le mot de passe"}
                </button>
            </div>

            <p className="verificationPassword-global-error">{globalError}</p>
        </form>
    );
}

export default VerificationPasswordResetForm;
