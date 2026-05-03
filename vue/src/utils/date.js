/**
 * Source de vérité unique pour les dates.
 *
 * Principe :
 *   - Le backend stocke et renvoie TOUJOURS des dates en UTC (suffixe "Z").
 *   - Ce fichier est le seul endroit où on convertit UTC ↔ heure locale.
 *   - On ne manipule jamais des chaînes "YYYY-MM-DD" nues en dehors de ce fichier.
 */

const LOCALE = 'fr-FR';

const TZ_LOCALE = Intl.DateTimeFormat().resolvedOptions().timeZone;

// ============================================================
// AFFICHAGE — UTC → heure locale du navigateur
// ============================================================

export function formatDateHeure(isoString) {
    return _fmt(isoString, {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
}

export function formatDate(isoString) {
    return _fmt(isoString, {
        year: 'numeric', month: '2-digit', day: '2-digit',
    });
}

export function formatHeure(isoString) {
    return _fmt(isoString, {
        hour: '2-digit', minute: '2-digit',
    });
}

export function formatTempsRelatif(isoString) {
    if (!isoString) return '—';

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';

    const diffMs  = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffH   = Math.floor(diffMin / 60);
    const diffJ   = Math.floor(diffH / 24);

    if (diffSec < 60)  return "à l'instant";
    if (diffMin < 60)  return `il y a ${diffMin} min`;
    if (diffH < 24)    return `il y a ${diffH} h`;
    if (diffJ < 7)     return `il y a ${diffJ} j`;

    return formatDate(isoString);
}

// ============================================================
// SAISIE — heure locale → UTC (pour les requêtes API)
// ============================================================

/**
 * Convertit "YYYY-MM-DD" (valeur d'un <input type="date">) en ISO UTC
 * correspondant au début de ce jour dans le fuseau du navigateur.
 *
 * Exemple (UTC+1) :  "2026-05-04"  →  "2026-05-03T23:00:00.000Z"
 */
export function debutJourUTC(dateLocale) {
    if (!dateLocale) return null;

    const [year, month, day] = dateLocale.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
}

/**
 * Convertit "YYYY-MM-DD" en ISO UTC correspondant à la fin de ce jour
 * dans le fuseau du navigateur.
 *
 * Exemple (UTC+1) :  "2026-05-04"  →  "2026-05-04T22:59:59.999Z"
 */
export function finJourUTC(dateLocale) {
    if (!dateLocale) return null;

    const [year, month, day] = dateLocale.split('-').map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
}

/**
 * Retourne "YYYY-MM-DD" en heure locale à partir d'un ISO UTC (pour
 * pré-remplir un <input type="date">).
 *
 * Exemple (UTC+1) :  "2026-05-03T23:00:00.000Z"  →  "2026-05-04"
 */
export function isoVersDateLocale(isoString) {
    if (!isoString) return '';

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day   = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Retourne la date locale d'aujourd'hui au format "YYYY-MM-DD"
 * (pour initialiser un <input type="date">).
 */
export function aujourdhuiLocal() {
    return isoVersDateLocale(new Date().toISOString());
}

/**
 * Retourne la date locale d'il y a N jours au format "YYYY-MM-DD".
 */
export function ilYaJoursLocal(nbJours) {
    const d = new Date();
    d.setDate(d.getDate() - nbJours);
    return isoVersDateLocale(d.toISOString());
}

// ============================================================
// PRIVÉ
// ============================================================

function _fmt(isoString, options) {
    if (!isoString) return '—';

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat(LOCALE, { timeZone: TZ_LOCALE, ...options }).format(date);
}
