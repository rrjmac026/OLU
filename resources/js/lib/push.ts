export type PushState = 'loading' | 'unsupported' | 'blocked' | 'off' | 'on';
export type PushResult = 'enabled' | 'denied' | 'unsupported' | 'error';

export function isPushSupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

function jsonHeaders(): Record<string, string> {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);

    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(match ? { 'X-XSRF-TOKEN': decodeURIComponent(match[1]) } : {}),
    };
}

function urlBase64ToUint8Array(base64: string) {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
    const out = new Uint8Array(raw.length);

    for (let i = 0; i < raw.length; i++) {
        out[i] = raw.charCodeAt(i);
    }

    return out;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });

    return navigator.serviceWorker.ready;
}

/** What the toggle should show right now for this device. */
export async function getPushState(): Promise<PushState> {
    if (!isPushSupported()) {
        return 'unsupported';
    }

    if (Notification.permission === 'denied') {
        return 'blocked';
    }

    const registration = await navigator.serviceWorker.getRegistration('/');
    const subscription = registration
        ? await registration.pushManager.getSubscription()
        : null;

    return subscription && Notification.permission === 'granted' ? 'on' : 'off';
}

/** Must be called straight from a click, or browsers block the permission prompt. */
export async function enablePush(): Promise<PushResult> {
    if (!isPushSupported()) {
        return 'unsupported';
    }

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
        return 'denied';
    }

    try {
        const registration = await registerServiceWorker();

        const keyResponse = await fetch('/push/key', {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        });
        const { publicKey } = await keyResponse.json();

        if (!publicKey) {
            return 'error';
        }

        const subscription =
            (await registration.pushManager.getSubscription()) ??
            (await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            }));

        const saved = await fetch('/push/subscribe', {
            method: 'POST',
            headers: jsonHeaders(),
            credentials: 'same-origin',
            body: JSON.stringify(subscription.toJSON()),
        });

        return saved.ok ? 'enabled' : 'error';
    } catch {
        return 'error';
    }
}

export async function disablePush(): Promise<void> {
    if (!isPushSupported()) {
        return;
    }

    const registration = await navigator.serviceWorker.getRegistration('/');
    const subscription = registration
        ? await registration.pushManager.getSubscription()
        : null;

    if (!subscription) {
        return;
    }

    await fetch('/push/unsubscribe', {
        method: 'POST',
        headers: jsonHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => undefined);

    await subscription.unsubscribe();
}