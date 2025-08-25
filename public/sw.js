/**
 * Verenigd Amsterdam - Service Worker
 * Version: Auto-generated based on timestamp
 * 
 * Optimized caching strategy with intelligent cache management
 */

// ============================================
// CONFIGURATION
// ============================================
const SW_VERSION = '2024.12.15.001'; // Update this with each deployment
const CACHE_PREFIX = 'va-';
const CACHE_NAMES = {
  STATIC: `${CACHE_PREFIX}static-${SW_VERSION}`,
  DYNAMIC: `${CACHE_PREFIX}dynamic-${SW_VERSION}`,
  IMAGES: `${CACHE_PREFIX}images-${SW_VERSION}`,
  FONTS: `${CACHE_PREFIX}fonts-stable`  // Fonts rarely change
};

// Cache duration in seconds
const CACHE_DURATION = {
  STATIC: 7 * 24 * 60 * 60,    // 7 days
  DYNAMIC: 24 * 60 * 60,        // 1 day
  IMAGES: 30 * 24 * 60 * 60,    // 30 days
  FONTS: 365 * 24 * 60 * 60     // 1 year
};

// Resources to precache during install
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/offline.html',
  '/images/verenigd-amsterdam-politiek-2025-logo_small.png',
  '/favicon/favicon.ico'
];

// Routing strategies
const ROUTING_RULES = {
  // Network-only (never cache)
  NETWORK_ONLY: [
    '/api/',
    '/admin/',
    '/sitemap.xml',
    '/robots.txt',
    '/.well-known/'
  ],
  
  // Network-first (try network, fallback to cache)
  NETWORK_FIRST: [
    '/verkiezingsprogramma/',
    '/standpunten/',
    '/nieuws/',
    '/doe-mee/',
    '/app/',
    '/over-ons/'
  ],
  
  // Cache-first (try cache, fallback to network)
  CACHE_FIRST: [
    '/images/',
    '/fonts/',
    '/favicon/'
  ],
  
  // Stale-while-revalidate (serve from cache, update in background)
  STALE_WHILE_REVALIDATE: [
    '/styles.css',
    '/script.js',
    '/manifest.json'
  ]
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if URL matches any pattern in list
 */
function matchesPattern(url, patterns) {
  const pathname = new URL(url).pathname;
  return patterns.some(pattern => pathname.startsWith(pattern));
}

/**
 * Check if cache entry is expired
 */
function isCacheExpired(response, maxAge) {
  if (!response) return true;
  
  const fetchDate = response.headers.get('sw-fetch-time');
  if (!fetchDate) return true;
  
  const age = (Date.now() - parseInt(fetchDate)) / 1000;
  return age > maxAge;
}

/**
 * Add timestamp to response for cache expiry checking
 */
function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-fetch-time', Date.now().toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

/**
 * Get appropriate cache name for request
 */
function getCacheName(request) {
  const url = new URL(request.url);
  
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    return CACHE_NAMES.IMAGES;
  }
  
  if (url.pathname.match(/\.(woff|woff2|ttf|otf)$/i)) {
    return CACHE_NAMES.FONTS;
  }
  
  if (url.pathname.match(/\.(css|js|json)$/i)) {
    return CACHE_NAMES.STATIC;
  }
  
  return CACHE_NAMES.DYNAMIC;
}

/**
 * Clean old caches
 */
async function cleanOldCaches() {
  const cacheWhitelist = Object.values(CACHE_NAMES);
  const cacheNames = await caches.keys();
  
  return Promise.all(
    cacheNames
      .filter(name => name.startsWith(CACHE_PREFIX) && !cacheWhitelist.includes(name))
      .map(name => {
        console.log('[SW] Deleting old cache:', name);
        return caches.delete(name);
      })
  );
}

// ============================================
// CACHING STRATEGIES
// ============================================

/**
 * Network-only strategy
 */
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('[SW] Network-only fetch failed:', error);
    throw error;
  }
}

/**
 * Network-first strategy with timeout
 */
async function networkFirst(request, cacheName, timeout = 5000) {
  const cache = await caches.open(cacheName);
  
  try {
    // Race between network and timeout
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    );
    
    const response = await Promise.race([networkPromise, timeoutPromise]);
    
    // Cache successful responses
    if (response && response.ok) {
      await cache.put(request, addTimestamp(response.clone()));
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // If no cache and it's a navigation, return offline page
    if (request.mode === 'navigate') {
      return cache.match('/offline.html');
    }
    
    throw error;
  }
}

