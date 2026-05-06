import "../../assets/styles/components/signup/signupIdentityForm.css";

function SignupIdentityForm({
    values,
    errors,
    globalError,
    isSubmitting,
    onChange,
    onSubmit,
}) {
    return (
        <form className="signup-step-form" onSubmit={onSubmit}>
            <div className="signup-step-copy">
                <h2>Commençons par l'essentiel</h2>
                <p>Entre uniquement les informations nécessaires pour recevoir ton code de confirmation.</p>
            </div>

            <div className="signup-field-list">
                <label className="signup-field">
                    <span>Nom</span>
                    <input
                        type="text"
                        name="nom"
                        autoComplete="family-name"
                        value={values.nom}
                        onChange={onChange}
                        placeholder="Ton nom"
                        disabled={isSubmitting}
                    />
                    <p>{errors.nom}</p>
                </label>

                <label className="signup-field">
                    <span>Prénom</span>
                    <input
                        type="text"
                        name="prenom"
                        autoComplete="given-name"
                        value={values.prenom}
                        onChange={onChange}
                        placeholder="Ton prénom"
                        disabled={isSubmitting}
                    />
                    <p>{errors.prenom}</p>
                </label>

                <label className="signup-field">
                    <span>Email</span>
                    <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={values.email}
                        onChange={onChange}
                        placeholder="example@mail.com"
                        disabled={isSubmitting}
                    />
                    <p>{errors.email}</p>
                </label>
            </div>

            <div className="signup-step-actions">
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Vérification..." : "Suivant"}
                </button>
                <p className="signup-global-error">{globalError}</p>
            </div>
        </form>
    );
}

export default SignupIdentityForm;
