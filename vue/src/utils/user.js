import API_BASE_URL from './config.js';

const SESSION_STORAGE_KEY = "agrico-tech-session";

function buildSession(user) {
    const expiresAt = Date.now() + (user.jour_expiration * 24 * 60 * 60 * 1000); // real days

    return {
        user,
        expiresAt,
    };
}

function saveSession(session) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getSessionSnapshot() {
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!rawSession) {
        return null;
    }

    try {
        return JSON.parse(rawSession);
    } catch {
        clearSession();
        return null;
    }
}

export function isSessionExpired(expiresAt) {
    if (!expiresAt) {
        return true;
    }

    return Date.now() >= expiresAt;
}

export function createSessionTimeout(expiresAt, onExpire) {
    const remainingTime = Math.max(expiresAt - Date.now(), 0);

    return window.setTimeout(() => {
        clearSession();
        onExpire();
    }, remainingTime);
}

export async function loginFromDatabase(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include', // to include cookies
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const user = await response.json();
        const session = buildSession(user);
        saveSession(session);
        return session;
    } catch (error) {
        throw error;
    }
}

export async function restoreSessionFromDatabase() {
    const session = getSessionSnapshot();

    if (!session) {
        return null;
    }

    if (isSessionExpired(session.expiresAt)) {
        clearSession();
        return null;
    }

    // Optionally, verify with backend
    // For now, assume local is sufficient

    return session;
}

export async function logoutFromDatabase() {
    clearSession();
    // Optionally, call logout endpoint
    return true;
}

export async function authenticatedRequest(callback) {
    const session = getSessionSnapshot();

    if (!session || isSessionExpired(session.expiresAt)) {
        clearSession();
        return {
            ok: false,
            status: 401,
            data: null,
        };
    }

    return callback(session);
}
