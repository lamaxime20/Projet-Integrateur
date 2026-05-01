import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Application from "./pages/application";
import Login from "./pages/login";
import Principale from "./pages/principale";
import Signup from "./pages/signup";
import VerificationPassword from "./pages/verificationPassword";
import Microcontroleur from "./pages/microcontroleur";
import { DASHBOARD, ACTIONNEUR, SEUIL, STATISTIQUE, NOTIFICATION } from "./components/application/sidebar";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Principale />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verification-password" element={<VerificationPassword />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/application" element={<Application onglet="none"/>} />
                        <Route path="/microcontroleur" element={<Microcontroleur />} />
                        <Route path="/application/dashboard" element={<Application onglet={DASHBOARD} />} />
                        <Route path="/application/actionneur" element={<Application onglet={ACTIONNEUR} />} />
                        <Route path="/application/seuil" element={<Application onglet={SEUIL} />} />
                        <Route path="/application/statistique" element={<Application onglet={STATISTIQUE} />} />
                        <Route path="/application/notification" element={<Application onglet={NOTIFICATION} />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
