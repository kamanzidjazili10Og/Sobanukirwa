const CACHE_NAME = 'sobanukirwa-v3';
const urlsToCache = [
  './',
  './index.html',
  './Css/style.css',
  './Javascript/data.js',
  './Javascript/api.js',
  './Javascript/script.js',
  './manifest.json',
  './font-awasome/css/all.min.css',
  './Sounds/Adhan1.mpeg',
  './Sounds/Adhan2.mpeg',
  './Sounds/Mansour_Adhan.mpeg',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Poppins:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(err => {
          console.log('Cache addAll failed, caching individually');
          return Promise.allSettled(
            urlsToCache.map(url => cache.add(url).catch(() => console.log('Failed to cache:', url)))
          );
        });
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/') || event.request.url.includes('/uploads/')) {
    event.respondWith(
      fetch(event.request)
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            if (!event.request.url.includes('.mp3') && !event.request.url.includes('.mp4')) {
              cache.put(event.request, responseToCache);
            }
          });
          return response;
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
