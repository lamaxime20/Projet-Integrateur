import API_BASE_URL from './config.js';

const PASSWORD_RESET_DRAFT_KEY = "agrico-tech-password-reset-draft";
const PASSWORD_RESET_VERIFICATION_KEY = "agrico-tech-password-reset-verification";
const RESEND_COOLDOWN_MS = 60 * 1000;

function setStorageValue(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
}

function getStorageValue(key) {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue);
    } catch {
        window.localStorage.removeItem(key);
        return null;
    }
}

function sanitizeResetDraft(draft) {
    return {
        email: draft?.email ?? "",
        password: draft?.password ?? "",
        confirmPassword: draft?.confirmPassword ?? "",
    };
}

export function loadPasswordResetDraft() {
    return sanitizeResetDraft(getStorageValue(PASSWORD_RESET_DRAFT_KEY));
}

export function persistPasswordResetDraft(patch) {
    const nextDraft = {
        ...loadPasswordResetDraft(),
        ...patch,
    };

    setStorageValue(PASSWORD_RESET_DRAFT_KEY, nextDraft);
    return nextDraft;
}

export function clearPasswordResetStorage() {
    window.localStorage.removeItem(PASSWORD_RESET_DRAFT_KEY);
    window.localStorage.removeItem(PASSWORD_RESET_VERIFICATION_KEY);
}

export function getStoredPasswordResetVerification() {
    return getStorageValue(PASSWORD_RESET_VERIFICATION_KEY);
}

export function isPasswordResetCodeExpired(expiresAt) {
    if (!expiresAt) {
        return true;
    }

    return Date.now() >= expiresAt;
}

export function isPasswordResetResendLocked(lastSentAt) {
    if (!lastSentAt) {
        return false;
    }

    return Date.now() - lastSentAt < RESEND_COOLDOWN_MS;
}

export function getPasswordResetResendRemaining(lastSentAt) {
    if (!isPasswordResetResendLocked(lastSentAt)) {
        return 0;
    }

    return Math.max(0, Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - lastSentAt)) / 1000));
}

export function getPasswordResetInitialState() {
    const draft = loadPasswordResetDraft();
    const verification = getStoredPasswordResetVerification();

    if (verification?.email === draft.email && verification.isVerified && !isPasswordResetCodeExpired(verification.expiresAt)) {
        return {
            currentStep: 3,
            draft,
            verification,
        };
    }

    if (verification?.email === draft.email && !isPasswordResetCodeExpired(verification.expiresAt)) {
        return {
            currentStep: 2,
            draft,
            verification,
        };
    }

    return {
        currentStep: 1,
        draft,
        verification: null,
    };
}

export function validatePasswordResetEmail(email) {
    if (!email.trim()) {
        return "L'email est requis.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return "Entre un email valide.";
    }

    return "";
}

