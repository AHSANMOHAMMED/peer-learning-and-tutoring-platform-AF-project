// Service Worker for PeerLearn PWA
// This file should be placed in the public folder and registered in the main app

const CACHE_NAME = 'peerlearn-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Dynamic content patterns to cache
const DYNAMIC_CACHE_PATTERNS = [
  /\/api\/tutors/,
  /\/api\/courses/,
  /\/api\/materials/,
  /\/api\/leaderboard/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Strategy: Network First for API calls, Cache First for static assets
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network First Strategy - try network, fallback to cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Cache First Strategy - try cache, fallback to network
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache and network both failed:', request.url);
    throw error;
  }
}

// Stale While Revalidate Strategy - serve from cache, update in background
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  const networkFetch = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then((c) => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('Background fetch failed:', request.url);
    });
  
  return cachedResponse || networkFetch;
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  return STATIC_ASSETS.some(asset => pathname === asset) ||
         pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

// Background Sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-sessions') {
    event.waitUntil(syncSessions());
  }
});

// Sync pending messages
async function syncMessages() {
  const db = await openDB('peerlearn-offline', 1);
  const pendingMessages = await db.getAll('pendingMessages');
  
  for (const message of pendingMessages) {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message.data)
      });
      
      if (response.ok) {
        await db.delete('pendingMessages', message.id);
      }
    } catch (error) {
      console.error('Failed to sync message:', error);
    }
  }
}

// Sync pending session data
async function syncSessions() {
  const db = await openDB('peerlearn-offline', 1);
  const pendingSessions = await db.getAll('pendingSessions');
  
  for (const session of pendingSessions) {
    try {
      const response = await fetch(`/api/${session.type}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session.data)
      });
      
      if (response.ok) {
        await db.delete('pendingSessions', session.id);
      }
    } catch (error) {
      console.error('Failed to sync session:', error);
    }
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.payload || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const { notification } = event;
  const { data } = notification;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Focus existing window if open
        for (const client of clientList) {
          if (client.url === data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(data.url || '/');
        }
      })
  );
});

// IndexedDB helper for offline storage
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store for pending messages
      if (!db.objectStoreNames.contains('pendingMessages')) {
        const messageStore = db.createObjectStore('pendingMessages', { keyPath: 'id', autoIncrement: true });
        messageStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Store for pending sessions
      if (!db.objectStoreNames.contains('pendingSessions')) {
        const sessionStore = db.createObjectStore('pendingSessions', { keyPath: 'id', autoIncrement: true });
        sessionStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Store for offline chat messages
      if (!db.objectStoreNames.contains('offlineChat')) {
        const chatStore = db.createObjectStore('offlineChat', { keyPath: 'id', autoIncrement: true });
        chatStore.createIndex('roomId', 'roomId', { unique: false });
        chatStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Store for cached content
      if (!db.objectStoreNames.contains('cachedContent')) {
        db.createObjectStore('cachedContent', { keyPath: 'key' });
      }
    };
  });
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

// Sync analytics data
async function syncAnalytics() {
  // Implementation would sync offline analytics data
  console.log('Background sync: Analytics');
}

// Message handler from main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_ASSETS':
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(payload.assets))
        .then(() => {
          event.ports[0].postMessage({ success: true });
        });
      break;
      
    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME)
        .then(() => {
          event.ports[0].postMessage({ success: true });
        });
      break;
      
    case 'GET_CACHE_SIZE':
      caches.open(CACHE_NAME)
        .then(cache => cache.keys())
        .then(keys => {
          event.ports[0].postMessage({ size: keys.length });
        });
      break;
      
    default:
      break;
  }
});

console.log('Service Worker: Loaded');
