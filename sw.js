/* Service worker — schema comune a RecompApp, Bilancio e Style Wishlist.
   - VERSION è la versione dell'app: è la stessa usata in index.html come ?v=VERSION.
   - Pagina: rete con timeout di 3 secondi, poi la copia salvata (veloce anche con segnale scarso).
   - File con ?v= e icone: prima la cache; un nuovo rilascio cambia ?v= e quindi l'indirizzo.
   - Il nuovo worker resta in attesa finché l'app non chiede di attivarlo (avviso "Aggiorna"). */
const VERSION = '1.20.0';
const PREFIX = 'recompapp-';
const CACHE = PREFIX + VERSION;
const SHELL = [
  './',
  './index.html',
  './suite.js?v=1.20.0',
  './suite.css?v=1.20.0',
  './suite-tokens.css?v=1.20.0',
  './app.css?v=1.20.0',
  './data.js?v=1.20.0',
  './foods.js?v=1.20.0',
  './app.js?v=1.20.0',
  './manifest.webmanifest?v=1.20.0',
  './gym-icon-192.png?v=1.20.0',
  './gym-icon-512.png?v=1.20.0',
  './favicon-32.png?v=1.20.0',
  './apple-touch-icon-gym.png?v=1.20.0'
];
const NETWORK_TIMEOUT_MS = 3000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' }))))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  const d = event.data;
  if (d === 'skip-waiting' || (d && d.type === 'SKIP_WAITING')) self.skipWaiting();
});

function fromNetworkAndStore(request, cacheKey) {
  return fetch(request, { cache: 'no-store' }).then((response) => {
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(cacheKey || request, copy));
    }
    return response;
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    const network = fromNetworkAndStore(req, './index.html');
    event.waitUntil(network.catch(() => {}));
    const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS));
    event.respondWith(
      Promise.race([network, timeout])
        .then((res) => res || caches.match('./index.html'))
        .catch(() => caches.match('./index.html'))
        .then((res) => res || network)
    );
    return;
  }

  event.respondWith(caches.match(req).then((cached) => cached || fromNetworkAndStore(req)));
});

/* Notifiche push "Peso di oggi" (promemoria server) + notifiche locali di fine recupero. */
self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data ? event.data.text() : '' }; }
  const title = d.title || 'RecompApp';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: d.body || '',
      tag: d.tag || 'recompapp',
      icon: './gym-icon-192.png',
      badge: './gym-icon-192.png',
      data: { url: d.url || './' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Notifica di fine recupero: azioni "Completato / +15s / Salta recupero" gestite dall'app
  // (postMessage ai client aperti). Se nessun client è aperto, chiudiamo semplicemente la
  // notifica senza errori: l'app applicherà lo stato corretto quando viene riaperta.
  if (event.notification.tag === 'rest-timer') {
    const action = event.action || 'done';
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
        list.forEach((c) => c.postMessage({ type: 'rest-timer-action', action }));
        if (list.length) return list[0].focus();
        return null;
      })
    );
    return;
  }
  const target = new URL((event.notification.data && event.notification.data.url) || './', self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.startsWith(self.registration.scope)) return c.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
