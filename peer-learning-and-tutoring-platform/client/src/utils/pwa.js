// Service Worker Registration for PeerLearn PWA
// This should be imported and called in your main.jsx or App.jsx

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            console.log('New version available');
            
            // Optionally prompt user to refresh
            if (window.confirm('New version available! Refresh to update?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  
  console.log('Service Workers not supported');
  return null;
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    const result = await registration.unregister();
    console.log('Service Worker unregistered:', result);
    return result;
  }
};

// Background Sync for offline operations
export const requestBackgroundSync = async (tag) => {
  if ('serviceWorker' in navigator && 'sync' in registration) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log('Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }
  return false;
};

// Push Notifications
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
      )
    });
    
    console.log('Push subscription:', subscription);
    
    // Send subscription to server
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });
    
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
};

// Offline Storage Utilities
export const openOfflineDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('peerlearn-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Pending messages store
      if (!db.objectStoreNames.contains('pendingMessages')) {
        const messageStore = db.createObjectStore('pendingMessages', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        messageStore.createIndex('roomId', 'roomId', { unique: false });
      }
      
      // Cached content store
      if (!db.objectStoreNames.contains('cachedContent')) {
        db.createObjectStore('cachedContent', { keyPath: 'key' });
      }
      
      // Offline chat store
      if (!db.objectStoreNames.contains('offlineChat')) {
        const chatStore = db.createObjectStore('offlineChat', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        chatStore.createIndex('roomId', 'roomId', { unique: false });
        chatStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

export const storePendingMessage = async (messageData) => {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(['pendingMessages'], 'readwrite');
    const store = transaction.objectStore('pendingMessages');
    
    await store.add({
      ...messageData,
      timestamp: Date.now(),
      synced: false
    });
    
    // Request background sync
    await requestBackgroundSync('sync-messages');
    
    return true;
  } catch (error) {
    console.error('Failed to store pending message:', error);
    return false;
  }
};

export const getPendingMessages = async () => {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(['pendingMessages'], 'readonly');
    const store = transaction.objectStore('pendingMessages');
    
    return await store.getAll();
  } catch (error) {
    console.error('Failed to get pending messages:', error);
    return [];
  }
};

export const clearPendingMessages = async () => {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(['pendingMessages'], 'readwrite');
    const store = transaction.objectStore('pendingMessages');
    
    await store.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear pending messages:', error);
    return false;
  }
};

// Cache offline content
export const cacheContent = async (key, data) => {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(['cachedContent'], 'readwrite');
    const store = transaction.objectStore('cachedContent');
    
    await store.put({
      key,
      data,
      timestamp: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('Failed to cache content:', error);
    return false;
  }
};

export const getCachedContent = async (key) => {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(['cachedContent'], 'readonly');
    const store = transaction.objectStore('cachedContent');
    
    const result = await store.get(key);
    return result?.data || null;
  } catch (error) {
    console.error('Failed to get cached content:', error);
    return null;
  }
};

// Network status monitoring
export const monitorNetworkStatus = (callbacks) => {
  const handleOnline = () => {
    console.log('App is online');
    callbacks?.onOnline?.();
  };
  
  const handleOffline = () => {
    console.log('App is offline');
    callbacks?.onOffline?.();
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Check if app is installable
export const checkInstallability = async () => {
  if ('getInstalledRelatedApps' in navigator) {
    const relatedApps = await navigator.getInstalledRelatedApps();
    return relatedApps.length === 0;
  }
  return true;
};

// Prompt app installation
export const promptInstall = async () => {
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt();
    
    const { outcome } = await window.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted install prompt');
    } else {
      console.log('User dismissed install prompt');
    }
    
    window.deferredPrompt = null;
  }
};

// Listen for beforeinstallprompt event
export const listenForInstallPrompt = (callback) => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    callback?.(e);
  });
};

// Get PWA display mode
export const getDisplayMode = () => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  return 'browser';
};

// Check if running as installed PWA
export const isRunningAsPWA = () => {
  return getDisplayMode() !== 'browser';
};
