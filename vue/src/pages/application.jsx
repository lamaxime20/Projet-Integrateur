import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/pages/application.css";
import { useAuth } from "../hooks/useAuth";
import { charger_microcontroleur_local, supprimer_microcontroleur_local } from "../utils/microcontroleur";
import Choix_microcontroleur from "../components/application/choix_microcontroleur";
import Application_pricipale from "../components/application/application_principale";
import { DASHBOARD } from "../utils/sidebar-constants";

function Application({onglet = DASHBOARD}) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [microcontroleur, setMicrocontroleur] = useState(charger_microcontroleur_local());

    return (
        <main className="application-root">
            {microcontroleur ? (
                <Application_pricipale onglet={onglet} />
            ):(
                <Choix_microcontroleur />
            )}
        </main>
    );
}

export default Application;
