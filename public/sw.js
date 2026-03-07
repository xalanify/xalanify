// Xalanify Service Worker - com suporte para background media playback
const CACHE_NAME = 'xalanify-v5';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Instalação
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  // Skip waiting para ativar imediatamente
  self.skipWaiting();
});

// Ativação - limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Claim todos os clients imediatamente
      return self.clients.claim();
    })
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // ========== MEDIA STREAMS - Never cache, always fetch ==========
  if (event.request.destination === 'audio' || 
      event.request.destination === 'video' ||
      url.pathname.includes('/api/stream/') ||
      url.hostname.includes('googlevideo') ||
      url.hostname.includes('youtubei')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('Media not available', { status: 408 });
      })
    );
    return;
  }
  
  // Para APIs e URLs dinâmicas, network first
  if (url.pathname.startsWith('/api/') || 
      url.hostname.includes('supabase') || 
      url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('youtube') ||
      url.hostname.includes('itunes')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Para assets estáticos, cache first with network fallback
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // Em background, verificar atualização para scripts/styles
          if (event.request.destination === 'script' || event.request.destination === 'style') {
            fetch(event.request).then(networkResponse => {
              if (networkResponse.ok) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, networkResponse);
                });
              }
            }).catch(() => {});
          }
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});

// Handle messages do client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  // Media Session messages from client
  if (event.data && event.data.type === 'MEDIA_STATE') {
    console.log('[SW] Media state:', event.data.state);
  }
});

// Background sync for playlists (optional future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-playlists') {
    event.waitUntil(syncPlaylists());
  }
});

async function syncPlaylists() {
  console.log('[SW] Syncing playlists...');
  // Placeholder for future playlist sync
}

