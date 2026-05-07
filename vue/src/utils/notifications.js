import API_BASE_URL from './config.js';
import echo from './echo.js';
import { getSessionSnapshot } from './user.js';

async function requeteNotifications(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
        },
        ...options,
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "Impossible d'effectuer cette action.");
    }

    return await response.json();
}

export function charger_notifications_temps_reel(filtre, setNotifications, setCompteurs, setErreur) {
    const charger = async () => {
        try {
            const params = filtre === "toutes" ? "" : `?filtre=${encodeURIComponent(filtre)}`;
            const data = await requeteNotifications(`/notifications${params}`, { method: 'GET' });
            setNotifications(data.notifications ?? []);
            setCompteurs(data.compteurs ?? { toutes: 0, lues: 0, non_lues: 0 });
            setErreur(null);
        } catch (error) {
            setErreur(error.message);
        }
    };

    // 1. INIT API
    charger();

    // 2. WebSocket — nouvelle alerte → recharge la liste
    const userId = getSessionSnapshot()?.user?.id;
    if (!userId) return () => {};

    const canal = echo.private(`alertes.${userId}`);

    const callback = () => charger();

    canal.listen('.NouvelleAlerte', callback);

    return () => canal.stopListening('.NouvelleAlerte', callback);
}

export async function marquer_notification_lue(id) {
    return await requeteNotifications(`/notifications/${encodeURIComponent(id)}/lue`, {
        method: 'PATCH',
        body: JSON.stringify({}),
    });
}

export async function marquer_toutes_notifications_lues() {
    return await requeteNotifications('/notifications/toutes/lues', {
        method: 'PATCH',
        body: JSON.stringify({}),
    });
}

export async function appliquer_action_notifications(ids, action) {
    return await requeteNotifications('/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ ids, action }),
    });
}

export function obtenir_route_notification(notification) {
    return notification.cible_url ?? "/application/statistique";
}
