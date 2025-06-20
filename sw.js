/**
 * Service Worker for Taiga Theme
 * Provides advanced caching, offline support, and performance optimization
 * Following shopirule.mdc specifications for blazing-fast performance
 */

const CACHE_VERSION = 'taiga-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Cache configuration
const CACHE_CONFIG = {
  staticTTL: 86400000, // 24 hours
  dynamicTTL: 3600000, // 1 hour
  imageTTL: 604800000, // 7 days
  maxEntries: {
    static: 100,
    dynamic: 50,
    images: 200
  }
};

// Static resources to cache immediately
const STATIC_RESOURCES = [
  // Core CSS
  '/assets/theme.css',
  '/assets/base.css',
  '/assets/component-header.css',
  '/assets/section-hero.css',
  '/assets/section-bubbly.css',
  
  // Core JavaScript
  '/assets/theme.js',
  '/assets/ai-navigation.js',
  '/assets/bubble-animations.js',
  '/assets/image-optimization.js',
  '/assets/performance-monitor.js',
  '/assets/intelligent-cache.js',
  
  // Essential assets
  '/assets/logo.svg',
  '/assets/icons.svg'
];

// Dynamic resource patterns
const DYNAMIC_PATTERNS = [
  { pattern: /\/products\//, strategy: 'networkFirst', ttl: 300000 }, // 5 minutes
  { pattern: /\/collections\//, strategy: 'networkFirst', ttl: 600000 }, // 10 minutes
  { pattern: /\/search/, strategy: 'networkFirst', ttl: 3600000 }, // 1 hour
  { pattern: /\/pages\//, strategy: 'cacheFirst', ttl: 86400000 }, // 24 hours
];

// Network-only patterns (never cache)
const NETWORK_ONLY_PATTERNS = [
  /\/cart\.js/,
  /\/cart\/add\.js/,
  /\/cart\/update\.js/,
  /\/cart\/change\.js/,
  /\/checkout/,
  /\/account/,
  /\/admin/
];

// Image patterns
const IMAGE_PATTERNS = [
  /cdn\.shopify\.com.*\.(jpg|jpeg|png|gif|webp|svg)/,
  /\/assets\/.*\.(jpg|jpeg|png|gif|webp|svg)/
];

// Performance metrics
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  offlineRequests: 0
};

/**
 * Install event - cache static resources
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static resources...');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('✅ Static resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static resources:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - handle all network requests
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

/**
 * Handle incoming requests with appropriate caching strategy
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Check if request should never be cached
    if (shouldNeverCache(url)) {
      performanceMetrics.networkRequests++;
      return await fetch(request);
    }
    
    // Handle images
    if (isImageRequest(url)) {
      return await handleImageRequest(request);
    }
    
    // Handle static resources
    if (isStaticResource(url)) {
      return await handleStaticRequest(request);
    }
    
    // Handle dynamic resources
    if (isDynamicResource(url)) {
      return await handleDynamicRequest(request);
    }
    
    // Default: network first
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('Request handling failed:', error);
    
    // Try to serve from cache as fallback
    const cachedResponse = await getCachedResponse(request);
    if (cachedResponse) {
      performanceMetrics.offlineRequests++;
      return cachedResponse;
    }
    
    // Return offline page if available
    return await getOfflineFallback(request);
  }
}

/**
 * Check if request should never be cached
 */
function shouldNeverCache(url) {
  return NETWORK_ONLY_PATTERNS.some(pattern => pattern.test(url.pathname));
}

/**
 * Check if request is for an image
 */
function isImageRequest(url) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(url.href));
}

/**
 * Check if request is for a static resource
 */
function isStaticResource(url) {
  return url.pathname.startsWith('/assets/') || 
         STATIC_RESOURCES.includes(url.pathname);
}

/**
 * Check if request is for a dynamic resource
 */
function isDynamicResource(url) {
  return DYNAMIC_PATTERNS.some(pattern => pattern.pattern.test(url.pathname));
}

