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
