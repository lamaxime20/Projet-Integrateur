import React, { useState, useEffect, useMemo } from 'react';
import { 
    charger_seuils_actuels, 
    enregistrer_nouveau_seuil,
    seuil_est_valide
} from '../../utils/seuils';
import { charger_microcontroleur_local } from '../../utils/microcontroleur';
import '../../assets/styles/components/application/Seuils.css'

const Seuils = ({ microcontroleurId }) => {
    const controllerId = useMemo(() => {
        if (typeof microcontroleurId === 'string') return microcontroleurId;
        if (microcontroleurId?.nom) return microcontroleurId.nom;

        return charger_microcontroleur_local()?.nom ?? '';
    }, [microcontroleurId]);

    const [capteurs, setCapteurs] = useState([]);
    const [selectedCapteur, setSelectedCapteur] = useState(null);
    const [formValues, setFormValues] = useState({ min: 0, max: 0 });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        initialiserDonnees();
    }, [controllerId]);

    const initialiserDonnees = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const dataSeuils = await charger_seuils_actuels(controllerId);
            setCapteurs(dataSeuils);
            if (dataSeuils.length > 0) {
                const seuilActif = dataSeuils.find(seuil => seuil.id === selectedCapteur?.id) || dataSeuils[0];
                selectCapteur(seuilActif);
            } else {
                setSelectedCapteur(null);
            }
        } catch (error) {
            setCapteurs([]);
            setSelectedCapteur(null);
            setMessage({ type: 'error', text: error.message || 'Erreur lors du chargement des données.' });
        } finally {
            setLoading(false);
        }
    };

    const selectCapteur = (capteur) => {
        setSelectedCapteur(capteur);
        setFormValues({ min: capteur.valeur_min, max: capteur.valeur_max });
        setMessage({ type: '', text: '' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (isSaving) return;

        setMessage({ type: '', text: '' });

        if (!selectedCapteur) {
            setMessage({ type: 'error', text: 'Aucun seuil sélectionné.' });
            return;
        }

        setIsSaving(true);

        try {
            if (!seuil_est_valide(formValues.min, formValues.max)) {
                throw new Error('La valeur minimale doit être inférieure à la valeur maximale.');
            }

            const result = await enregistrer_nouveau_seuil({
                seuil_id: selectedCapteur.id,
                valeur_min: parseFloat(formValues.min),
                valeur_max: parseFloat(formValues.max)
            });

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                const updatedCapteurs = capteurs.map(capteur =>
                    capteur.id === selectedCapteur.id
                        ? { ...capteur, valeur_min: result.seuil.valeur_min, valeur_max: result.seuil.valeur_max }
                        : capteur
                );
                setCapteurs(updatedCapteurs);
                setSelectedCapteur(updatedCapteurs.find(c => c.id === selectedCapteur.id));
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const afficherSquelette = loading && capteurs.length === 0;

    return (
        <div className="seuils-container">
            <header className="seuils-header">
                <div>
                    <p className="seuils-eyebrow">Automatisation agricole</p>
                    <h1>Seuils d’activation</h1>
                    <p>Réglez les limites qui pilotent les actionneurs et synchronisez-les avec le microcontrôleur.</p>
                </div>
                <button
                    type="button"
                    className="seuils-refresh"
                    onClick={initialiserDonnees}
                    disabled={loading || isSaving}
                    aria-label="Rafraîchir les seuils"
                >
                    <i className={`fa-solid fa-rotate${loading ? ' fa-spin' : ''}`} aria-hidden="true"></i>
                </button>
            </header>

            <div className="seuils-grid">
                <section className="seuils-panel seuils-selection">
                    <div className="seuils-panel-heading">
                        <h2>Capteurs</h2>
                        <span>{capteurs.length} seuils</span>
                    </div>

                    {afficherSquelette ? (
                        <div className="seuils-skeleton-list" aria-label="Chargement des seuils">
                            {[1, 2, 3, 4].map(item => (
                                <div className="seuils-skeleton-item" key={item}></div>
                            ))}
                        </div>
                    ) : (
                        <div className="capteurs-selector">
                            {capteurs.map(c => (
                                <button
                                    type="button"
                                    key={c.id}
                                    className={`capteur-btn ${selectedCapteur?.id === c.id ? 'active' : ''}`}
                                    onClick={() => selectCapteur(c)}
                                    disabled={isSaving}
                                >
                                    <i className={c.icone} aria-hidden="true"></i>
                                    <span>{c.nom}</span>
                                    <small>{c.valeur_min} - {c.valeur_max} {c.unite}</small>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <section className="seuils-panel seuils-edition">
                    {selectedCapteur ? (
                        <form className="seuils-form" onSubmit={handleSave}>
                            <div className="seuils-form-title">
                                <span className="seuils-icon-wrap">
                                    <i className={selectedCapteur.icone} aria-hidden="true"></i>
                                </span>
                                <div>
                                    <h2>{selectedCapteur.nom}</h2>
                                    <p>Valeurs utilisées par les automatismes du système.</p>
                                </div>
                            </div>
                            
                            <div className="input-group">
                                <label htmlFor="seuil-min">Seuil minimal ({selectedCapteur.unite})</label>
                                <input 
                                    id="seuil-min"
                                    type="number" 
                                    step="0.1"
                                    value={formValues.min} 
                                    onChange={(e) => setFormValues({...formValues, min: e.target.value})}
                                    disabled={isSaving}
                                />
                                <small>L'actionneur s'activera en dessous de cette valeur.</small>
                            </div>

                            <div className="input-group">
                                <label htmlFor="seuil-max">Seuil maximal ({selectedCapteur.unite})</label>
                                <input 
                                    id="seuil-max"
                                    type="number" 
                                    step="0.1"
                                    value={formValues.max} 
                                    onChange={(e) => setFormValues({...formValues, max: e.target.value})}
                                    disabled={isSaving}
                                />
                                <small>L'actionneur s'arrêtera au-dessus de cette valeur.</small>
                            </div>

                            {message.text && (
                                <div className={`alert-message ${message.type}`}>
                                    <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`} aria-hidden="true"></i>
                                    <span>{message.text}</span>
                                </div>
                            )}

                            <button type="submit" className="save-btn" disabled={isSaving}>
                                <i className={`fa-solid ${isSaving ? 'fa-circle-notch fa-spin' : 'fa-floppy-disk'}`} aria-hidden="true"></i>
                                {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                            </button>
                        </form>
                    ) : (
                        <div className="seuils-empty">
                            <i className="fa-solid fa-sliders" aria-hidden="true"></i>
                            <h2>Aucun seuil disponible</h2>
                            {message.text && <p>{message.text}</p>}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Seuils;
