import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/images/accueil/hero.png';
import ConstatElement from '../components/principale/constatElement';
import FaqCard from '../components/principale/faqCard';
import { faqItems, solutionHighlights } from '../utils/principaleData';
import '../assets/styles/pages/principale.css';

function Principale() {
    const [activeHighlight, setActiveHighlight] = useState(0);
    const navigate = useNavigate();

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
                                onClick={() => navigate('/application')}
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
                <h2 className='principale-section-title'>
                    <span className="material-symbols-outlined" aria-hidden="true">eco</span>
                    Notre Constat
                </h2>
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
                <h2 className='principale-section-title'>
                    <span className="material-symbols-outlined" aria-hidden="true">memory</span>
                    Agrico-Tech, ta solution
                </h2>
                <p className='principale-solution-copy'>
                    Ce n'est pas un concept abstrait,
                    mais une véritable solution pour
                </p>
                <div className='principale-solution-reveal-list' role="list" aria-label="Bénéfices Agrico-Tech">
                    {solutionHighlights.map((highlight, index) => {
                        const isActive = activeHighlight === index;

                        return (
                            <button
                                key={highlight.text}
                                type="button"
                                role="listitem"
                                className={`principale-solution-reveal-item ${isActive ? 'is-active' : ''}`}
                                onClick={() => setActiveHighlight(index)}
                                onMouseEnter={() => setActiveHighlight(index)}
                                onFocus={() => setActiveHighlight(index)}
                                aria-expanded={isActive}
                            >
                                <span className="material-symbols-outlined principale-solution-reveal-icon" aria-hidden="true">
                                    {highlight.icon}
                                </span>
                                <span className='principale-solution-reveal-text'>{highlight.text}</span>
                            </button>
                        );
                    })}
                </div>
                <div className='principale-solution-cta'>
                    <button
                        type="button"
                        className='principale-solution-cta-primary'
                        onClick={() => navigate('/application')}
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
                <h2 className='principale-section-title'>
                    <span className="material-symbols-outlined" aria-hidden="true">help</span>
                    Au cas où tu as un doute
                </h2>
                <div className='principale-faq-grid'>
                    {faqItems.map((item) => (
                        <FaqCard
                            key={item.question}
                            icon={item.icon}
                            question={item.question}
                            answer={item.answer}
                        />
                    ))}
                </div>
            </section>
            <section className='principale-final-cta'>
                <div className='principale-final-cta-content'>
                    <span className='principale-final-cta-kicker'>Passe à une gestion agricole plus sereine</span>
                    <h2 className='principale-section-title principale-section-title-inverse'>
                        <span className="material-symbols-outlined" aria-hidden="true">spa</span>
                        Tu peux continuer de laisser tes cultures périr
                    </h2>
                    <p>Ou bien reprendre le contrôle maintenant, avec un suivi plus clair, plus rapide et plus fiable.</p>
                </div>
                <div className='principale-final-cta-action'>
                    <button
                        type="button"
                        className='principale-final-cta-primary'
                        onClick={() => {
                            window.location.href = '/manager';
                        }}
                    >
                        Commander mon kit
                    </button>
                </div>
            </section>
        </main>
    )
}

export default Principale;
