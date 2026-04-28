import "../../assets/styles/components/verificationPassword/verificationPasswordCodeForm.css";

function VerificationPasswordCodeForm({
    codeDigits,
    cooldownLabel,
    globalError,
    inputRefs,
    isSubmitting,
    isResending,
    maskedEmail,
    onDigitChange,
    onDigitKeyDown,
    onPrevious,
    onResend,
    onSubmit,
}) {
    return (
        <form className="verificationPassword-step-form" onSubmit={onSubmit}>
            <div className="verificationPassword-step-copy">
                <h2>Confirme le code reçu</h2>
                <p>Un code à 6 chiffres a été préparé pour <strong>{maskedEmail}</strong>.</p>
            </div>

            <div className="verificationPassword-code-list" role="group" aria-label="Code de vérification">
                {codeDigits.map((digit, index) => (
                    <label key={`verification-password-code-${index}`} className="verificationPassword-code-field">
                        <span className="verificationPassword-visually-hidden">Chiffre {index + 1}</span>
                        <input
                            ref={(element) => {
                                inputRefs.current[index] = element;
                            }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(event) => onDigitChange(index, event.target.value)}
                            onKeyDown={(event) => onDigitKeyDown(index, event)}
                        />
                    </label>
                ))}
            </div>

            <div className="verificationPassword-inline-copy">
                <button
                    type="button"
                    className="verificationPassword-button-link"
                    onClick={onResend}
                    disabled={isResending || Boolean(cooldownLabel)}
                >
                    {isResending ? "Renvoi..." : "Renvoyer le code"}
                </button>
                <p>{cooldownLabel || "Le code reste valable pendant 1 heure."}</p>
            </div>

            <div className="verificationPassword-step-actions verificationPassword-step-actions-inline">
                <button type="button" className="verificationPassword-button-ghost" onClick={onPrevious}>
                    Précédent
                </button>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Validation..." : "Suivant"}
                </button>
            </div>

            <p className="verificationPassword-global-error">{globalError}</p>
        </form>
    );
}

export default VerificationPasswordCodeForm;
