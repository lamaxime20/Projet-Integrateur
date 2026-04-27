import heroImage from '../assets/images/accueil/hero.png';
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
        </main>
    )
}

export default Principale;
