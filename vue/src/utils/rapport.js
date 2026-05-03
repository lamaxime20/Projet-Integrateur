import API_BASE_URL from './config.js';

function telecharger_blob(blob, nomFichier) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function obtenirNomMicrocontroleur() {
    try {
        const micro = JSON.parse(localStorage.getItem('microcontroleur_actuel'));
        return micro?.nom ?? null;
    } catch {
        return null;
    }
}

async function telechargerRapport(path, body, nomFichier) {
    const nomMicro = obtenirNomMicrocontroleur();
    const params = nomMicro ? `?microcontroleur=${encodeURIComponent(nomMicro)}` : '';
    const response = await fetch(`${API_BASE_URL}${path}${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "Une erreur est survenue lors de la génération du rapport.");
    }

    const blob = await response.blob();
    telecharger_blob(blob, nomFichier);
}

// ============================================================
//  MICROCONTRÔLEUR
// ============================================================

export async function generer_rapport_microcontroleur(format, dateDebut, dateFin, etats, setChargement, setErreur) {
    setChargement(true);
    setErreur(null);

    try {
        await telechargerRapport('/rapports/microcontroleur', {
            format,
            date_debut: dateDebut,
            date_fin: dateFin,
            etats,
        }, `rapport_microcontroleur_${dateDebut}_${dateFin}.${format}`);
    } catch (error) {
        setErreur(error.message);
    } finally {
        setChargement(false);
    }
}

// ============================================================
//  CAPTEURS
// ============================================================

export async function generer_rapport_capteur(capteur, format, dateDebut, dateFin, etats, setChargement, setErreur) {
    setChargement(true);
    setErreur(null);

    try {
        await telechargerRapport(`/rapports/capteurs/${capteur}`, {
            format,
            date_debut: dateDebut,
            date_fin: dateFin,
            etats,
        }, `rapport_${capteur}_${dateDebut}_${dateFin}.${format}`);
    } catch (error) {
        setErreur(error.message);
    } finally {
        setChargement(false);
    }
}

export async function generer_rapport_mesures_capteur(capteur, format, dateDebut, dateFin, setChargement, setErreur) {
    setChargement(true);
    setErreur(null);

    try {
        await telechargerRapport(`/rapports/capteurs/${capteur}/mesures`, {
            format,
            date_debut: dateDebut,
            date_fin: dateFin,
        }, `rapport_mesures_${capteur}_${dateDebut}_${dateFin}.${format}`);
    } catch (error) {
        setErreur(error.message);
    } finally {
        setChargement(false);
    }
}

// ============================================================
//  ACTIONNEURS — HISTORIQUE
// ============================================================

export async function generer_rapport_actionneur(actionneur, format, dateDebut, dateFin, etats, setChargement, setErreur) {
    setChargement(true);
    setErreur(null);

    try {
        await telechargerRapport(`/rapports/actionneurs/${actionneur}`, {
            format,
            date_debut: dateDebut,
            date_fin: dateFin,
            etats,
        }, `rapport_${actionneur}_${dateDebut}_${dateFin}.${format}`);
    } catch (error) {
        setErreur(error.message);
    } finally {
        setChargement(false);
    }
}

// ============================================================
//  ACTIONNEURS — INSTRUCTIONS
// ============================================================

export async function generer_rapport_instructions(actionneur, format, dateDebut, dateFin, setChargement, setErreur) {
    setChargement(true);
    setErreur(null);

    try {
        await telechargerRapport(`/rapports/actionneurs/${actionneur}/instructions`, {
            format,
            date_debut: dateDebut,
            date_fin: dateFin,
        }, `rapport_instructions_${actionneur}_${dateDebut}_${dateFin}.${format}`);
    } catch (error) {
        setErreur(error.message);
    } finally {
        setChargement(false);
    }
}
