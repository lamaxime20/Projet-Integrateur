const SESSION_STORAGE_KEY = "agrico-tech-session";
const SIMULATED_DAY_IN_MS = 60 * 1000;

function wait(duration) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, duration);
    });
}

function buildSession(user) {
    const expiresAt = Date.now() + (user.jour_expiration * SIMULATED_DAY_IN_MS);

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
    await wait(700);

    if (!credentials?.email || !credentials?.password) {
        return null;
    }

    const user = {
        id: "12345",
        email: "example@mail.com",
        name: "John Doe",
        role: "user",
        jour_expiration: 7,
    };

    const session = buildSession(user);

    saveSession(session);

    return session;
}

export async function restoreSessionFromDatabase() {
    await wait(250);

    const session = getSessionSnapshot();

    if (!session) {
        return null;
    }

    if (isSessionExpired(session.expiresAt)) {
        clearSession();
        return null;
    }

    return session;
}

export async function logoutFromDatabase() {
    await wait(250);
    clearSession();
    return true;
}

export async function authenticatedRequest(callback) {
    await wait(150);

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
