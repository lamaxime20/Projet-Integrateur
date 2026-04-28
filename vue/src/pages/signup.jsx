import { useRef, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import SignupIdentityForm from "../components/signup/signupIdentityForm";
import SignupPasswordForm from "../components/signup/signupPasswordForm";
import SignupVerificationForm from "../components/signup/signupVerificationForm";
import { useAuth } from "../hooks/useAuth";
import "../assets/styles/pages/signup.css";
import {
    completeSignup,
    getSignupInitialState,
    maskSignupEmail,
    persistSignupDraft,
    splitVerificationCode,
    submitSignupIdentity,
    verifySignupCode,
} from "../utils/signup";

function Signup() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading, login } = useAuth();
    const initialState = getSignupInitialState();
    const codeInputRefs = useRef([]);
    const [currentStep, setCurrentStep] = useState(initialState.currentStep);
    const [formData, setFormData] = useState(initialState.draft);
    const [codeDigits, setCodeDigits] = useState(splitVerificationCode(""));
    const [identityErrors, setIdentityErrors] = useState({
        nom: "",
        prenom: "",
        email: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({
        password: "",
        confirmPassword: "",
    });
    const [globalError, setGlobalError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isLoading && isAuthenticated) {
        return <Navigate to="/application" replace />;
    }

    const handleFormDataChange = (event) => {
        const { name, value } = event.target;

        const nextValues = {
            ...formData,
            [name]: value,
        };

        setFormData(nextValues);
        persistSignupDraft({ [name]: value });
        setGlobalError("");
    };

    const handleIdentitySubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setGlobalError("");

        const result = await submitSignupIdentity(formData);

        setIsSubmitting(false);
        setIdentityErrors(result.fieldErrors);

        if (!result.ok) {
            setGlobalError(result.globalError);
            return;
        }

        setCurrentStep(2);
    };

    const handleCodeDigitChange = (index, rawValue) => {
        const nextDigit = rawValue.replace(/\D/g, "").slice(-1);
        const nextDigits = [...codeDigits];
        nextDigits[index] = nextDigit;
        setCodeDigits(nextDigits);
        setGlobalError("");

        if (nextDigit && index < codeInputRefs.current.length - 1) {
            codeInputRefs.current[index + 1]?.focus();
        }
    };

    const handleCodeDigitKeyDown = (index, event) => {
        if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
            codeInputRefs.current[index - 1]?.focus();
        }

        if (event.key === "ArrowLeft" && index > 0) {
            codeInputRefs.current[index - 1]?.focus();
        }

        if (event.key === "ArrowRight" && index < codeInputRefs.current.length - 1) {
            codeInputRefs.current[index + 1]?.focus();
        }
    };

    const handleVerificationSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setGlobalError("");

        const result = await verifySignupCode(codeDigits);

        setIsSubmitting(false);

        if (!result.ok) {
            setGlobalError(result.globalError);
            return;
        }

        setCurrentStep(3);
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setGlobalError("");

        const result = await completeSignup({
            password: formData.password,
            confirmPassword: formData.confirmPassword,
        });

        setIsSubmitting(false);
        setPasswordErrors(result.fieldErrors);

        if (!result.ok) {
            setGlobalError(result.globalError);
            return;
        }

        const loginSucceeded = await login(result.credentials);

        if (!loginSucceeded) {
            setGlobalError("Le compte a été créé, mais la connexion automatique a échoué.");
            return;
        }

        navigate("/application", { replace: true });
    };

    const progressValue = Math.round((currentStep / 3) * 100);

    return (
        <main className="signup-root">
            <section className="signup-shell">
                <div className="signup-intro">
                    <p className="signup-kicker">Créer un compte</p>
                    <h1>Ouvre ton espace</h1>
                </div>

                <div className="signup-progress" aria-label="Progression de l'inscription">
                    <div className="signup-progress-track" aria-hidden="true">
                        <span className="signup-progress-bar" style={{ width: `${progressValue}%` }} />
                    </div>
                    <div className="signup-progress-steps">
                        <span className={currentStep >= 1 ? "is-active" : ""}>Identité</span>
                        <span className={currentStep >= 2 ? "is-active" : ""}>Code</span>
                        <span className={currentStep >= 3 ? "is-active" : ""}>Sécurité</span>
                    </div>
                </div>

                <section className="signup-form-zone" aria-live="polite">
                    {currentStep === 1 ? (
                        <SignupIdentityForm
                            values={formData}
                            errors={identityErrors}
                            globalError={globalError}
                            isSubmitting={isSubmitting}
                            onChange={handleFormDataChange}
                            onSubmit={handleIdentitySubmit}
                        />
                    ) : null}

                    {currentStep === 2 ? (
                        <SignupVerificationForm
                            codeDigits={codeDigits}
                            globalError={globalError}
                            inputRefs={codeInputRefs}
                            isSubmitting={isSubmitting}
                            maskedEmail={maskSignupEmail(formData.email)}
                            onDigitChange={handleCodeDigitChange}
                            onDigitKeyDown={handleCodeDigitKeyDown}
                            onPrevious={() => {
                                setCurrentStep(1);
                                setGlobalError("");
                            }}
                            onSubmit={handleVerificationSubmit}
                        />
                    ) : null}

                    {currentStep === 3 ? (
                        <SignupPasswordForm
                            values={formData}
                            errors={passwordErrors}
                            globalError={globalError}
                            isSubmitting={isSubmitting}
                            onChange={handleFormDataChange}
                            onPrevious={() => {
                                setCurrentStep(1);
                                setGlobalError("");
                            }}
                            onSubmit={handlePasswordSubmit}
                        />
                    ) : null}
                </section>

                <div className="signup-footer">
                    <p>Déjà un compte ?</p>
                    <Link to="/login">Se connecter</Link>
                </div>
            </section>
        </main>
    );
}

export default Signup;
