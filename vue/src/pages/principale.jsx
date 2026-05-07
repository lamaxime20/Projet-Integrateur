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
            <nav className="principale-navbar" aria-label="Navigation principale">
                <button type="button" className="principale-brand" onClick={() => navigate('/')}>
                    <span className="material-symbols-outlined" aria-hidden="true">eco</span>
                    <span>Agrico-Tech</span>
                </button>
                <div className="principale-navbar-actions">
                    <button type="button" onClick={() => navigate('/login')}>Connexion</button>
                    <button type="button" className="is-primary" onClick={() => navigate('/application')}>
                        Gérer ma serre
                    </button>
                </div>
            </nav>
            <section className="principale-hero">
                <img className="principale-hero-image" src={heroImage} alt="Serre intelligente connectée" />
                <div className='principale-overlay'></div>
                <div className='principale-hero-content'>
                    <p className="principale-hero-copy">
                        Surveille ta serre, pilote l’irrigation et garde des conditions stables pour tes cultures.
                    </p>
                    <div className='principale-hero-content-title'>
                        <h1>Agrico-Tech</h1>
                        <div className='principale-hero-cta'>
                            <button
                                type="button"
                                className='principale-hero-cta-secondary'
                                onClick={() => navigate('/application')}
                            >
                                Ouvrir ma serre
                            </button>
                            <button
                                type="button"
                                className='principale-hero-cta-primary'
                                onClick={() => {
                                    window.location.href = '/payement';
                                }}
                            >
                                Commander le kit
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <section className='principale-constat'>
                <h2 className='principale-section-title'>
                    <span className="material-symbols-outlined" aria-hidden="true">eco</span>
                    Le constat terrain
                </h2>
                <div className='principale-constat-content'>
                    <ConstatElement 
                        text="Une culture mal suivie consomme trop d’eau et réagit trop tard aux changements." 
                        right = {false}
                    />
                    <ConstatElement
                        text="Sans données simples, l’humidité du sol, la ventilation et la température demandent trop d’attention."
                        right = {true}
                    />
                    <ConstatElement
                        text="Les exploitations ont besoin d’un kit clair, fiable et rapide à comprendre au quotidien."
                        right = {false}
                    />
                </div>
            </section>
            <section className='principale-solution'>
                <h2 className='principale-section-title'>
                    <span className="material-symbols-outlined" aria-hidden="true">memory</span>
                    Une serre plus sereine
                </h2>
                <p className='principale-solution-copy'>
                    Les bonnes informations au bon moment, sans bruit inutile.
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
                        Ouvrir ma serre
                    </button>
                    <button
                        type="button"
                        className='principale-solution-cta-secondary'
                        onClick={() => {
                            window.location.href = '/payement';
                        }}
                    >
                        Voir le kit
                    </button>
                </div>
            </section>
            <section className='principale-faq'>
                <h2 className='principale-section-title'>
                    <span className="material-symbols-outlined" aria-hidden="true">help</span>
                    Questions utiles
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
                    <span className='principale-final-cta-kicker'>Technologie calme, cultures protégées</span>
                    <h2 className='principale-section-title principale-section-title-inverse'>
                        <span className="material-symbols-outlined" aria-hidden="true">spa</span>
                        Reprends la main sur tes parcelles
                    </h2>
                    <p>Un suivi lisible pour agir vite sur l’eau, l’air, la lumière et la température.</p>
                </div>
                <div className='principale-final-cta-action'>
                    <button
                        type="button"
                        className='principale-final-cta-primary'
                        onClick={() => {
                            window.location.href = '/manager';
                        }}
                    >
                        Commander le kit
                    </button>
                </div>
            </section>
        </main>
    )
}

export default Principale;
