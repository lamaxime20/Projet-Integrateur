import '../../assets/styles/components/principale/constatElement.css';

function ConstatElement({ text, right }) {
    return (
        <div className={`constatElement-root constatElement-${right ? 'right' : 'left'}`}>
            <p>{text}</p>
        </div>
    )
}

export default ConstatElement;