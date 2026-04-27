import heroImage from '../assets/images/accueil/hero.png';
import ConstatElement from '../components/principale/constatElement';
import '../assets/styles/pages/principale.css';

function Principale() {
    return (
        <main className="principale-root">
            <section className="principale-hero">
                <img className="principale-hero-image" src={heroImage} alt="Serre intelligente connectée" />
                <div className='principale-overlay'></div>
                <div className='principale-hero-content'>
                    <p className="principale-hero-copy">
                        Suis et contrôle tes cultures en temps réel,
                        optimise les conditions de croissance et maximise tes rendements.
                        Rejoins-nous pour une agriculture plus connectée et productive !
                    </p>
                    <div className='principale-hero-content-title'>
                        <h1>Agrico-Tech</h1>
                        <div className='principale-hero-cta'>
                            <button
                                type="button"
                                className='principale-hero-cta-secondary'
                                onClick={() => {
                                    window.location.href = '/manager';
                                }}
                            >
                                Gérer ma serre
                            </button>
                            <button
                                type="button"
                                className='principale-hero-cta-primary'
                                onClick={() => {
                                    window.location.href = '/payement';
                                }}
                            >
                                Commander mon kit
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <section className='principale-constat'>
                <h2>Notre Constat</h2>
                <div className='principale-constat-content'>
                    <ConstatElement 
                        text="L'agriculture traditionnelle est souvent inefficace, 
                        avec des rendements limités et 
                        une utilisation excessive de ressources." 
                        right = {false}
                    />
                    <ConstatElement
                        text="Les agriculteurs manquent d'outils modernes pour surveiller et optimiser leurs cultures,
                        ce qui entraîne des pertes de récoltes et des inefficacités."
                        right = {true}
                    />
                    <ConstatElement
                        text="Il existe une demande croissante pour des solutions agricoles durables et connectées, 
                        mais les options actuelles sont souvent coûteuses et complexes à mettre en œuvre."
                        right = {false}
                    />
                </div>
            </section>
            <section className='principale-solution'>
                <h2>Agrico-Tech, Ta solution</h2>
                <p>
                    Ce n'est pas un concept abstrait,
                    mais une véritable solution pour
                </p>
                <ul>
                    <li>Optimiser tes rendements grâce à des décisions basées sur des données réelles</li>
                    <li>Réduire ta consommation d’eau avec une irrigation intelligente et automatisée</li>
                    <li>Gagner du temps en automatisant les tâches répétitives (arrosage, ventilation, éclairage)</li>
                    <li>Suivre ton exploitation en temps réel, où que tu sois, depuis ton téléphone ou ton ordinateur</li>
                </ul>
                <div className='principale-solution-cta'>
                    <button
                        type="button"
                        className='principale-solution-cta-primary'
                        onClick={() => {
                            window.location.href = '/manager';
                        }}
                    >
                        Gérer ma serre
                    </button>
                    <button
                        type="button"
                        className='principale-solution-cta-secondary'
                        onClick={() => {
                            window.location.href = '/payement';
                        }}
                    >
                        Découvrir comment
                    </button>
                </div>
            </section>
            <section className='principale-faq'>
                <h2>Au cas où tu as un doute</h2>
                <div class="faq-item">
                    <h3>Agrico-Tech, c’est quoi exactement ?</h3>
                    <p>
                        Agrico-Tech est une solution intelligente qui utilise des capteurs et l’automatisation
                        pour surveiller et gérer ton exploitation agricole en temps réel. Elle t’aide à prendre
                        de meilleures décisions et à optimiser tes rendements.
                    </p>
                </div>

                <div class="faq-item">
                    <h3>Est-ce que je peux suivre mon champ à distance ?</h3>
                    <p>
                        Oui. Grâce à l’application web, tu peux consulter toutes les données (humidité, température,
                        luminosité, etc.) depuis ton téléphone ou ton ordinateur, où que tu sois.
                    </p>
                </div>

                <div class="faq-item">
                    <h3>Comment fonctionne l’irrigation automatique ?</h3>
                    <p>
                        Le système analyse l’humidité du sol en continu. Lorsque le niveau devient trop bas,
                        l’arrosage se déclenche automatiquement et s’arrête une fois le niveau optimal atteint.
                    </p>
                </div>

                <div class="faq-item">
                    <h3>Est-ce que je peux contrôler le système manuellement ?</h3>
                    <p>
                        Oui. Tu peux déclencher ou arrêter certaines actions (arrosage, ventilation, éclairage)
                        directement depuis l’application ou via une interface en ligne de commande.
                    </p>
                </div>

                <div class="faq-item">
                    <h3>Que se passe-t-il en cas de problème sur mon exploitation ?</h3>
                    <p>
                        Tu reçois des alertes en temps réel en cas d’anomalie : manque d’eau, température trop élevée,
                        taux de CO₂ élevé, ou dysfonctionnement d’un capteur.
                    </p>
                </div>

                <div class="faq-item">
                    <h3>Mes données sont-elles sécurisées ?</h3>
                    <p>
                        Oui. Les données sont protégées grâce à des systèmes de sécurité (chiffrement, accès sécurisé,
                        gestion des utilisateurs) pour éviter tout accès non autorisé.
                    </p>
                </div>

                <div class="faq-item">
                    <h3>Est-ce que l’installation est compliquée ?</h3>
                    <p>
                        Non. Une équipe peut s’occuper de l’installation complète des capteurs et du système
                        pour garantir un fonctionnement optimal dès le départ.
                    </p>
                </div>

                <div class="faq-item">
                    <h3>Est-ce que je peux voir l’historique de mes données ?</h3>
                    <p>
                        Oui. Toutes les données et actions sont enregistrées. Tu peux les consulter à tout moment
                        pour analyser l’évolution de ton exploitation et améliorer tes performances.
                    </p>
                </div>

                <div class="faq-item">
                    <h3>Est-ce que ça fonctionne pour tous les types de cultures ?</h3>
                    <p>
                        Oui. Le système est adaptable et configurable selon tes besoins, que ce soit pour des cultures
                        en plein champ ou sous serre.
                    </p>
                </div>
            </section>
            <section className='principale-final-cta'>
                <h2>Tu peux continuer de laisser tes cultures périr</h2>
                <p>Ou bien les sauver maintenant</p>
                <button
                    type="button"
                    className='principale-final-cta-primary'
                    onClick={() => {
                        window.location.href = '/manager';
                    }}
                >
                    Commander mon kit
                </button>
            </section>
        </main>
    )
}

export default Principale;
