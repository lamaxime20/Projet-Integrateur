import React, { useState, useEffect } from 'react';
import { 
    charger_seuils_actuels, 
    enregistrer_nouveau_seuil, 
    charger_historique_seuils 
} from '../../utils/seuils';
import '../../assets/styles/components/application/seuils.css'

const Seuils = ({ microcontroleurId }) => {
    const [capteurs, setCapteurs] = useState([]);
    const [selectedCapteur, setSelectedCapteur] = useState(null);
    const [formValues, setFormValues] = useState({ min: 0, max: 0 });
    const [historique, setHistorique] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        initialiserDonnees();
    }, [microcontroleurId]);

    const initialiserDonnees = async () => {
        setLoading(true);
        try {
            const [dataSeuils, dataHistory] = await Promise.all([
                charger_seuils_actuels(microcontroleurId),
                charger_historique_seuils(microcontroleurId)
            ]);
            setCapteurs(dataSeuils);
            setHistorique(dataHistory);
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

        try {
            const result = await enregistrer_nouveau_seuil({
                microcontroleur_id: microcontroleurId,
                grandeur_id: selectedCapteur.id,
                valeur_min: formValues.min,
                valeur_max: formValues.max
            });

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                // Rafraîchir l'historique après modification
                const newHistory = await charger_historique_seuils(microcontroleurId);
                setHistorique(newHistory);
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

                {/* Section Historique */}
                <section className="history-section card">
                    <h3>
                        <span className="material-symbols-outlined" aria-hidden="true">history</span>
                        Historique des changements
                    </h3>
                    <div className="history-list">
                        {historique.map(h => (
                            <div key={h.id} className="history-item">
                                <div className="history-date">{h.date}</div>
                                <div className="history-content">
                                    <strong>{h.capteur}</strong> : passage de 
                                    <span className="old-values"> [{h.ancien_min} - {h.ancien_max}] </span> à 
                                    <span className="new-values"> [{h.nouveau_min} - {h.nouveau_max}] </span>
                                    <span className="author">par {h.auteur}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Seuils;