/**
 * Cache-first strategy
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached && !isCacheExpired(cached, CACHE_DURATION.IMAGES)) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response && response.ok) {
      await cache.put(request, addTimestamp(response.clone()));
    }
    
    return response;
  } catch (error) {
    if (cached) {
      console.log('[SW] Network failed, serving stale cache:', request.url);
      return cached;
    }
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then(response => {
    if (response && response.ok) {
      cache.put(request, addTimestamp(response.clone()));
    }
    return response;
  }).catch(error => {
    console.error('[SW] Background fetch failed:', error);
    return null;
  });
  
  // Return cached immediately if available, otherwise wait for network
  return cached || fetchPromise;
}

// ============================================
// SERVICE WORKER EVENTS
// ============================================

/**
 * Install event - precache resources
 */
self.addEventListener('install', event => {
  console.log('[SW] Installing version:', SW_VERSION);
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAMES.STATIC);
      
      // Cache resources one by one to handle failures gracefully
      const cachePromises = PRECACHE_RESOURCES.map(async url => {
        try {
          const response = await fetch(url, { cache: 'no-cache' });
          if (response && response.ok) {
            await cache.put(url, addTimestamp(response));
            console.log('[SW] Precached:', url);
          }
        } catch (error) {
          console.warn('[SW] Failed to precache:', url, error);
        }
      });
      
      await Promise.all(cachePromises);
      
      // Skip waiting to activate immediately
      await self.skipWaiting();
    })()
  );
});

/**
 * Activate event - clean old caches
 */
self.addEventListener('activate', event => {
  console.log('[SW] Activating version:', SW_VERSION);
  
  event.waitUntil(
    (async () => {
      // Clean old caches
      await cleanOldCaches();
      
      // Take control of all clients
      await self.clients.claim();
      
      console.log('[SW] Activated and claimed clients');
    })()
  );
});

/**
 * Fetch event - route requests
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Network-only strategy
  if (matchesPattern(request.url, ROUTING_RULES.NETWORK_ONLY)) {
    event.respondWith(networkOnly(request));
    return;
  }
  
  // Network-first strategy
  if (matchesPattern(request.url, ROUTING_RULES.NETWORK_FIRST) || request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_NAMES.DYNAMIC));
    return;
  }
  
  // Cache-first strategy
  if (matchesPattern(request.url, ROUTING_RULES.CACHE_FIRST)) {
    const cacheName = getCacheName(request);
    event.respondWith(cacheFirst(request, cacheName));
    return;
  }
  
  // Stale-while-revalidate strategy
  if (matchesPattern(request.url, ROUTING_RULES.STALE_WHILE_REVALIDATE)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.STATIC));
    return;
  }
  
  // Default strategy based on request type
  const cacheName = getCacheName(request);
  
  if (cacheName === CACHE_NAMES.IMAGES || cacheName === CACHE_NAMES.FONTS) {
    event.respondWith(cacheFirst(request, cacheName));
  } else {
    event.respondWith(staleWhileRevalidate(request, cacheName));
  }
});

/**
 * Message event - handle client communication
 */
self.addEventListener('message', event => {
  console.log('[SW] Received message:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then(names => 
          Promise.all(names.map(name => caches.delete(name)))
        ).then(() => {
          event.ports[0].postMessage({ success: true });
        })
      );
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: SW_VERSION });
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(
        (async () => {
          const urls = event.data.urls || [];
          const cache = await caches.open(CACHE_NAMES.DYNAMIC);
          
          for (const url of urls) {
            try {
              const response = await fetch(url);
              if (response && response.ok) {
                await cache.put(url, addTimestamp(response));
              }
            } catch (error) {
              console.warn('[SW] Failed to cache URL:', url);
            }
          }
          
          event.ports[0].postMessage({ success: true, cached: urls.length });
        })()
      );
      break;
  }
});

/**
 * Periodic background sync (if supported)
 */
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-cache') {
    console.log('[SW] Performing periodic cache update');
    
    event.waitUntil(
      (async () => {
        // Update critical resources
        const cache = await caches.open(CACHE_NAMES.STATIC);
        const updates = PRECACHE_RESOURCES.map(async url => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response && response.ok) {
              await cache.put(url, addTimestamp(response));
            }
          } catch (error) {
            console.warn('[SW] Failed to update:', url);
          }
        });
        
        await Promise.all(updates);
      })()
    );
  }
});

// Log service worker info
console.log('[SW] Service Worker loaded - Version:', SW_VERSION);
console.log('[SW] Cache names:', CACHE_NAMES);