import { createContext } from "react";
import Cookies from "js-cookie";
import { loginFromDatabase, logoutFromDatabase } from "../src/utils/user";

const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    token: null,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const savedToken = Cookies.get("token");

        if (savedToken) {
            setToken(savedToken);
            setIsAuthenticated(true);
            setUser(JSON.parse(Cookies.get("user")));
        }
    }, []);

    const login = async (userData, token) => {
        const result = await loginFromDatabase(userData, token);
        if (!result) {
            return false;
        }
        setIsAuthenticated(true);
        setUser(result.user);
        setToken(result.token);
        return true;
    };

    const logout = async () => {
        const success = await logoutFromDatabase(token);
        if (!success) {
            return false;
        }
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        return true;
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};