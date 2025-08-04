const CACHE_NAME = 'meta-build-v1';
const STATIC_CACHE = 'meta-build-static-v1';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// API endpoints that should work offline
const API_ENDPOINTS = [
  '/api/tasks',
  '/api/water-intake',
  '/api/exercises',
  '/api/mind-activities',
  '/api/routine-items',
  '/api/goals',
  '/api/performance',
  '/api/streak'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static files
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request)
          .then((fetchResponse) => {
            // Cache successful responses
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return fetchResponse;
          });
      })
      .catch(() => {
        // Fallback for offline mode
        if (request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Handle API requests with offline support
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const method = request.method;
  
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful GET requests
    if (method === 'GET' && response.status === 200) {
      const responseClone = response.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache for GET requests
    if (method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // For offline POST/PATCH/DELETE, store in IndexedDB for later sync
    if (['POST', 'PATCH', 'DELETE'].includes(method)) {
      await storeOfflineRequest(request);
      return new Response(JSON.stringify({ offline: true, queued: true }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return empty array for GET requests when offline
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Store offline requests for later sync
async function storeOfflineRequest(request) {
  const body = await request.text();
  const offlineRequest = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: body,
    timestamp: Date.now()
  };
  
  // Store in localStorage as fallback (in real app, use IndexedDB)
  const offlineRequests = JSON.parse(localStorage.getItem('offlineRequests') || '[]');
  offlineRequests.push(offlineRequest);
  localStorage.setItem('offlineRequests', JSON.stringify(offlineRequests));
}

// Background sync for offline requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineRequests());
  }
});

// Sync offline requests when back online
async function syncOfflineRequests() {
  const offlineRequests = JSON.parse(localStorage.getItem('offlineRequests') || '[]');
  
  for (const req of offlineRequests) {
    try {
      await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body
      });
    } catch (error) {
      console.log('Failed to sync request:', error);
      // Keep failed requests for next sync attempt
      return;
    }
  }
  
  // Clear synced requests
  localStorage.removeItem('offlineRequests');
}

// Listen for online/offline events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SYNC_OFFLINE_REQUESTS') {
    syncOfflineRequests();
  }
});