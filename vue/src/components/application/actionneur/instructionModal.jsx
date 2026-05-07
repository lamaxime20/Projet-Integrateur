import { useState } from "react";
import "../../../assets/styles/components/application/actionneur/instructionModal.css";

function InstructionModal({ actionneur, action, isOpen, isSubmitting = false, onClose, onConfirm }) {
    const [duree, setDuree] = useState(30);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (isSubmitting) return;

        onConfirm(duree);
    };

    const handleCancel = () => {
        if (isSubmitting) return;

        onClose();
        setDuree(30);
    };

    return (
        <>
            <div className="instructionModal-backdrop" onClick={handleCancel}></div>
            <div className="instructionModal-root" role="dialog" aria-modal="true" aria-labelledby="instructionModal-titre">
                <div className="instructionModal-content">
                    <h2 id="instructionModal-titre" className="instructionModal-titre">
                        {action === "allumer" ? "Activer" : "Mettre en pause"} le {actionneur}
                    </h2>

                    <div className="instructionModal-body">
                        <label htmlFor="duree-input" className="instructionModal-label">
                            Durée d’action
                        </label>
                        <div className="instructionModal-duree-control">
                            <button
                                type="button"
                                className="instructionModal-duree-btn"
                                onClick={() => setDuree(Math.max(1, duree - 5))}
                                disabled={isSubmitting}
                            >
                                −
                            </button>
                            <input
                                id="duree-input"
                                type="number"
                                min="1"
                                max="1440"
                                value={duree}
                                onChange={(e) => setDuree(Math.max(1, Math.min(1440, parseInt(e.target.value) || 1)))}
                                className="instructionModal-duree-input"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                className="instructionModal-duree-btn"
                                onClick={() => setDuree(Math.min(1440, duree + 5))}
                                disabled={isSubmitting}
                            >
                                +
                            </button>
                        </div>
                        <p className="instructionModal-duree-unit">minutes</p>
                        <p className="instructionModal-duree-info">
                            {duree < 60 ? `${duree}min` : `${Math.floor(duree / 60)}h ${duree % 60}min`}
                        </p>
                    </div>

                    <div className="instructionModal-actions">
                        <button
                            type="button"
                            className="instructionModal-btn-cancel"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            className="instructionModal-btn-confirm"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Envoi en cours..." : "Confirmer"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default InstructionModal;
