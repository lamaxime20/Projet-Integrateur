import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Application from "./pages/application";
import Login from "./pages/login";
import Principale from "./pages/principale";
import Signup from "./pages/signup";
import VerificationPassword from "./pages/verificationPassword";
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
                        <Route path="/application" element={<Application />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
