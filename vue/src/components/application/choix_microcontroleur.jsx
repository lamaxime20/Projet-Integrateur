import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/components/application/choix_microcontroleur.css";
import {
    charger_liste_microcontroleurs_user,
    charger_microcontroleur_user,
} from "../../utils/microcontroleur";
import { useAuth } from "../../hooks/useAuth";

function Choix_microcontroleur() {
    const navigate = useNavigate();
    const logout = useAuth().logout;
    const [listeMicrocontroleur_user, setListeMicrocontroleur_user] = useState([]);
    const [erreur, setErreur] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        charger_liste();
    }, []);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        await logout();
        localStorage.clear();
        navigate("/", { replace: true });
    }

    const charger_liste = async () => {
        setIsLoading(true);

        try {
            const data = await charger_liste_microcontroleurs_user();

            if (Array.isArray(data)) {
                setListeMicrocontroleur_user(data);
            }else {
                setErreur("Erreur réseau, réessaie plus tard.");
            }
        } catch {
            setErreur("Erreur réseau, réessaie plus tard.");
        } finally {
            setIsLoading(false);
        }
    };

    const choixMicrocontroleur = async (microcontroleur) => {
        if (isLoading) return;

        setIsLoading(true);

        try {
            const success = await charger_microcontroleur_user(microcontroleur.nom);

            if (success) {
                navigate("/application", { replace: true });
            }else {
                setErreur("Erreur réseau, réessaie plus tard.");
            }
        } catch {
            setErreur("Erreur réseau, réessaie plus tard.");
        } finally {
            setIsLoading(false);
        }
    };

    const allerEnregistrementKit = () => {
        if (isLoading || isLoggingOut) return;

        navigate("/microcontroleur");
    };

    if (isLoading && listeMicrocontroleur_user.length === 0) {
        return (
            <section className="choix_microcontroleur-root" aria-busy="true">
                <header className="choix_microcontroleur-header">
                    <p className="choix_microcontroleur-kicker">Sélection du kit</p>
                    <h1>Chargement des kits...</h1>
                    <p>On récupère les microcontrôleurs associés à ton compte.</p>
                </header>
            </section>
        );
    }

    if (erreur && listeMicrocontroleur_user.length === 0 && !isLoading) {
        return (
            <section className="choix_microcontroleur-root">
                <header className="choix_microcontroleur-header">
                    <p className="choix_microcontroleur-kicker">Sélection du kit</p>
                    <h1>Impossible de charger les kits</h1>
                    <p>{erreur}</p>
                </header>
                <div className="choix_microcontroleur-empty">
                    <button type="button" onClick={charger_liste}>
                        Réessayer
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="choix_microcontroleur-root">
            <header className="choix_microcontroleur-header">
                <p className="choix_microcontroleur-kicker">Sélection du kit</p>
                <h1>{listeMicrocontroleur_user.length === 0 ? "Aucun kit enregistré" : "Choisis ton microcontrôleur"}</h1>
                <p>
                    {listeMicrocontroleur_user.length === 0
                        ? "Pour commencer à piloter ton installation, enregistre d'abord un kit."
                        : "Retrouve ici les kits déjà liés à ton compte et ouvre celui que tu veux gérer."}
                </p>
            </header>

            {listeMicrocontroleur_user.length === 0 ? (
                <div className="choix_microcontroleur-empty">
                    <button
                        type="button"
                        onClick={allerEnregistrementKit}
                        disabled={isLoggingOut}
                    >
                        Enregistrer un kit
                    </button>
                    <button
                        type="button"
                        className="choix_microcontroleur-logout"
                        onClick={() => handleLogout()}
                        disabled={isLoggingOut}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">logout</span>
                        <span>{isLoggingOut ? "Déconnexion..." : "Déconnexion"}</span>
                    </button>
                </div>
            ):(
                <>
                    <div className="choix_microcontroleur-list" role="list" aria-label="Liste des microcontrôleurs">
                        {listeMicrocontroleur_user.map((microcontroleur) => (
                            <button
                                type="button"
                                className="choix_microcontroleur-item"
                                disabled={isLoading}
                                onClick={() => choixMicrocontroleur(microcontroleur)}
                                key={microcontroleur.nom}
                                role="listitem"
                            >
                                <span className="choix_microcontroleur-item-name">{microcontroleur.nom}</span>
                                <span className="choix_microcontroleur-item-meta">
                                    <span className={`choix-microcontroleur-point ${microcontroleur.allume ? "vert" : "rouge"}`} aria-hidden="true"></span>
                                    {microcontroleur.allume ? "En ligne" : "Hors ligne"}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="choix_microcontroleur-footer">
                        <button
                            type="button"
                            className="choix_microcontroleur-secondary"
                            onClick={allerEnregistrementKit}
                            disabled={isLoading}
                        >
                            Enregistrer un autre kit
                        </button>
                        <p>{erreur}</p>
                    </div>
                </>
            )}
        </section>
    );
}

export default Choix_microcontroleur;
