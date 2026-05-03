import React, { useState, useEffect } from 'react';
import { 
    charger_seuils_actuels, 
    enregistrer_nouveau_seuil
} from '../../utils/seuils';
import { charger_microcontroleur_local } from '../../utils/microcontroleur';
import '../../assets/styles/components/application/seuils.css'

const DEFAULT_MICROCONTROLEUR_ID = charger_microcontroleur_local();

const Seuils = ({ microcontroleurId }) => {
    const controllerId = microcontroleurId || DEFAULT_MICROCONTROLEUR_ID;
    const [capteurs, setCapteurs] = useState([]);
    const [selectedCapteur, setSelectedCapteur] = useState(null);
    const [formValues, setFormValues] = useState({ min: 0, max: 0 });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        initialiserDonnees();
    }, [controllerId]);

    const initialiserDonnees = async () => {
        setLoading(true);
        try {
            const dataSeuils = await charger_seuils_actuels(controllerId);
            setCapteurs(dataSeuils);
            if (dataSeuils.length > 0) {
                selectCapteur(dataSeuils[0]);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors du chargement des données.' });
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
        setMessage({ type: '', text: '' });

        if (!selectedCapteur) {
            setMessage({ type: 'error', text: 'Aucun seuil sélectionné.' });
            return;
        }

        try {
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
        }
    };

    if (loading) return <div className="loading-state">Chargement des paramètres...</div>;

    return (
        <div className="seuils-container">
            <header className="seuils-header">
                <h1>Configuration des Seuils d'Activation</h1>
                <p>Définissez les limites de fonctionnement pour vos capteurs et actionneurs.</p>
            </header>

            <div className="seuils-grid">
                {/* Section Sélection et Formulaire */}
                <section className="config-section card">
                    <div className="capteurs-selector">
                        {capteurs.map(c => (
                            <button 
                                key={c.id}
                                className={`capteur-btn ${selectedCapteur?.id === c.id ? 'active' : ''}`}
                                onClick={() => selectCapteur(c)}
                            >
                                <span className="material-symbols-outlined" aria-hidden="true">
                                    {c.code === 'temperature' ? 'device_thermostat' 
                                        : c.code === 'humidite_sol' ? 'water_drop' 
                                        : c.code === 'co2' ? 'air' 
                                        : 'light_mode'}
                                </span>
                                <span>{c.nom}</span>
                            </button>
                        ))}
                    </div>

                    {selectedCapteur && (
                        <form className="seuils-form" onSubmit={handleSave}>
                            <h3>Réglages pour : {selectedCapteur.nom}</h3>
                            
                            <div className="input-group">
                                <label>Seuil Minimal ({selectedCapteur.unite})</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={formValues.min} 
                                    onChange={(e) => setFormValues({...formValues, min: e.target.value})}
                                />
                                <small>L'actionneur s'activera en dessous de cette valeur.</small>
                            </div>

                            <div className="input-group">
                                <label>Seuil Maximal ({selectedCapteur.unite})</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={formValues.max} 
                                    onChange={(e) => setFormValues({...formValues, max: e.target.value})}
                                />
                                <small>L'actionneur s'arrêtera au-dessus de cette valeur.</small>
                            </div>

                            {message.text && (
                                <div className={`alert-message ${message.type}`}>
                                    <span className="material-symbols-outlined" aria-hidden="true">
                                        {message.type === 'success' ? 'check_circle' : 'warning'}
                                    </span>
                                    {message.text}
                                </div>
                            )}

                            <button type="submit" className="save-btn">
                                <span className="material-symbols-outlined" aria-hidden="true">save</span>
                                Enregistrer les modifications
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Seuils;