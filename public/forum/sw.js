/**
 * Service Worker for Verenigd Amsterdam Forum
 * Provides offline support and caching
 */

const CACHE_NAME = 'va-forum-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/main.js',
    '/assets/va-logo-white.svg',
    '/assets/amsterdam-skyline.svg',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
];

// Install event - cache resources
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // Cache hit - return response
            if (response) {
                return response;
            }

            return fetch(event.request).then(function (response) {
                // Check if we received a valid response
                if (
                    !response ||
                    response.status !== 200 ||
                    response.type !== 'basic'
                ) {
                    return response;
                }

                // Clone the response
                var responseToCache = response.clone();

                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline data
self.addEventListener('sync', function (event) {
    if (event.tag === 'va-forum-sync') {
        event.waitUntil(syncOfflineData());
    }
});

async function syncOfflineData() {
    try {
        // Get offline data from IndexedDB or localStorage
        const offlineData = await getStoredOfflineData();

        for (const item of offlineData) {
            await syncDataToServer(item);
        }

        // Clear synced data
        await clearStoredOfflineData();
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

async function getStoredOfflineData() {
    // Implementation would depend on your offline storage strategy
    return [];
}

async function syncDataToServer(data) {
    // Sync data with Firebase or your backend
    console.log('Syncing data:', data);
}

async function clearStoredOfflineData() {
    // Clear the offline data after successful sync
    console.log('Offline data cleared');
}

// Push notification handling
self.addEventListener('push', function (event) {
    const options = {
        body: event.data ? event.data.text() : 'Nieuw bericht in het forum',
        icon: '/assets/va-logo-white.svg',
        badge: '/assets/va-logo-white.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1',
        },
    };

    event.waitUntil(
        self.registration.showNotification('Verenigd Amsterdam Forum', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', function (event) {
    console.log('Notification click received.');

    event.notification.close();

    event.waitUntil(clients.openWindow('/'));
});

// Message handling from main thread
self.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
