const CACHE_NAME = 'sobanukirwa-v6';
const API_CACHE = 'sobanukirwa-api-v1';
const MEDIA_CACHE = 'sobanukirwa-media-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './Css/style.css',
  './Javascript/data.js',
  './Javascript/api.js',
  './Javascript/script.js',
  './Sounds/Adhan1.mpeg',
  './Sounds/Adhan2.mpeg',
  './Sounds/Mansour_Adhan.mpeg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Poppins:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('[SW] Some static assets failed, caching individually');
        return Promise.allSettled(
          STATIC_ASSETS.map(url => cache.add(url).catch(() => console.log('[SW] Failed to cache:', url)))
        );
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok && event.request.method === 'GET') {
            const clone = response.clone();
            caches.open(API_CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.method === 'GET') {
            return caches.match(event.request);
          }
          return new Response(JSON.stringify({ message: 'Offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
        })
    );
    return;
  }

  if (url.pathname.startsWith('/uploads/')) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(cache => {
        return cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(() => new Response('', { status: 408, statusText: 'Offline' }));
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE, MEDIA_CACHE];
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.map(name => {
          if (cacheWhitelist.indexOf(name) === -1) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});
