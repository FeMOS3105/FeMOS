/* ================================================================
   FeMOS Service Worker v1.0
   Offline-first caching strategy
================================================================ */

const CACHE_NAME = 'femos-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/pages/login.html',
  '/pages/register.html',
  '/pages/profile-setup.html',
  '/pages/home.html',
  '/pages/attendance.html',
  '/pages/announcements.html',
  '/pages/compose.html',
  '/pages/profile.html',
  '/css/style.css',
  '/js/app.js',
  '/js/auth.js',
  '/js/db.js',
  '/js/router.js',
  '/js/utils.js',
  '/assets/logo-96.png',
  '/assets/logo-192.png',
  '/manifest.json',
];

// Install — cache all static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — Cache First for assets, Network First for API
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API calls → Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Static → Cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      });
    }).catch(() => caches.match('/index.html'))
  );
});

// Background sync for offline queue
self.addEventListener('sync', e => {
  if (e.tag === 'femos-sync') {
    e.waitUntil(syncOfflineQueue());
  }
});

async function syncOfflineQueue() {
  // Process queued attendance and announcements
  console.log('[SW] Processing offline sync queue');
}
