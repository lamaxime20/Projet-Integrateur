import { createContext, useCallback, useEffect, useRef, useState } from "react";
import {
    clearSession,
    createSessionTimeout,
    getSessionSnapshot,
    isSessionExpired,
    loginFromDatabase,
    logoutFromDatabase,
    restoreSessionFromDatabase,
} from "../utils/user";

const AuthContext = createContext({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    login: async () => false,
    logout: async () => false,
});

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const sessionTimeoutRef = useRef(null);

    const clearAuthState = useCallback(() => {
        if (sessionTimeoutRef.current) {
            window.clearTimeout(sessionTimeoutRef.current);
            sessionTimeoutRef.current = null;
        }

        clearSession();
        setIsAuthenticated(false);
        setUser(null);
    }, []);

    const applyAuthenticatedSession = useCallback((session) => {
        if (!session || isSessionExpired(session.expiresAt)) {
            clearAuthState();
            return false;
        }

        if (sessionTimeoutRef.current) {
            window.clearTimeout(sessionTimeoutRef.current);
        }

        sessionTimeoutRef.current = createSessionTimeout(session.expiresAt, () => {
            clearAuthState();
        });

        setUser(session.user);
        setIsAuthenticated(true);
        return true;
    }, [clearAuthState]);

    useEffect(() => {
        let isMounted = true;

        const restoreSession = async () => {
            const restoredSession = await restoreSessionFromDatabase();

            if (!isMounted) {
                return;
            }

            applyAuthenticatedSession(restoredSession);
            setIsLoading(false);
        };

        restoreSession();

        return () => {
            isMounted = false;

            if (sessionTimeoutRef.current) {
                window.clearTimeout(sessionTimeoutRef.current);
            }
        };
    }, [applyAuthenticatedSession]);

    const login = async (credentials) => {
        const result = await loginFromDatabase(credentials);

        if (!result) {
            clearAuthState();
            return false;
        }

        return applyAuthenticatedSession(result);
    };

    const logout = async () => {
        if (!getSessionSnapshot()) {
            clearAuthState();
            return true;
        }

        const success = await logoutFromDatabase();

        clearAuthState();
        return success;
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
