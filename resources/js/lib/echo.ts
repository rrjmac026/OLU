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

  instance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 80),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
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