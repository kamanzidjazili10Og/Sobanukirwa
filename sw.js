const CACHE_NAME = 'sobanukirwa-v9';
const API_CACHE = 'sobanukirwa-api-v3';
const MEDIA_CACHE = 'sobanukirwa-media-v3';
const STATIC_CACHE = 'sobanukirwa-static-v9';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './Css/style.css?v=9',
  './Javascript/data.js?v=9',
  './Javascript/api.js?v=9',
  './Javascript/script.js?v=9',
  './Images/logo2.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './Sounds/Adhan1.mpeg',
  './Sounds/Adhan2.mpeg',
  './Sounds/Mansour_Adhan.mpeg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Poppins:wght@300;400;500;600;700&display=swap'
];

const API_VERSION_KEY = 'sobanukirwa_server_version';
const OFFLINE_DATA_KEY = 'sobanukirwa_offline_data';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
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

  if (url.pathname === '/api/version') {
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        clone.json().then(data => {
          caches.open(API_CACHE).then(cache => {
            cache.put(event.request, response.clone());
          });
          caches.open(API_CACHE).then(cache => {
            cache.put(new Request(API_VERSION_KEY), new Response(JSON.stringify(data)));
          });
        }).catch(() => {});
        return response;
      }).catch(() => {
        return caches.open(API_CACHE).then(cache => {
          return cache.match(API_VERSION_KEY).then(resp => {
            if (resp) return resp;
            return new Response(JSON.stringify({ version: 0 }), { headers: { 'Content-Type': 'application/json' } });
          });
        });
      })
    );
    return;
  }

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
            return caches.open(API_CACHE).then(cache => {
              return cache.match(event.request).then(cached => {
                return cached || new Response(JSON.stringify({ offline: true, data: [] }), {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                });
              });
            });
          }
          return new Response(JSON.stringify({ message: 'Offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
        })
    );
    return;
  }

  if (url.pathname.startsWith('/uploads/') || /^\/?Videos\//i.test(url.pathname) || /\.(mp4|webm|ogg|mp3|wav|m4a|pdf|docx?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(cache => {
        return cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(() => {
            return new Response('', { status: 408, statusText: 'Offline - Content not cached' });
          });
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.match(event.request).then(cached => {
        if (cached) {
          fetch(event.request).then(response => {
            if (response && response.ok) {
              cache.put(event.request, response.clone());
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          const clone = response.clone();
          cache.put(event.request, clone);
          return response;
        }).catch(() => {
          if (event.request.destination === 'document') {
            return cache.match('./index.html');
          }
          return new Response('', { status: 408 });
        });
      });
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, STATIC_CACHE, API_CACHE, MEDIA_CACHE];
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

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CONTENT_UPDATED') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ type: 'REFRESH_DATA' }));
    });
  }
  if (event.data && event.data.type === 'CACHE_API_DATA') {
    const { url, data } = event.data;
    if (url && data) {
      caches.open(API_CACHE).then(cache => {
        cache.put(new Request(url), new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        }));
      });
    }
  }
  if (event.data && event.data.type === 'CACHE_MEDIA') {
    const { url } = event.data;
    if (url) {
      caches.open(MEDIA_CACHE).then(cache => {
        fetch(url).then(response => {
          if (response.ok) cache.put(url, response);
        }).catch(() => {});
      });
    }
  }
});
