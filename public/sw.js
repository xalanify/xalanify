// Xalanify Service Worker - com suporte para background media
const CACHE_NAME = 'xalanify-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Instalação
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Ativação
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - cache first para assets, network first para APIs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar requests de media (streaming)
  if (event.request.destination === 'audio' || event.request.destination === 'video') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('Media not cached', { status: 408 });
      })
    );
    return;
  }
  
  // Para APIs, network first
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase') || url.hostname.includes('firebase')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Para assets, cache first
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
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

// Media Session API - para controles de música no ecrã bloqueado
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'MEDIA_COMMAND') {
    // Forward para todos os clients
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'MEDIA_COMMAND_FROM_SW',
          command: event.data.command
        });
      });
    });
  }
});

// Handle media sessions
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
