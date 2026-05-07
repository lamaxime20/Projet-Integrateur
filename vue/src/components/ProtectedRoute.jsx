import { Navigate, Outlet, useLocation } from "react-router-dom";
import "../assets/styles/components/ProtectedRoute.css";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <main className="auth-loading-screen">
                <p>Ouverture sécurisée de la serre...</p>
            </main>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
