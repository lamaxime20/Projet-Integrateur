import { useId, useState } from 'react';
import '../../assets/styles/components/principale/faqCard.css';

function FaqCard({ icon, question, answer }) {
    const [isOpen, setIsOpen] = useState(false);
    const answerId = useId();

    return (
        <article
            className={`faqCard-root ${isOpen ? 'faqCard-open' : ''}`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                type="button"
                className="faqCard-trigger"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setIsOpen((previous) => !previous)}
            >
                <span className="faqCard-icon-wrap">
                    <span className="material-symbols-outlined faqCard-icon" aria-hidden="true">
                        {icon}
                    </span>
                </span>
                <span className="faqCard-question">{question}</span>
                <span className="material-symbols-outlined faqCard-arrow" aria-hidden="true">add</span>
            </button>
            <div id={answerId} className="faqCard-answer">
                <p>{answer}</p>
            </div>
        </article>
    );
}

export default FaqCard;
