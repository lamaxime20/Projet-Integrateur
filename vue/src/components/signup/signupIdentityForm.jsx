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
                <h2>Ton identité</h2>
                <p>Juste les informations utiles pour créer ton accès.</p>
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
                    {isSubmitting ? "Vérification..." : "Continuer"}
                </button>
                <p className="signup-global-error">{globalError}</p>
            </div>
        </form>
    );
}

export default SignupIdentityForm;
