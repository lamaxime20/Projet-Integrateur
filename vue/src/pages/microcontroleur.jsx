import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/styles/pages/microcontroleur.css";
import {
    charger_erreur_enregistrement,
    charger_infos_microcontroleur_enregistrement,
    enregistrer_erreur_enregistrement,
    enregistrer_infos_microcontroleur_enregistrement,
    enregistrer_microcontroleur_local,
    enregistrer_microcontroleur_user,
} from "../utils/microcontroleur";

function Microcontroleur() {
    const navigate = useNavigate();
    const [infos_microcontroleur, setInfosMicrocontroleur] = useState({
        identifiant: "",
        password: "",
    });
    const [erreur, setErreur] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const infos = charger_infos_microcontroleur_enregistrement();
        const erreurEnregistree = charger_erreur_enregistrement();

        if (infos) {
            setInfosMicrocontroleur(infos);
        }

        if (erreurEnregistree) {
            setErreur(erreurEnregistree);
        }
    }, []);

    const changeContenuChamp = (e) => {
        const { name, value } = e.target;
        setInfosMicrocontroleur({
            ...infos_microcontroleur,
            [name]: value,
        });
        enregistrer_infos_microcontroleur_enregistrement({
            ...infos_microcontroleur,
            [name]: value,
        });
        setErreur("");
        enregistrer_erreur_enregistrement("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { identifiant, password } = infos_microcontroleur;

        if (!identifiant.trim() || !password.trim()) {
            const message = "Renseigne l'identifiant et le mot de passe du kit.";
            setErreur(message);
            enregistrer_erreur_enregistrement(message);
            return;
        }

        setIsSubmitting(true);
        const result = await enregistrer_microcontroleur_user(infos_microcontroleur);
        setIsSubmitting(false);

        if (!result.success) {
            setErreur(result.message);
            enregistrer_erreur_enregistrement(result.message);
            return;
        }

        enregistrer_erreur_enregistrement("");
        enregistrer_microcontroleur_local(result.microcontroleur);
        navigate("/application", { replace: true });
    };

    return (
        <main className="microcontroleur-root">
            <section className="microcontroleur-shell">
                <header className="microcontroleur-intro">
                    <p className="microcontroleur-kicker">Connexion du kit</p>
                    <h1>Ajoute ton microcontrôleur</h1>
                    <p className="microcontroleur-lead">
                        Sur la notice de ton kit, tu trouveras l'identifiant et le mot de passe nécessaires pour
                        rattacher ton installation à ton espace.
                    </p>
                </header>

                <div className="microcontroleur-helper">
                    <p>Prépare simplement les deux informations fournies avec le kit.</p>
                    <Link to="/application">Voir mes kits déjà enregistrés</Link>
                </div>

                <form className="microcontroleur-form" onSubmit={handleSubmit}>
                    <div className="microcontroleur-inputs">
                        <label className="microcontroleur-input" htmlFor="identifiant">
                            <span>Identifiant</span>
                            <input
                                id="identifiant"
                                type="text"
                                name="identifiant"
                                placeholder="Ex: kit-serre-024"
                                onChange={changeContenuChamp}
                                value={infos_microcontroleur.identifiant}
                            />
                        </label>
                        <label className="microcontroleur-input" htmlFor="password">
                            <span>Mot de passe du kit</span>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Entre la clé fournie"
                                onChange={changeContenuChamp}
                                value={infos_microcontroleur.password}
                            />
                        </label>
                    </div>
                    <div className="microcontroleur-submit">
                        <button
                            className="microcontroleur-btn-submit"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Enregistrement..." : "Enregistrer le kit"}
                        </button>
                        <p className="microcontroleur-erreur">{erreur}</p>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default Microcontroleur;
