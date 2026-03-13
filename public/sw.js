// Xalanify Service Worker - com suporte para background media playback + auto-refresh
// Dynamic cache name with version - gets from client message
let CACHE_NAME = 'xalanify-v0.70.5';
let LAST_VERSION = '0.70.4';
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
  
  // Notify clients of new version
  event.waitUntil(self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'NEW_SW_VERSION', version: LAST_VERSION });
    });
  }));
});

// Fetch - Network-first strategy for fresh content
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // ========== MEDIA STREAMS - Always fresh ==========
  if (event.request.destination === 'audio' || 
      event.request.destination === 'video' ||
      url.pathname.includes('/api/stream/') ||
      url.hostname.includes('googlevideo') ||
      url.hostname.includes('youtubei')) {
    event.respondWith(fetch(event.request).catch(() => new Response('Media not available', { status: 408 })));
    return;
  }
  
// ========== APIs - Network first, NO CACHE FOR POST ==========
  if (url.pathname.startsWith('/api/') || 
      url.hostname.includes('supabase') || 
      url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('spotify') ||
      url.hostname.includes('youtube') ||
      url.hostname.includes('itunes')) {
    // NO CACHING FOR ANY API REQUESTS - fresh data only
    event.respondWith(fetch(event.request).catch(() => new Response('API offline', { status: 503 })));
    return;
  }
  
  // ========== JS/CSS - Stale-while-revalidate (1h max cache) ==========
  if (event.request.destination === 'script' || event.request.destination === 'style') {
    event.respondWith(
      caches.open(`${CACHE_NAME}-assets`).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          // Background update
          fetch(event.request.clone()).then(networkResponse => {
            if (networkResponse.ok) cache.put(event.request, networkResponse.clone());
          }).catch(() => {});
          return cachedResponse;
        }
        // Network fallback
        const networkResponse = await fetch(event.request);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      })
    );
    return;
  }
  
  // ========== Everything else - Cache-first with 1h expiry ==========
  event.respondWith(
    caches.open(`${CACHE_NAME}-static`).then(async (cache) => {
      let cachedResponse = await cache.match(event.request);
      
      // Check cache age (simple heuristic)
      if (cachedResponse) {
        const cacheHeaders = cachedResponse.headers.get('x-cache-timestamp');
        if (cacheHeaders && (Date.now() - parseInt(cacheHeaders)) > 3600000) { // 1h
          cachedResponse = null;
        }
      }
      
      if (cachedResponse) {
        // Background refresh
        fetch(event.request.clone()).then(networkResponse => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
        }).catch(() => {});
        return cachedResponse;
      }
      
      const networkResponse = await fetch(event.request);
      if (networkResponse.ok) {
        const responseWithCache = new Response(networkResponse.body, {
          status: networkResponse.status,
          statusText: networkResponse.statusText,
          headers: {
            ...networkResponse.headers,
            'x-cache-timestamp': Date.now().toString(),
            'cache-control': 'max-age=3600'
          }
        });
        cache.put(event.request, responseWithCache.clone());
      }
      return networkResponse;
    })
  );
});

// Handle messages do client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SET_CACHE_NAME') {
    CACHE_NAME = 'xalanify-v' + event.data.version;
    LAST_VERSION = event.data.version;
    console.log('[SW] Cache name updated:', CACHE_NAME);
    if (event.ports[0]) {
      event.ports[0].postMessage({ status: 'cache-updated', version: LAST_VERSION });
    }
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    if (event.ports[0]) {
      event.ports[0].postMessage({ version: LAST_VERSION, cacheName: CACHE_NAME });
    }
  }
  
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    self.skipWaiting();
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ type: 'sw-updated', version: LAST_VERSION }));
    });
  }
  
  if (event.data && event.data.type === 'UPDATE_VERSION') {
    LAST_VERSION = event.data.version;
    console.log('[SW] Version updated:', LAST_VERSION);
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

