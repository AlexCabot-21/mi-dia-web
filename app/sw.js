// Mi Día sin conexión. scripts/build_web.sh rellena VERSION y FILES al compilar.
const VERSION = '1.22.0+39-1794756377';
const FILES = ["./", "assets/AssetManifest.bin", "assets/AssetManifest.bin.json", "assets/assets/images/mascota.png", "assets/assets/sounds/boing.wav", "assets/assets/sounds/ding.wav", "assets/assets/sounds/drop.wav", "assets/assets/sounds/fanfare.wav", "assets/assets/sounds/go.wav", "assets/assets/sounds/pop.wav", "assets/assets/sounds/set.wav", "assets/assets/sounds/success.wav", "assets/assets/sounds/tick.wav", "assets/FontManifest.json", "assets/fonts/fallback/Roboto-Regular.ttf", "assets/fonts/MaterialIcons-Regular.otf", "assets/packages/flutter_local_notifications_web/web/notifications_service_worker.js", "assets/packages/flutter_map/lib/assets/flutter_map_logo.png", "assets/packages/wakelock_plus/assets/no_sleep.js", "assets/packages/youtube_player_iframe/assets/player.html", "assets/shaders/ink_sparkle.frag", "assets/shaders/stretch_effect.frag", "canvaskit/canvaskit.js", "canvaskit/canvaskit.wasm", "canvaskit/chromium/canvaskit.js", "canvaskit/chromium/canvaskit.wasm", "favicon.png", "flutter_bootstrap.js", "flutter.js", "icons/apple-touch-icon.png", "icons/Icon-192.png", "icons/Icon-512.png", "icons/Icon-maskable-192.png", "icons/Icon-maskable-512.png", "main.dart.js", "manifest.json", "version.json"];
const CACHE = 'midia-' + VERSION;
const FONTS = 'midia-fuentes';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((k) => k.startsWith('midia-') && k !== CACHE && k !== FONTS)
        .map((k) => caches.delete(k))))
      .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fuentes de Google (emojis, letras): no cambian, primero la copia.
  if (url.host === 'fonts.gstatic.com' || url.host === 'fonts.googleapis.com') {
    e.respondWith(caches.open(FONTS).then((c) => c.match(req).then((hit) => hit ||
      fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }))));
    return;
  }
  if (url.origin !== self.location.origin) return; // mapas, rutas, vídeos: siempre de internet

  // La app: la versión del archivo instalada; sin red, si no, la de internet.
  e.respondWith(caches.open(CACHE).then((c) => {
    const key = req.mode === 'navigate' ? new URL('./', self.location).href : req;
    return c.match(key, { ignoreSearch: true }).then((hit) => hit ||
      fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }));
  }));
});
