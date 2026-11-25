import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { router } from '@inertiajs/react';
import { xsrfToken } from './http';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let instance: Echo<'reverb'> | null = null;

export function resetEcho(): void {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}

/** One connection for the whole session, shared by the chat page and the sidebar dot. */
export function getEcho(): Echo<'reverb'> {
  if (instance) {
    return instance;
  }

  window.Pusher = Pusher;
  (window.Pusher as any).logToConsole = true;

  // Dev (npm run dev): connect to whatever address the page was opened from
  // (PC or phone) on Reverb's default port 8080. No .env values involved.
  // Production (npm run build): use the baked-in VITE_* values.
  const dev = import.meta.env.DEV;

  const host = dev ? window.location.hostname : import.meta.env.VITE_REVERB_HOST;
  const port = dev ? 8080 : Number(import.meta.env.VITE_REVERB_PORT ?? 443);
  const tls = dev ? false : (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https';

  console.log('ECHO CONFIG', { dev, host, port, tls, key: import.meta.env.VITE_REVERB_APP_KEY });

  instance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY ?? 'olu-key',
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: tls,
    enabledTransports: ['ws', 'wss'],
    auth: { headers: { 'X-XSRF-TOKEN': xsrfToken() } },
  });

  return instance;
}

// Logged out -> drop the connection, so the next login builds a fresh one with the new session token.
router.on('success', (event) => {
  const props = event.detail.page.props as { auth?: { user?: unknown } };
  if (!props.auth?.user) {
    resetEcho();
  }
});
