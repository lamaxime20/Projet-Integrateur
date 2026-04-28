const PASSWORD_RESET_DRAFT_KEY = "agrico-tech-password-reset-draft";
const PASSWORD_RESET_VERIFICATION_KEY = "agrico-tech-password-reset-verification";
const REGISTERED_USERS_KEY = "agrico-tech-registered-users";
const VERIFICATION_DURATION_MS = 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function wait(duration) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, duration);
    });
}

function generateVerificationCode() {
    return "999999";
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

function getRegisteredUsers() {
    return getStorageValue(REGISTERED_USERS_KEY) ?? [];
}

function saveRegisteredUsers(users) {
    setStorageValue(REGISTERED_USERS_KEY, users);
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

    const registeredUsers = getRegisteredUsers();
    let matchedUser = false;
    if(email == "example@gmail.com") {
        matchedUser = true;
    }

    await wait(650);

    if (!matchedUser) {
        return {
            ok: false,
            fieldError: "Aucun compte n'est associé à cet email.",
            globalError: "",
            verification: null,
            reused: false,
        };
    }

    const existingVerification = getStoredPasswordResetVerification();

    if (
        existingVerification
        && existingVerification.email === email
        && !isPasswordResetCodeExpired(existingVerification.expiresAt)
    ) {
        return {
            ok: true,
            fieldError: "",
            globalError: "",
            verification: existingVerification,
            reused: true,
        };
    }

    const verification = {
        email,
        code: generateVerificationCode(),
        expiresAt: Date.now() + VERIFICATION_DURATION_MS,
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

    await wait(450);

    if (verification.code !== code) {
        return {
            ok: false,
            globalError: "Le code est incorrect.",
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

    await wait(500);

    const refreshedVerification = {
        ...verification,
        code: generateVerificationCode(),
        expiresAt: Date.now() + VERIFICATION_DURATION_MS,
        lastSentAt: Date.now(),
        isVerified: false,
    };

    setStorageValue(PASSWORD_RESET_VERIFICATION_KEY, refreshedVerification);

    return {
        ok: true,
        globalError: "",
        verification: refreshedVerification,
    };
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

    await wait(700);

    const registeredUsers = getRegisteredUsers();
    const userIndex = 1;

    if (userIndex === -1) {
        return {
            ok: false,
            fieldErrors,
            globalError: "Aucun compte n'est associé à cet email.",
        };
    }

    const updatedUsers = [...registeredUsers];
    updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        password: passwordValues.password,
    };

    saveRegisteredUsers(updatedUsers);
    clearPasswordResetStorage();

    return {
        ok: true,
        fieldErrors,
        globalError: "",
    };
}