export function validatePasswordResetPasswords(values) {
    const errors = {
        password: "",
        confirmPassword: "",
    };

    if (!values.password) {
        errors.password = "Le nouveau mot de passe est requis.";
    } else if (values.password.length < 8) {
        errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (!values.confirmPassword) {
        errors.confirmPassword = "La confirmation est requise.";
    } else if (values.confirmPassword !== values.password) {
        errors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    return errors;
}

export function normalizePasswordResetCode(codeDigits) {
    return codeDigits.join("").replace(/\D/g, "").slice(0, 6);
}

export function splitPasswordResetCode(code) {
    const safeCode = `${code ?? ""}`.padEnd(6, " ");
    return safeCode.slice(0, 6).split("").map((character) => (character === " " ? "" : character));
}

export function maskPasswordResetEmail(email) {
    const [localPart = "", domain = ""] = `${email}`.split("@");

    if (!localPart || !domain) {
        return email;
    }

    if (localPart.length <= 2) {
        return `${localPart[0] ?? ""}*@${
            domain
        }`;
    }

    return `${localPart.slice(0, 2)}${"*".repeat(Math.max(localPart.length - 2, 2))}@${domain}`;
}

export async function submitPasswordResetEmail(emailValue) {
    const email = emailValue.trim().toLowerCase();
    const fieldError = validatePasswordResetEmail(email);

    persistPasswordResetDraft({ email });

    if (fieldError) {
        return {
            ok: false,
            fieldError,
            globalError: "",
            verification: null,
            reused: false,
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/password-reset/check-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                ok: false,
                fieldError: error.error || "Erreur lors de l'envoi du code",
                globalError: "",
                verification: null,
                reused: false,
            };
        }

        const verification = {
            email,
            expiresAt: Date.now() + 15 * 60 * 1000, // 15 min — must match backend
            lastSentAt: Date.now(),
            isVerified: false,
        };

        setStorageValue(PASSWORD_RESET_VERIFICATION_KEY, verification);

        return {
            ok: true,
            fieldError: "",
            globalError: "",
            verification,
            reused: false,
        };
    } catch (error) {
        return {
            ok: false,
            fieldError: "",
            globalError: "Erreur réseau. Réessaie.",
            verification: null,
            reused: false,
        };
    }
}

export async function verifyPasswordResetCode(codeDigits) {
    const verification = getStoredPasswordResetVerification();
    const code = normalizePasswordResetCode(codeDigits);

    if (!verification) {
        return {
            ok: false,
            globalError: "La vérification a expiré. Reprends depuis l'email.",
            verification: null,
        };
    }

    if (isPasswordResetCodeExpired(verification.expiresAt)) {
        window.localStorage.removeItem(PASSWORD_RESET_VERIFICATION_KEY);

        return {
            ok: false,
            globalError: "Le code a expiré. Demande-en un nouveau.",
            verification: null,
        };
    }

    if (code.length !== 6) {
        return {
            ok: false,
            globalError: "Entre le code complet à 6 chiffres.",
            verification,
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/password-reset/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: verification.email,
                code,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                ok: false,
                globalError: error.error || "Code incorrect",
                verification,
            };
        }

        const verifiedSession = {
            ...verification,
            isVerified: true,
        };

        setStorageValue(PASSWORD_RESET_VERIFICATION_KEY, verifiedSession);

        return {
            ok: true,
            globalError: "",
            verification: verifiedSession,
        };
    } catch (error) {
        return {
            ok: false,
            globalError: "Erreur réseau. Réessaie.",
            verification,
        };
    }
}

export async function resendPasswordResetCode() {
    const verification = getStoredPasswordResetVerification();

    if (!verification) {
        return {
            ok: false,
            globalError: "La demande précédente n'existe plus. Reprends depuis l'email.",
            verification: null,
        };
    }

    if (isPasswordResetResendLocked(verification.lastSentAt)) {
        return {
            ok: false,
            globalError: `Tu peux demander un nouveau code dans ${getPasswordResetResendRemaining(verification.lastSentAt)} secondes.`,
            verification,
        };
    }

    // Resend by calling check-email again
    try {
        const response = await fetch(`${API_BASE_URL}/password-reset/check-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: verification.email }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                ok: false,
                globalError: error.error || "Erreur lors du renvoi",
                verification,
            };
        }

        const refreshedVerification = {
            ...verification,
            expiresAt: Date.now() + 15 * 60 * 1000,
            lastSentAt: Date.now(),
            isVerified: false,
        };

        setStorageValue(PASSWORD_RESET_VERIFICATION_KEY, refreshedVerification);

        return {
            ok: true,
            globalError: "",
            verification: refreshedVerification,
        };
    } catch (error) {
        return {
            ok: false,
            globalError: "Erreur réseau. Réessaie.",
            verification,
        };
    }
}

export async function completePasswordReset(passwordValues) {
    const draft = loadPasswordResetDraft();
    const verification = getStoredPasswordResetVerification();
    const fieldErrors = validatePasswordResetPasswords(passwordValues);
    const hasErrors = Object.values(fieldErrors).some(Boolean);

    persistPasswordResetDraft(passwordValues);

    if (hasErrors) {
        return {
            ok: false,
            fieldErrors,
            globalError: "",
        };
    }

    if (!verification || !verification.isVerified || verification.email !== draft.email || isPasswordResetCodeExpired(verification.expiresAt)) {
        return {
            ok: false,
            fieldErrors,
            globalError: "La vérification n'est plus valide. Reprends depuis l'email.",
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/password-reset/change`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: draft.email,
                password: passwordValues.password,
                password_confirmation: passwordValues.confirmPassword,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                ok: false,
                fieldErrors,
                globalError: error.error || "Erreur lors du changement",
            };
        }

        clearPasswordResetStorage();

        return {
            ok: true,
            fieldErrors,
            globalError: "",
        };
    } catch (error) {
        return {
            ok: false,
            fieldErrors,
            globalError: "Erreur réseau. Réessaie.",
        };
    }
}
