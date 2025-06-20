/**
 * Intelligent Cache System for Taiga Theme
 * Handles service worker caching, browser cache optimization, and adaptive strategies
 * Following shopirule.mdc specifications for blazing-fast performance
 */

class IntelligentCache {
  constructor() {
    this.cacheVersion = 'taiga-v1.0.0';
    this.staticCacheName = `${this.cacheVersion}-static`;
    this.dynamicCacheName = `${this.cacheVersion}-dynamic`;
    this.imageCacheName = `${this.cacheVersion}-images`;
    
    this.cacheStrategies = {
      static: 'cache-first',
      dynamic: 'network-first',
      images: 'cache-first',
      api: 'network-first'
    };
    
    this.performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      cachedResources: 0,
      cacheSize: 0,
      timeSaved: 0
    };
    
    this.init();
  }
  
  init() {
    this.registerServiceWorker();
    this.setupBrowserCacheOptimization();
    this.setupAdaptiveCaching();
    this.setupCacheManagement();
    this.setupPerformanceMonitoring();
  }
  
  /**
   * Register service worker for advanced caching
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      // Check if we're in a Shopify environment
      if (this.isShopifyEnvironment()) {
        console.log('🏪 Shopify environment detected - using browser cache optimization only');
        return;
      }
      
      navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      }).then(registration => {
        console.log('✅ Service Worker registered successfully');
        this.serviceWorkerRegistration = registration;
        this.setupServiceWorkerCommunication(registration);
      }).catch(error => {
        console.warn('❌ Service Worker registration failed:', error);
        // Fallback to browser cache optimization only
        this.setupFallbackCaching();
      });
    } else {
      console.log('📱 Service Worker not supported - using fallback caching');
      this.setupFallbackCaching();
    }
  }
  
  /**
   * Check if running in Shopify environment
   */
  isShopifyEnvironment() {
    return window.Shopify || 
           window.location.hostname.includes('myshopify.com') ||
           window.location.hostname.includes('shopify.com');
  }
  
  /**
   * Setup service worker communication
   */
  setupServiceWorkerCommunication(registration) {
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event.data);
    });
    
    // Send cache configuration to service worker
    this.sendToServiceWorker({
      type: 'CACHE_CONFIG',
      config: {
        version: this.cacheVersion,
        strategies: this.cacheStrategies,
        staticResources: this.getStaticResources(),
        dynamicPatterns: this.getDynamicPatterns()
      }
    });
  }
  
  /**
   * Handle service worker messages
   */
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'CACHE_HIT':
        this.performanceMetrics.cacheHits++;
        this.performanceMetrics.timeSaved += data.timeSaved || 100;
        break;
        
      case 'CACHE_MISS':
        this.performanceMetrics.cacheMisses++;
        this.performanceMetrics.networkRequests++;
        break;
        
      case 'RESOURCE_CACHED':
        this.performanceMetrics.cachedResources++;
        this.performanceMetrics.cacheSize += data.size || 0;
        break;
        
      case 'CACHE_UPDATED':
        console.log('🔄 Cache updated:', data.url);
        break;
    }
  }
  
  /**
   * Send message to service worker
   */
  sendToServiceWorker(message) {
    if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
      this.serviceWorkerRegistration.active.postMessage(message);
    }
  }
  
  /**
   * Get static resources for caching
   */
  getStaticResources() {
    return [
      // CSS files
      '/assets/theme.css',
      '/assets/base.css',
      '/assets/component-header.css',
      '/assets/section-hero.css',
      '/assets/section-bubbly.css',
      
      // JavaScript files
      '/assets/theme.js',
      '/assets/ai-navigation.js',
      '/assets/bubble-animations.js',
      '/assets/image-optimization.js',
      '/assets/performance-monitor.js',
      '/assets/intelligent-cache.js',
      
      // Fonts
      ...this.getCriticalFonts(),
      
      // Images
      '/assets/logo.svg',
      '/assets/icons.svg'
    ];
  }
  
  /**
   * Get dynamic patterns for caching
   */
  getDynamicPatterns() {
    return [
      // Product pages
      { pattern: '/products/', strategy: 'network-first', ttl: 300000 }, // 5 minutes
      
      // Collection pages
      { pattern: '/collections/', strategy: 'network-first', ttl: 600000 }, // 10 minutes
      
      // API endpoints
      { pattern: '/cart.js', strategy: 'network-only' },
      { pattern: '/cart/add.js', strategy: 'network-only' },
      { pattern: '/search/suggest.json', strategy: 'network-first', ttl: 3600000 }, // 1 hour
      
      // Images
      { pattern: '/cdn.shopify.com/', strategy: 'cache-first', ttl: 86400000 }, // 24 hours
      { pattern: '/assets/', strategy: 'cache-first', ttl: 86400000 }
    ];
  }
  
  /**
   * Get critical fonts
   */
  getCriticalFonts() {
    const fonts = [];
    
    // Check for theme font settings
    if (window.Shopify?.theme?.settings) {
      const settings = window.Shopify.theme.settings;
      
      const fontKeys = ['type_header_font', 'type_base_font'];
      fontKeys.forEach(key => {
        if (settings[key] && settings[key].includes('http')) {
          fonts.push(settings[key]);
        }
      });
    }
    
    return fonts;
  }
  
  /**
   * Setup browser cache optimization
   */
  setupBrowserCacheOptimization() {
    // Optimize fetch requests with cache headers
    this.interceptFetchRequests();
    
    // Setup localStorage caching for API responses
    this.setupLocalStorageCache();
    
    // Setup sessionStorage for temporary data
    this.setupSessionStorageCache();
    
    // Setup IndexedDB for large data
    this.setupIndexedDBCache();
  }
  
  /**
   * Intercept fetch requests for cache optimization
   */
  interceptFetchRequests() {
    // Store original fetch
    const originalFetch = window.fetch;
    
    window.fetch = async (resource, options = {}) => {
      const url = typeof resource === 'string' ? resource : resource.url;
      const method = options.method || 'GET';
      
      // Only cache GET requests
      if (method !== 'GET') {
        return originalFetch(resource, options);
      }
      
      // Check cache first for static resources
      if (this.isStaticResource(url)) {
        const cachedResponse = await this.getCachedResponse(url);
        if (cachedResponse) {
          this.performanceMetrics.cacheHits++;
          return cachedResponse;
        }
      }
      
      // Make network request
      try {
        const response = await originalFetch(resource, options);
        
        // Cache successful responses
        if (response.ok && this.shouldCache(url, response)) {
          this.cacheResponse(url, response.clone());
        }
        
        this.performanceMetrics.networkRequests++;
        return response;
      } catch (error) {
        // Try to serve from cache on network error
        const cachedResponse = await this.getCachedResponse(url);
        if (cachedResponse) {
          console.log('🔄 Serving from cache due to network error:', url);
          return cachedResponse;
        }
        throw error;
      }
    };
  }
  
  /**
   * Check if resource is static
   */
  isStaticResource(url) {
    const staticExtensions = ['.css', '.js', '.woff', '.woff2', '.svg', '.png', '.jpg', '.jpeg', '.webp'];
    return staticExtensions.some(ext => url.includes(ext)) || url.includes('/assets/');
  }
  
  /**
   * Check if response should be cached
   */
  shouldCache(url, response) {
    // Don't cache non-successful responses
    if (!response.ok) return false;
    
    // Don't cache dynamic API endpoints
    if (url.includes('/cart.js') || url.includes('/cart/add.js')) return false;
    
    // Cache static resources
    if (this.isStaticResource(url)) return true;
    
    // Cache product and collection pages
    if (url.includes('/products/') || url.includes('/collections/')) return true;
    
    return false;
  }
  
  /**
   * Setup localStorage caching
   */
  setupLocalStorageCache() {
    this.localStorageCache = {
      set: (key, data, ttl = 3600000) => { // 1 hour default TTL
        try {
          const item = {
            data: data,
            timestamp: Date.now(),
            ttl: ttl
          };
          localStorage.setItem(`taiga_cache_${key}`, JSON.stringify(item));
        } catch (e) {
          console.warn('LocalStorage cache set failed:', e);
        }
      },
      
      get: (key) => {
        try {
          const item = localStorage.getItem(`taiga_cache_${key}`);
          if (!item) return null;
          
          const parsed = JSON.parse(item);
          if (Date.now() - parsed.timestamp > parsed.ttl) {
            localStorage.removeItem(`taiga_cache_${key}`);
            return null;
          }
          
          return parsed.data;
        } catch (e) {
          console.warn('LocalStorage cache get failed:', e);
          return null;
        }
      },
      
      clear: () => {
        try {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('taiga_cache_')) {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.warn('LocalStorage cache clear failed:', e);
        }
      }
    };
  }
  
  /**
   * Setup sessionStorage caching
   */
  setupSessionStorageCache() {
    this.sessionStorageCache = {
      set: (key, data) => {
        try {
          sessionStorage.setItem(`taiga_session_${key}`, JSON.stringify(data));
        } catch (e) {
          console.warn('SessionStorage cache set failed:', e);
        }
      },
      
      get: (key) => {
        try {
          const item = sessionStorage.getItem(`taiga_session_${key}`);
          return item ? JSON.parse(item) : null;
        } catch (e) {
          console.warn('SessionStorage cache get failed:', e);
          return null;
        }
      },
      
      clear: () => {
        try {
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('taiga_session_')) {
              sessionStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.warn('SessionStorage cache clear failed:', e);
        }
      }
    };
  }
  
  /**
   * Setup IndexedDB caching for large data
   */
  setupIndexedDBCache() {
    if (!('indexedDB' in window)) {
      console.log('IndexedDB not supported');
      return;
    }
    
    const request = indexedDB.open('TaigaCache', 1);
    
    request.onerror = () => {
      console.warn('IndexedDB failed to open');
    };
    
    request.onsuccess = (event) => {
      this.indexedDB = event.target.result;
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('responses')) {
        const responseStore = db.createObjectStore('responses', { keyPath: 'url' });
        responseStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('images')) {
        const imageStore = db.createObjectStore('images', { keyPath: 'url' });
        imageStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  }
  
  /**
   * Get cached response
   */
  async getCachedResponse(url) {
    // Try memory cache first (if service worker is available)
    if (this.serviceWorkerRegistration) {
      return null; // Let service worker handle it
    }
    
    // Try IndexedDB for large responses
    if (this.indexedDB) {
      try {
        const transaction = this.indexedDB.transaction(['responses'], 'readonly');
        const store = transaction.objectStore('responses');
        const request = store.get(url);
        
        return new Promise((resolve) => {
          request.onsuccess = () => {
            const result = request.result;
            if (result && Date.now() - result.timestamp < result.ttl) {
              resolve(new Response(result.body, {
                status: result.status,
                statusText: result.statusText,
                headers: result.headers
              }));
            } else {
              resolve(null);
            }
          };
          
          request.onerror = () => resolve(null);
        });
      } catch (e) {
        console.warn('IndexedDB cache get failed:', e);
      }
    }
    
    return null;
  }
  
  /**
   * Cache response
   */
  async cacheResponse(url, response) {
    if (!this.indexedDB) return;
    
    try {
      const body = await response.text();
      const cacheItem = {
        url: url,
        body: body,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: Date.now(),
        ttl: this.getTTLForUrl(url)
      };
      
      const transaction = this.indexedDB.transaction(['responses'], 'readwrite');
      const store = transaction.objectStore('responses');
      store.put(cacheItem);
      
      this.performanceMetrics.cachedResources++;
    } catch (e) {
      console.warn('IndexedDB cache set failed:', e);
    }
  }
  
  /**
   * Get TTL for URL
   */
  getTTLForUrl(url) {
    if (this.isStaticResource(url)) {
      return 86400000; // 24 hours
    }
    
    if (url.includes('/products/') || url.includes('/collections/')) {
      return 3600000; // 1 hour
    }
    
    return 1800000; // 30 minutes default
  }
  
  /**
   * Setup adaptive caching based on user behavior
   */
  setupAdaptiveCaching() {
    // Track user navigation patterns
    this.trackNavigationPatterns();
    
    // Adapt cache strategies based on connection
    this.adaptToConnection();
    
    // Predict and cache likely next resources
    this.setupPredictiveCache();
  }
  
  /**
   * Track navigation patterns
   */
  trackNavigationPatterns() {
    let navigationHistory = this.sessionStorageCache.get('navigation_history') || [];
    
    // Record current page
    navigationHistory.push({
      url: window.location.href,
      timestamp: Date.now()
    });
    
    // Keep only last 10 pages
    if (navigationHistory.length > 10) {
      navigationHistory = navigationHistory.slice(-10);
    }
    
    this.sessionStorageCache.set('navigation_history', navigationHistory);
    
    // Analyze patterns and prefetch likely next pages
    this.analyzePatternsAndPrefetch(navigationHistory);
  }
  
  /**
   * Analyze patterns and prefetch
   */
  analyzePatternsAndPrefetch(history) {
    if (history.length < 3) return;
    
    // Simple pattern detection: if user visited A -> B -> C, prefetch D
    const recent = history.slice(-3);
    const pattern = recent.map(h => this.extractPageType(h.url));
    
    // Common e-commerce patterns
    if (pattern.join('->') === 'home->collection->product') {
      this.prefetchCartResources();
    }
    
    if (pattern.join('->') === 'collection->product->product') {
      this.prefetchRelatedProducts();
    }
  }
  
  /**
   * Extract page type from URL
   */
  extractPageType(url) {
    if (url.includes('/products/')) return 'product';
    if (url.includes('/collections/')) return 'collection';
    if (url.includes('/cart')) return 'cart';
    if (url.includes('/search')) return 'search';
    if (url === '/' || url.includes('/#')) return 'home';
    return 'other';
  }
  
  /**
   * Adapt to connection quality
   */
  adaptToConnection() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      // Adjust cache strategies based on connection
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.cacheStrategies.dynamic = 'cache-first';
        this.cacheStrategies.images = 'cache-first';
        console.log('🐌 Slow connection detected - using cache-first strategies');
      } else if (connection.effectiveType === '4g') {
        this.cacheStrategies.dynamic = 'network-first';
        console.log('🚀 Fast connection detected - using network-first strategies');
      }
      
      // Listen for connection changes
      connection.addEventListener('change', () => {
        this.adaptToConnection();
      });
    }
  }
  
  /**
   * Setup predictive caching
   */
  setupPredictiveCache() {
    // Cache resources based on user behavior
    this.setupBehaviorBasedCaching();
    
    // Cache based on time of day
    this.setupTimeBasedCaching();
    
    // Cache based on user preferences
    this.setupPreferenceBasedCaching();
  }
  
  /**
   * Setup behavior-based caching
   */
  setupBehaviorBasedCaching() {
    // Track which resources user accesses most
    let accessCounts = this.localStorageCache.get('resource_access_counts') || {};
    
    // Increment access count for current page
    const currentUrl = window.location.href;
    accessCounts[currentUrl] = (accessCounts[currentUrl] || 0) + 1;
    
    this.localStorageCache.set('resource_access_counts', accessCounts);
    
    // Cache most accessed resources with higher priority
    const sortedUrls = Object.entries(accessCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([url]) => url);
    
    sortedUrls.forEach(url => {
      this.prefetchResource(url);
    });
  }
  
  /**
   * Setup time-based caching
   */
  setupTimeBasedCaching() {
    const hour = new Date().getHours();
    
    // Business hours (9-17): cache work-related content
    if (hour >= 9 && hour <= 17) {
      this.prefetchBusinessContent();
    }
    
    // Evening (18-22): cache leisure content
    if (hour >= 18 && hour <= 22) {
      this.prefetchLeisureContent();
    }
  }
  
  /**
   * Setup preference-based caching
   */
  setupPreferenceBasedCaching() {
    // Cache based on user's previously viewed categories
    const viewedCategories = this.localStorageCache.get('viewed_categories') || [];
    
    viewedCategories.forEach(category => {
      this.prefetchCategoryContent(category);
    });
  }
  
  /**
   * Setup cache management
   */
  setupCacheManagement() {
    // Clean up old cache entries
    this.scheduleCleanup();
    
    // Monitor cache size
    this.monitorCacheSize();
    
    // Handle cache quota exceeded
    this.handleQuotaExceeded();
  }
  
  /**
   * Schedule cache cleanup
   */
  scheduleCleanup() {
    // Clean up every hour
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 3600000);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanupExpiredEntries();
    });
  }
  
  /**
   * Clean up expired cache entries
   */
  cleanupExpiredEntries() {
    // Clean localStorage
    this.localStorageCache.clear();
    
    // Clean IndexedDB
    if (this.indexedDB) {
      try {
        const transaction = this.indexedDB.transaction(['responses'], 'readwrite');
        const store = transaction.objectStore('responses');
        const index = store.index('timestamp');
        
        const cutoff = Date.now() - 86400000; // 24 hours ago
        const range = IDBKeyRange.upperBound(cutoff);
        
        index.openCursor(range).onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      } catch (e) {
        console.warn('Cache cleanup failed:', e);
      }
    }
  }
  
  /**
   * Monitor cache size
   */
  monitorCacheSize() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
        const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
        
        console.log(`💾 Cache usage: ${usedMB}MB / ${quotaMB}MB`);
        
        // Warn if approaching quota
        if (estimate.usage / estimate.quota > 0.8) {
          console.warn('⚠️ Cache approaching quota limit');
          this.cleanupExpiredEntries();
        }
      });
    }
  }
  
  /**
   * Handle quota exceeded errors
   */
  handleQuotaExceeded() {
    window.addEventListener('error', (event) => {
      if (event.error?.name === 'QuotaExceededError') {
        console.warn('💾 Cache quota exceeded - cleaning up');
        this.cleanupExpiredEntries();
      }
    });
  }
  
  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor cache hit ratio
    setInterval(() => {
      this.reportCacheMetrics();
    }, 30000); // Every 30 seconds
    
    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.reportCacheMetrics();
    });
  }
  
  /**
   * Report cache metrics
   */
  reportCacheMetrics() {
    const hitRatio = this.performanceMetrics.cacheHits / 
      (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100;
    
    const report = {
      ...this.performanceMetrics,
      hitRatio: isNaN(hitRatio) ? 0 : hitRatio.toFixed(2)
    };
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('cache_metrics', report);
    }
    
    // Log in development
    if (this.isDevelopment()) {
      console.log('💾 Cache Metrics:', report);
    }
  }
  
  /**
   * Utility methods
   */
  
  prefetchResource(url) {
    // Implementation depends on available caching mechanism
    if (window.resourceHints) {
      window.resourceHints.addPrefetch(url);
    }
  }
  
  prefetchCartResources() {
    this.prefetchResource('/cart');
    this.prefetchResource('/cart.js');
  }
  
  prefetchRelatedProducts() {
    const relatedLinks = document.querySelectorAll('.related-products a');
    relatedLinks.forEach(link => this.prefetchResource(link.href));
  }
  
  prefetchBusinessContent() {
    // Prefetch commonly accessed business pages
    this.prefetchResource('/collections/office');
    this.prefetchResource('/collections/professional');
  }
  
  prefetchLeisureContent() {
    // Prefetch leisure-related content
    this.prefetchResource('/collections/casual');
    this.prefetchResource('/collections/entertainment');
  }
  
  prefetchCategoryContent(category) {
    this.prefetchResource(`/collections/${category}`);
  }
  
  isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname.includes('myshopify.com') ||
           window.Shopify?.designMode;
  }
  
  /**
   * Public API methods
   */
  
  // Get cache statistics
  getCacheStats() {
    return { ...this.performanceMetrics };
  }
  
  // Clear all caches
  clearAllCaches() {
    this.localStorageCache.clear();
    this.sessionStorageCache.clear();
    
    if (this.indexedDB) {
      const transaction = this.indexedDB.transaction(['responses', 'images'], 'readwrite');
      transaction.objectStore('responses').clear();
      transaction.objectStore('images').clear();
    }
    
    if (this.serviceWorkerRegistration) {
      this.sendToServiceWorker({ type: 'CLEAR_CACHE' });
    }
  }
  
  // Force cache update
  updateCache() {
    if (this.serviceWorkerRegistration) {
      this.sendToServiceWorker({ type: 'UPDATE_CACHE' });
    }
  }
  
  // Cleanup
  destroy() {
    if (this.indexedDB) {
      this.indexedDB.close();
    }
  }
}

// Initialize intelligent cache when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.intelligentCache = new IntelligentCache();
  });
} else {
  window.intelligentCache = new IntelligentCache();
}

// Export for external use
window.IntelligentCache = IntelligentCache; 