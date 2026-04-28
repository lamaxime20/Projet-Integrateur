import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import VerificationPasswordCodeForm from "../components/verificationPassword/verificationPasswordCodeForm";
import VerificationPasswordEmailForm from "../components/verificationPassword/verificationPasswordEmailForm";
import VerificationPasswordResetForm from "../components/verificationPassword/verificationPasswordResetForm";
import { useAuth } from "../hooks/useAuth";
import "../assets/styles/pages/verificationPassword.css";
import {
    completePasswordReset,
    getPasswordResetInitialState,
    getPasswordResetResendRemaining,
    maskPasswordResetEmail,
    persistPasswordResetDraft,
    resendPasswordResetCode,
    splitPasswordResetCode,
    submitPasswordResetEmail,
    verifyPasswordResetCode,
} from "../utils/verificationPassword";

function VerificationPassword() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();
    const initialState = getPasswordResetInitialState();
    const codeInputRefs = useRef([]);
    const [currentStep, setCurrentStep] = useState(initialState.currentStep);
    const [formData, setFormData] = useState(initialState.draft);
    const [codeDigits, setCodeDigits] = useState(splitPasswordResetCode(""));
    const [emailError, setEmailError] = useState("");
    const [passwordErrors, setPasswordErrors] = useState({
        password: "",
        confirmPassword: "",
    });
    const [globalError, setGlobalError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(
        initialState.verification?.lastSentAt
            ? getPasswordResetResendRemaining(initialState.verification.lastSentAt)
            : 0
    );

    useEffect(() => {
        if (!cooldownSeconds) {
            return undefined;
        }

        const timerId = window.setTimeout(() => {
            setCooldownSeconds((current) => Math.max(0, current - 1));
        }, 1000);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [cooldownSeconds]);

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
        persistPasswordResetDraft({ [name]: value });
        setGlobalError("");

        if (name === "email") {
            setEmailError("");
        }

        if (name === "password" || name === "confirmPassword") {
            setPasswordErrors((current) => ({
                ...current,
                [name]: "",
            }));
        }
    };

    const handleEmailSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setGlobalError("");

        const result = await submitPasswordResetEmail(formData.email);

        setIsSubmitting(false);
        setEmailError(result.fieldError);

        if (!result.ok) {
            setGlobalError(result.globalError);
            return;
        }

        setCooldownSeconds(result.verification?.lastSentAt
            ? getPasswordResetResendRemaining(result.verification.lastSentAt)
            : 0);
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

    const handleCodeSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setGlobalError("");

        const result = await verifyPasswordResetCode(codeDigits);

        setIsSubmitting(false);

        if (!result.ok) {
            setGlobalError(result.globalError);
            return;
        }

        setCurrentStep(3);
    };

    const handleResend = async () => {
        setIsResending(true);
        setGlobalError("");

        const result = await resendPasswordResetCode();

        setIsResending(false);

        if (!result.ok) {
            setGlobalError(result.globalError);
            return;
        }

        setCodeDigits(splitPasswordResetCode(""));
        setCooldownSeconds(result.verification?.lastSentAt
            ? getPasswordResetResendRemaining(result.verification.lastSentAt)
            : 0);
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setGlobalError("");

        const result = await completePasswordReset({
            password: formData.password,
            confirmPassword: formData.confirmPassword,
        });

        setIsSubmitting(false);
        setPasswordErrors(result.fieldErrors);

        if (!result.ok) {
            setGlobalError(result.globalError);
            return;
        }

        navigate("/login", {
            replace: true,
            state: {
                passwordResetSuccess: true,
            },
        });
    };

    const progressValue = Math.round((currentStep / 3) * 100);
    const cooldownLabel = cooldownSeconds ? `Tu pourras renvoyer un code dans ${cooldownSeconds} s.` : "";

    return (
        <main className="verificationPassword-root">
            <section className="verificationPassword-shell">
                <div className="verificationPassword-intro">
                    <p className="verificationPassword-kicker">Réinitialiser le mot de passe</p>
                    <h1>Reprends l’accès à ton espace</h1>
                </div>

                <div className="verificationPassword-progress" aria-label="Progression de la réinitialisation">
                    <div className="verificationPassword-progress-track" aria-hidden="true">
                        <span className="verificationPassword-progress-bar" style={{ width: `${progressValue}%` }} />
                    </div>
                    <div className="verificationPassword-progress-steps">
                        <span className={currentStep >= 1 ? "is-active" : ""}>Email</span>
                        <span className={currentStep >= 2 ? "is-active" : ""}>Code</span>
                        <span className={currentStep >= 3 ? "is-active" : ""}>Nouveau mot de passe</span>
                    </div>
                </div>

                <section className="verificationPassword-form-zone" aria-live="polite">
                    {currentStep === 1 ? (
                        <VerificationPasswordEmailForm
                            email={formData.email}
                            emailError={emailError}
                            globalError={globalError}
                            isSubmitting={isSubmitting}
                            onChange={handleFormDataChange}
                            onSubmit={handleEmailSubmit}
                        />
                    ) : null}

                    {currentStep === 2 ? (
                        <VerificationPasswordCodeForm
                            codeDigits={codeDigits}
                            cooldownLabel={cooldownLabel}
                            globalError={globalError}
                            inputRefs={codeInputRefs}
                            isSubmitting={isSubmitting}
                            isResending={isResending}
                            maskedEmail={maskPasswordResetEmail(formData.email)}
                            onDigitChange={handleCodeDigitChange}
                            onDigitKeyDown={handleCodeDigitKeyDown}
                            onPrevious={() => {
                                setCurrentStep(1);
                                setGlobalError("");
                            }}
                            onResend={handleResend}
                            onSubmit={handleCodeSubmit}
                        />
                    ) : null}

                    {currentStep === 3 ? (
                        <VerificationPasswordResetForm
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

                <div className="verificationPassword-footer">
                    <p>Tu te souviens finalement de ton mot de passe ?</p>
                    <Link to="/login">Retour à la connexion</Link>
                </div>
            </section>
        </main>
    );
}

export default VerificationPassword;
