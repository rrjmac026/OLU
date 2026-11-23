// Our Little Universe: service worker for web push notifications.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const isIos = /iPhone|iPad|iPod/.test(self.navigator.userAgent);

self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Our Little Universe';

  const options = {
    body: data.body || 'You have something new 💗',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/badge-72.png',
    tag: data.tag || undefined,
    // A newer push with the same tag replaces the old one but still buzzes.
    renotify: Boolean(data.tag),
    data: { url: data.url || '/' },
  };

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // If the site is open in front of her, the in-app badges already show it.
      // iOS requires every push to show a notification, so never skip there.
      const siteIsVisible = windows.some((w) => w.visibilityState === 'visible');
      if (siteIsVisible && !isIos) {
        return;
      }

      await self.registration.showNotification(title, options);
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const target = new URL(
    (event.notification.data && event.notification.data.url) || '/',
    self.location.origin,
  ).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of windows) {
        if ('focus' in client) {
          await client.focus();
          if ('navigate' in client) {
            try {
              await client.navigate(target);
            } catch (e) {
              // Ignore: the window is already focused.
            }
          }
          return;
        }
      }

      await self.clients.openWindow(target);
    })(),
  );
});