import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/pages/application.css";
import { useAuth } from "../hooks/useAuth";
import { charger_microcontroleur_local, supprimer_microcontroleur_local } from "../utils/microcontroleur";
import Choix_microcontroleur from "../components/application/choix_microcontroleur";

function Application() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [microcontroleur, setMicrocontroleur] = useState(charger_microcontroleur_local());

    return (
        <main className="application-root">
            {microcontroleur ? (
                <section className="application-shell">
                    <header className="application-hero">
                        <div className="application-hero-copy">
                            <p className="application-kicker">Pilotage du kit</p>
                            <h1>{microcontroleur.nom}</h1>
                            <p className="application-copy">
                                Ton microcontrôleur est prêt. Tu peux maintenant suivre l'état du kit, vérifier sa
                                connectivité et te préparer à piloter l'irrigation, la ventilation et les mesures en
                                temps réel.
                            </p>
                        </div>
                        <div className="application-hero-meta">
                            <p>Connecté à l'espace {user?.name ?? "utilisateur"}</p>
                            <span className={`application-status ${microcontroleur.allume ? "is-on" : "is-off"}`}>
                                {microcontroleur.allume ? "Kit allumé" : "Kit hors ligne"}
                            </span>
                        </div>
                    </header>

                    <section className="application-section">
                        <div className="application-section-heading">
                            <h2>Informations principales</h2>
                            <p>Une lecture rapide des éléments essentiels du contrôleur actuellement sélectionné.</p>
                        </div>

                        <dl className="application-info-list">
                            <div>
                                <dt>Identifiant</dt>
                                <dd>{microcontroleur.identifiant}</dd>
                            </div>
                            <div>
                                <dt>Référence</dt>
                                <dd>{microcontroleur.reference}</dd>
                            </div>
                            <div>
                                <dt>Adresse MAC</dt>
                                <dd>{microcontroleur.mac_address}</dd>
                            </div>
                            <div>
                                <dt>Dernière connexion</dt>
                                <dd>{microcontroleur.last_connexion}</dd>
                            </div>
                            <div>
                                <dt>Date d'installation</dt>
                                <dd>{microcontroleur.date_installation}</dd>
                            </div>
                            <div>
                                <dt>Clé locale</dt>
                                <dd>{microcontroleur.passkey}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="application-section application-section-accent">
                        <div className="application-section-heading">
                            <h2>Suite logique</h2>
                            <p>
                                Cette page prépare le terrain pour le tableau de bord opérationnel du kit et la
                                lecture des futures données de culture.
                            </p>
                        </div>

                        <div className="application-inline-points">
                            <p>Capteurs, actions et états du système viendront s'afficher ici.</p>
                            <p>Tu pourras ensuite changer de kit ou rattacher un nouveau contrôleur à tout moment.</p>
                        </div>

                        <div className="application-actions">
                            <button
                                type="button"
                                className="application-secondary"
                                onClick={() => {
                                    supprimer_microcontroleur_local();
                                    setMicrocontroleur(null);
                                }}
                            >
                                Changer de kit
                            </button>
                            <button
                                type="button"
                                className="application-primary"
                                onClick={() => {
                                    navigate("/microcontroleur");
                                }}
                            >
                                Enregistrer un autre kit
                            </button>
                        </div>
                    </section>
                </section>
            ):(
                <Choix_microcontroleur />
            )}
        </main>
    );
}

export default Application;
