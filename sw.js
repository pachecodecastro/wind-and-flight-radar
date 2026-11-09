// Service worker: keeps the app shell available offline. Weather and flight
// requests always go to the network, so data is never served stale from here.
const CACHE = 'rdv-shell-v2';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/app.js',
  'js/basemap.js',
  'js/cities.js',
  'js/colors.js',
  'js/config.js',
  'js/field.js',
  'js/flights.js',
  'js/flights-sim.js',
  'js/geo.js',
  'js/i18n.js',
  'js/weather.js',
  'js/wind-layer.js',
  'vendor/leaflet/leaflet.js',
  'vendor/leaflet/leaflet.css',
  'vendor/topojson-client.min.js',
  'data/countries-50m.json',
  'icons/icon.svg',
  'icons/icon-192.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Same-origin files: serve from cache, refresh in the background.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});
