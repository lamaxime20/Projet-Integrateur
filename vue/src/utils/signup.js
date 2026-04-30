import API_BASE_URL from './config.js';

const SIGNUP_DRAFT_KEY = "agrico-tech-signup-draft";
const SIGNUP_VERIFICATION_KEY = "agrico-tech-signup-verification";

function sanitizeIdentityDraft(draft) {
    return {
        nom: draft?.nom ?? "",
        prenom: draft?.prenom ?? "",
        email: draft?.email ?? "",
        password: draft?.password ?? "",
        confirmPassword: draft?.confirmPassword ?? "",
    };
}

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

export function loadSignupDraft() {
    return sanitizeIdentityDraft(getStorageValue(SIGNUP_DRAFT_KEY));
}

export function persistSignupDraft(patch) {
    const nextDraft = {
        ...loadSignupDraft(),
        ...patch,
    };

    setStorageValue(SIGNUP_DRAFT_KEY, nextDraft);
    return nextDraft;
}

export function clearSignupStorage() {
    window.localStorage.removeItem(SIGNUP_DRAFT_KEY);
    window.localStorage.removeItem(SIGNUP_VERIFICATION_KEY);
}

export function getStoredVerification() {
    return getStorageValue(SIGNUP_VERIFICATION_KEY);
}

export function isVerificationExpired(expiresAt) {
    if (!expiresAt) {
        return true;
    }

    return Date.now() >= expiresAt;
}

export function getSignupInitialState() {
    const draft = loadSignupDraft();
    const verification = getStoredVerification();

    if (verification?.email === draft.email && verification.isVerified && !isVerificationExpired(verification.expiresAt)) {
        return {
            currentStep: 3,
            draft,
            verification,
        };
    }

    if (verification?.email === draft.email && !isVerificationExpired(verification.expiresAt)) {
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

export function validateSignupIdentity(values) {
    const errors = {
        nom: "",
        prenom: "",
        email: "",
    };

    if (!values.nom.trim()) {
        errors.nom = "Le nom est requis.";
    }

    if (!values.prenom.trim()) {
        errors.prenom = "Le prénom est requis.";
    }

    if (!values.email.trim()) {
        errors.email = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
        errors.email = "Entre un email valide.";
    }

    return errors;
}

export function validateSignupPassword(values) {
    const errors = {
        password: "",
        confirmPassword: "",
    };

    if (!values.password) {
        errors.password = "Le mot de passe est requis.";
    } else if (values.password.length < 8) {
        errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (!values.confirmPassword) {
        errors.confirmPassword = "La confirmation est requise.";
    } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    return errors;
}

export function normalizeVerificationCode(codeDigits) {
    return codeDigits.join("").replace(/\D/g, "").slice(0, 6);
}

export function splitVerificationCode(code) {
    const safeCode = `${code ?? ""}`.padEnd(6, " ");
    return safeCode.slice(0, 6).split("").map((character) => (character === " " ? "" : character));
}

export function maskSignupEmail(email) {
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

export async function submitSignupIdentity(values) {
    const trimmedValues = {
        nom: values.nom.trim(),
        prenom: values.prenom.trim(),
        email: values.email.trim().toLowerCase(),
    };

    const fieldErrors = validateSignupIdentity(trimmedValues);
    const hasErrors = Object.values(fieldErrors).some(Boolean);

    persistSignupDraft(trimmedValues);

    if (hasErrors) {
        return {
            ok: false,
            fieldErrors,
            globalError: "",
            verification: null,
            reused: false,
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/signup/check-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trimmedValues),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                ok: false,
                fieldErrors: {
                    ...fieldErrors,
                    email: error.error || "Erreur lors de l'envoi du code",
                },
                globalError: "",
                verification: null,
                reused: false,
            };
        }

        const verification = {
            email: trimmedValues.email,
            expiresAt: Date.now() + 15 * 60 * 1000, // 15 min
            isVerified: false,
        };

        setStorageValue(SIGNUP_VERIFICATION_KEY, verification);

        return {
            ok: true,
            fieldErrors,
            globalError: "",
            verification,
            reused: false,
        };
    } catch (error) {
        return {
            ok: false,
            fieldErrors,
            globalError: "Erreur réseau. Réessaie.",
            verification: null,
            reused: false,
        };
    }
}

export async function verifySignupCode(codeDigits) {
    const verification = getStoredVerification();
    const code = normalizeVerificationCode(codeDigits);

    if (!verification) {
        return {
            ok: false,
            globalError: "La vérification a expiré. Reprends depuis l'email.",
            verification: null,
        };
    }

    if (isVerificationExpired(verification.expiresAt)) {
        window.localStorage.removeItem(SIGNUP_VERIFICATION_KEY);

        return {
            ok: false,
            globalError: "Le code a expiré. Demande un nouveau code.",
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
        const response = await fetch(`${API_BASE_URL}/signup/verify-code`, {
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

        setStorageValue(SIGNUP_VERIFICATION_KEY, verifiedSession);

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

export async function completeSignup(passwordValues) {
    const draft = loadSignupDraft();
    const verification = getStoredVerification();
    const fieldErrors = validateSignupPassword(passwordValues);
    const hasErrors = Object.values(fieldErrors).some(Boolean);

    persistSignupDraft(passwordValues);

    if (hasErrors) {
        return {
            ok: false,
            fieldErrors,
            globalError: "",
            credentials: null,
        };
    }

    if (!verification || !verification.isVerified || verification.email !== draft.email || isVerificationExpired(verification.expiresAt)) {
        return {
            ok: false,
            fieldErrors,
            globalError: "La vérification n'est plus valide. Reprends l'étape précédente.",
            credentials: null,
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/signup/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: draft.email,
                nom: draft.nom,
                prenom: draft.prenom,
                password: passwordValues.password,
                password_confirmation: passwordValues.confirmPassword,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                ok: false,
                fieldErrors,
                globalError: error.error || "Erreur lors de la création du compte",
                credentials: null,
            };
        }

        clearSignupStorage();

        return {
            ok: true,
            fieldErrors,
            globalError: "",
            credentials: {
                email: draft.email,
                password: passwordValues.password,
            },
        };
    } catch (error) {
        return {
            ok: false,
            fieldErrors,
            globalError: "Erreur réseau. Réessaie.",
            credentials: null,
        };
    }
}
