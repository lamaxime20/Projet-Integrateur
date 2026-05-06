import "../../assets/styles/components/signup/signupVerificationForm.css";

function SignupVerificationForm({
    codeDigits,
    globalError,
    inputRefs,
    isSubmitting,
    maskedEmail,
    onDigitChange,
    onDigitKeyDown,
    onPrevious,
    onSubmit,
}) {
    return (
        <form className="signup-step-form" onSubmit={onSubmit}>
            <div className="signup-step-copy">
                <h2>Vérifie ton email</h2>
                <p>Un code à 6 chiffres a été préparé pour <strong>{maskedEmail}</strong>.</p>
            </div>

            <div className="signup-code-list" role="group" aria-label="Code de vérification">
                {codeDigits.map((digit, index) => (
                    <label key={`signup-code-${index}`} className="signup-code-field">
                        <span className="signup-visually-hidden">Chiffre {index + 1}</span>
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
                            disabled={isSubmitting}
                        />
                    </label>
                ))}
            </div>

            <div className="signup-step-actions signup-step-actions-inline">
                <button type="button" className="signup-button-ghost" onClick={onPrevious} disabled={isSubmitting}>
                    Précédent
                </button>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Validation..." : "Suivant"}
                </button>
            </div>

            <p className="signup-global-error">{globalError}</p>
        </form>
    );
}

export default SignupVerificationForm;