/**
 * Handle image requests with cache-first strategy
 */
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    performanceMetrics.cacheHits++;
    
    // Check if cached image is still fresh
    const cacheDate = new Date(cachedResponse.headers.get('date'));
    const now = new Date();
    const age = now.getTime() - cacheDate.getTime();
    
    if (age < CACHE_CONFIG.imageTTL) {
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the new response
      const cache = await caches.open(IMAGE_CACHE);
      await cache.put(request, networkResponse.clone());
      
      // Clean up old entries if cache is full
      await cleanupCache(IMAGE_CACHE, CACHE_CONFIG.maxEntries.images);
    }
    
    performanceMetrics.networkRequests++;
    return networkResponse;
    
  } catch (error) {
    // Return cached version if network fails
    if (cachedResponse) {
      performanceMetrics.offlineRequests++;
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Handle static resource requests with cache-first strategy
 */
async function handleStaticRequest(request) {
  return await cacheFirst(request, STATIC_CACHE);
}

/**
 * Handle dynamic resource requests with appropriate strategy
 */
async function handleDynamicRequest(request) {
  const url = new URL(request.url);
  const pattern = DYNAMIC_PATTERNS.find(p => p.pattern.test(url.pathname));
  
  if (pattern) {
    switch (pattern.strategy) {
      case 'cacheFirst':
        return await cacheFirst(request, DYNAMIC_CACHE, pattern.ttl);
      case 'networkFirst':
        return await networkFirst(request, DYNAMIC_CACHE, pattern.ttl);
      default:
        return await networkFirst(request, DYNAMIC_CACHE);
    }
  }
  
  return await networkFirst(request, DYNAMIC_CACHE);
}

/**
 * Cache-first strategy
 */
async function cacheFirst(request, cacheName, ttl = CACHE_CONFIG.staticTTL) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Check if cached response is still fresh
    if (isCacheFresh(cachedResponse, ttl)) {
      performanceMetrics.cacheHits++;
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
    }
    
    performanceMetrics.networkRequests++;
    return networkResponse;
    
  } catch (error) {
    // Return stale cache if network fails
    if (cachedResponse) {
      performanceMetrics.offlineRequests++;
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Network-first strategy
 */
async function networkFirst(request, cacheName, ttl = CACHE_CONFIG.dynamicTTL) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
      
      // Clean up old entries if cache is full
      const maxEntries = cacheName === DYNAMIC_CACHE ? 
        CACHE_CONFIG.maxEntries.dynamic : 
        CACHE_CONFIG.maxEntries.static;
      await cleanupCache(cacheName, maxEntries);
    }
    
    performanceMetrics.networkRequests++;
    return networkResponse;
    
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      performanceMetrics.cacheHits++;
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Check if cached response is still fresh
 */
function isCacheFresh(response, ttl) {
  const cacheDate = new Date(response.headers.get('date'));
  const now = new Date();
  const age = now.getTime() - cacheDate.getTime();
  
  return age < ttl;
}

/**
 * Get any cached response for request
 */
async function getCachedResponse(request) {
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const response = await cache.match(request);
    if (response) {
      return response;
    }
  }
  
  return null;
}

/**
 * Get offline fallback response
 */
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For HTML pages, try to serve a cached page or offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    // Try to serve cached homepage
    const cache = await caches.open(DYNAMIC_CACHE);
    const homeResponse = await cache.match('/');
    if (homeResponse) {
      return homeResponse;
    }
    
    // Return simple offline message
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Offline - Taiga Theme</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            margin: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
          }
          .offline-message {
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          h1 { margin-top: 0; }
          .bubble {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        </style>
      </head>
      <body>
        <div class="bubble" style="width: 80px; height: 80px; top: 10%; left: 10%; animation-delay: 0s;"></div>
        <div class="bubble" style="width: 60px; height: 60px; top: 20%; right: 20%; animation-delay: 2s;"></div>
        <div class="bubble" style="width: 100px; height: 100px; bottom: 20%; left: 15%; animation-delay: 4s;"></div>
        
        <div class="offline-message">
          <h1>You're Offline</h1>
          <p>It looks like you're not connected to the internet.</p>
          <p>Please check your connection and try again.</p>
          <button onclick="window.location.reload()" style="
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
          ">Try Again</button>
        </div>
      </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
  
  // For other resources, return a generic error
  return new Response('Offline', { status: 503 });
}

/**
 * Clean up old cache entries
 */
async function cleanupCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    // Remove oldest entries (simple FIFO, could be improved with LRU)
    const entriesToDelete = keys.slice(0, keys.length - maxEntries);
    
    await Promise.all(
      entriesToDelete.map(key => cache.delete(key))
    );
    
    console.log(`🧹 Cleaned up ${entriesToDelete.length} entries from ${cacheName}`);
  }
}

/**
 * Handle messages from main thread
 */
self.addEventListener('message', (event) => {
  const { data } = event;
  
  switch (data.type) {
    case 'CACHE_CONFIG':
      handleCacheConfig(data.config);
      break;
      
    case 'CLEAR_CACHE':
      handleClearCache();
      break;
      
    case 'UPDATE_CACHE':
      handleUpdateCache();
      break;
      
    case 'GET_METRICS':
      event.ports[0].postMessage(performanceMetrics);
      break;
  }
});

/**
 * Handle cache configuration updates
 */
function handleCacheConfig(config) {
  if (config.version) {
    // Update cache version if needed
    console.log('📝 Cache configuration updated');
  }
  
  if (config.staticResources) {
    // Update static resources list
    STATIC_RESOURCES.length = 0;
    STATIC_RESOURCES.push(...config.staticResources);
  }
}

/**
 * Handle clear cache request
 */
async function handleClearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    
    console.log('🗑️ All caches cleared');
    
    // Reset metrics
    performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      offlineRequests: 0
    };
    
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

/**
 * Handle cache update request
 */
async function handleUpdateCache() {
  try {
    // Update static cache
    const cache = await caches.open(STATIC_CACHE);
    
    await Promise.all(
      STATIC_RESOURCES.map(async (resource) => {
        try {
          const response = await fetch(resource);
          if (response.ok) {
            await cache.put(resource, response);
          }
        } catch (error) {
          console.warn(`Failed to update cache for ${resource}:`, error);
        }
      })
    );
    
    console.log('🔄 Cache updated successfully');
    
  } catch (error) {
    console.error('Failed to update cache:', error);
  }
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Perform background sync
 */
async function doBackgroundSync() {
  // Handle any offline actions that need to be synced
  console.log('🔄 Performing background sync...');
  
  // This could include:
  // - Syncing cart updates
  // - Sending analytics data
  // - Updating user preferences
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/assets/icon-192.png',
        badge: '/assets/badge-72.png',
        tag: data.tag,
        data: data.data
      })
    );
  }
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

/**
 * Periodic background sync (if supported)
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(performPeriodicCleanup());
  }
});

/**
 * Perform periodic cleanup
 */
async function performPeriodicCleanup() {
  console.log('🧹 Performing periodic cache cleanup...');
  
  // Clean up all caches
  await cleanupCache(STATIC_CACHE, CACHE_CONFIG.maxEntries.static);
  await cleanupCache(DYNAMIC_CACHE, CACHE_CONFIG.maxEntries.dynamic);
  await cleanupCache(IMAGE_CACHE, CACHE_CONFIG.maxEntries.images);
  
  // Send metrics to main thread
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'CACHE_METRICS',
      metrics: performanceMetrics
    });
  });
}

console.log('🚀 Taiga Theme Service Worker loaded successfully'); 