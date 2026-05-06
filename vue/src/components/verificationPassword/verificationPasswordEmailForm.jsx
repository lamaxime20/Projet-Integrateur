import "../../assets/styles/components/verificationPassword/verificationPasswordEmailForm.css";

function VerificationPasswordEmailForm({
    email,
    emailError,
    globalError,
    isSubmitting,
    onChange,
    onSubmit,
}) {
    return (
        <form className="verificationPassword-step-form" onSubmit={onSubmit}>
            <div className="verificationPassword-step-copy">
                <p>Entre l'email de ton compte pour recevoir un code de vérification temporaire.</p>
            </div>

            <div className="verificationPassword-field-list">
                <label className="verificationPassword-field">
                    <span>Email</span>
                    <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={onChange}
                        placeholder="example@mail.com"
                        disabled={isSubmitting}
                    />
                    <p>{emailError}</p>
                </label>
            </div>

            <div className="verificationPassword-step-actions">
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Vérification..." : "Suivant"}
                </button>
                <p className="verificationPassword-global-error">{globalError}</p>
            </div>
        </form>
    );
}

export default VerificationPasswordEmailForm;
