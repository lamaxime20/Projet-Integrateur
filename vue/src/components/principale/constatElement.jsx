import '../../assets/styles/components/principale/constatElement.css';

function ConstatElement({ text, right }) {
    return (
        <div className={`constatElement-root constatElement-${right ? 'right' : 'left'}`}>
            <span className="material-symbols-outlined" aria-hidden="true">grass</span>
            <p>{text}</p>
        </div>
    )
}

export default ConstatElement;
