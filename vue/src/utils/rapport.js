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

function csv_vers_blob(lignes) {
    const contenu = lignes.map(l => l.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    return new Blob(["﻿" + contenu], { type: "text/csv;charset=utf-8;" });
}

// ============================================================
//  MICROCONTRÔLEUR
// ============================================================

export async function generer_rapport_microcontroleur(format, dateDebut, dateFin, etats, setChargement, setErreur) {
    // API plus tard:
    // Envoyer: POST /api/rapports/microcontroleur
    //   Body: { format: "csv" | "pdf", date_debut: ISOString, date_fin: ISOString, etats: string[] }
    // Le CSV indique pour chaque date l'enchaînement des états avec leur durée.
    // Le PDF contient le graphe actuel puis le tableau du CSV.
    // Recevoir: fichier CSV ou PDF à télécharger (Content-Disposition: attachment).

    setChargement(true);
    setErreur(null);

    try {
        if (format === "csv") {
            const lignes = [
                ["Date", "État", "Début", "Fin", "Durée"],
                ["2026-05-01", "Allumé", "06:00", "11:30", "5h30min"],
                ["2026-05-01", "Éteint", "11:30", "12:00", "30min"],
                ["2026-05-01", "Allumé", "12:00", "23:59", "11h59min"],
                ["2026-05-02", "Allumé", "00:00", "08:15", "8h15min"],
                ["2026-05-02", "Éteint", "08:15", "09:00", "45min"],
                ["2026-05-02", "Allumé", "09:00", "23:59", "14h59min"],
            ];
            telecharger_blob(csv_vers_blob(lignes), `rapport_microcontroleur_${dateDebut}_${dateFin}.csv`);
        } else {
            // PDF — génération déléguée au backend
            alert("La génération du rapport PDF sera prise en charge par le backend.");
        }
    } catch {
        setErreur("Une erreur est survenue lors de la génération du rapport.");
    } finally {
        setChargement(false);
    }
}

// ============================================================
//  CAPTEURS
// ============================================================

export async function generer_rapport_capteur(capteur, format, dateDebut, dateFin, etats, setChargement, setErreur) {
    // API plus tard:
    // Envoyer: POST /api/rapports/capteurs/{capteur}
    //   Body: { format: "csv" | "pdf", date_debut: ISOString, date_fin: ISOString, etats: string[] }
    // Le CSV indique pour chaque date les états successifs du capteur avec leurs périodes.
    // Le PDF contient le graphe et le tableau.
    // Recevoir: fichier CSV ou PDF à télécharger (Content-Disposition: attachment).

    setChargement(true);
    setErreur(null);

    try {
        if (format === "csv") {
            const lignes = [
                ["Date", "État", "Début", "Fin", "Durée"],
                ["2026-05-01", "Actif", "06:00", "14:20", "8h20min"],
                ["2026-05-01", "Défaillant", "14:20", "15:00", "40min"],
                ["2026-05-01", "Actif", "15:00", "23:59", "8h59min"],
                ["2026-05-02", "Actif", "00:00", "23:59", "24h"],
            ];
            telecharger_blob(csv_vers_blob(lignes), `rapport_${capteur}_${dateDebut}_${dateFin}.csv`);
        } else {
            alert("La génération du rapport PDF sera prise en charge par le backend.");
        }
    } catch {
        setErreur("Une erreur est survenue lors de la génération du rapport.");
    } finally {
        setChargement(false);
    }
}

// ============================================================
//  ACTIONNEURS — HISTORIQUE
// ============================================================

export async function generer_rapport_actionneur(actionneur, format, dateDebut, dateFin, etats, setChargement, setErreur) {
    // API plus tard:
    // Envoyer: POST /api/rapports/actionneurs/{actionneur}
    //   Body: { format: "csv" | "pdf", date_debut: ISOString, date_fin: ISOString, etats: string[] }
    // Le CSV indique pour chaque date les états successifs de l'actionneur avec leurs périodes.
    // Le PDF contient le graphe et le tableau.
    // Recevoir: fichier CSV ou PDF à télécharger (Content-Disposition: attachment).

    setChargement(true);
    setErreur(null);

    try {
        if (format === "csv") {
            const lignes = [
                ["Date", "État", "Début", "Fin", "Durée"],
                ["2026-05-01", "En marche", "08:00", "11:00", "3h"],
                ["2026-05-01", "Arrêté", "11:00", "12:30", "1h30min"],
                ["2026-05-01", "En marche", "12:30", "18:00", "5h30min"],
                ["2026-05-02", "Arrêté", "00:00", "07:00", "7h"],
                ["2026-05-02", "En marche", "07:00", "23:59", "16h59min"],
            ];
            telecharger_blob(csv_vers_blob(lignes), `rapport_${actionneur}_${dateDebut}_${dateFin}.csv`);
        } else {
            alert("La génération du rapport PDF sera prise en charge par le backend.");
        }
    } catch {
        setErreur("Une erreur est survenue lors de la génération du rapport.");
    } finally {
        setChargement(false);
    }
}

// ============================================================
//  ACTIONNEURS — INSTRUCTIONS
// ============================================================

export async function generer_rapport_instructions(actionneur, format, dateDebut, dateFin, setChargement, setErreur) {
    // API plus tard:
    // Envoyer: POST /api/rapports/actionneurs/{actionneur}/instructions
    //   Body: { format: "csv" | "pdf", date_debut: ISOString, date_fin: ISOString }
    // Le CSV liste toutes les instructions de l'actionneur : id, date, action, durée, statut.
    // Le PDF présente le même tableau mis en forme.
    // Recevoir: fichier CSV ou PDF à télécharger (Content-Disposition: attachment).

    setChargement(true);
    setErreur(null);

    try {
        if (format === "csv") {
            const lignes = [
                ["ID", "Date de la demande", "Action", "Durée", "Statut"],
                ["instr_1", "2026-05-01 08:00", "Allumer", "30min", "Terminé"],
                ["instr_2", "2026-05-01 11:00", "Arrêter", "60min", "Terminé"],
                ["instr_3", "2026-05-02 09:00", "Allumer", "45min", "En cours"],
                ["instr_4", "2026-05-02 14:30", "Arrêter", "15min", "En attente"],
                ["instr_5", "2026-05-03 07:00", "Allumer", "120min", "Annulé"],
            ];
            telecharger_blob(csv_vers_blob(lignes), `rapport_instructions_${actionneur}_${dateDebut}_${dateFin}.csv`);
        } else {
            alert("La génération du rapport PDF sera prise en charge par le backend.");
        }
    } catch {
        setErreur("Une erreur est survenue lors de la génération du rapport.");
    } finally {
        setChargement(false);
    }
}
