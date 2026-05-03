import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Application from "./pages/application";
import Login from "./pages/login";
import Principale from "./pages/principale";
import Signup from "./pages/signup";
import VerificationPassword from "./pages/verificationPassword";
import Microcontroleur from "./pages/microcontroleur";
import RapportLuminuosite from "./components/rapports/rapportLuminuosite";
import RapportNiveauEau from "./components/rapports/rapportNiveauEau";
import RapportsCO2 from "./components/rapports/rapportsCO2";
import RapportsHumiditeSol from "./components/rapports/rapportsHumiditeSol";
import RapportsTemperature from "./components/rapports/rapportsTemperature";
import RapportsVentilateur from "./components/rapports/rapportsVentilateur";
import RapportsPompe from "./components/rapports/rapportsPompe";
import RapportsAmpoule from "./components/rapports/rapportsAmpoule";
import RapportsServoMoteur from "./components/rapports/rapportsServoMoteur";
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
                        <Route path="/application" element={<Application onglet={DASHBOARD}/>} />
                        <Route path="/microcontroleur" element={<Microcontroleur />} />
                        <Route path="/application/dashboard" element={<Application onglet={DASHBOARD} />} />
                        <Route path="/application/actionneur" element={<Application onglet={ACTIONNEUR} />} />
                        <Route path="/application/seuil" element={<Application onglet={SEUIL} />} />
                        <Route path="/application/statistique" element={<Application onglet={STATISTIQUE} />} />
                        <Route path="/application/notification" element={<Application onglet={NOTIFICATION} />} />
                        <Route path="/application/rapports/co2" element={<RapportsCO2 />} />
                        <Route path="/application/rapports/humidite-sol" element={<RapportsHumiditeSol />} />
                        <Route path="/application/rapports/luminosité" element={<RapportLuminuosite />} />
                        <Route path="/application/rapports/niveau-eau" element={<RapportNiveauEau />} />
                        <Route path="/application/rapports/temperature" element={<RapportsTemperature />} />
                        <Route path="/application/rapports/ventilateur" element={<RapportsVentilateur />} />
                        <Route path="/application/rapports/pompe" element={<RapportsPompe />} />
                        <Route path="/application/rapports/ampoule" element={<RapportsAmpoule />} />
                        <Route path="/application/rapports/servo-moteur" element={<RapportsServoMoteur />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
