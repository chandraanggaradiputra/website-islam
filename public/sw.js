// --- SERVICE WORKER BANTEN MENGAJI PWA ---
const CACHE_NAME = 'banten-mengaji-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Network-first dengan fallback ke cache untuk aset statis
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// --- PUSH NOTIFICATION HANDLER BANTEN MENGAJI ---
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = {
      title: 'Banten Mengaji',
      body: event.data.text(),
    };
  }

  const title = payload.title || 'Banten Mengaji';
  const options = {
    body: payload.body || 'Informasi kajian sunnah terbaru di Banten.',
    icon: payload.icon || '/banten-mengaji.jpeg',
    badge: payload.badge || '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: payload.url || '/',
      dateOfArrival: Date.now(),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Fokuskan tab jika targetUrl sudah terbuka
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Buka window baru jika belum ada tab aktif yang sesuai
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
