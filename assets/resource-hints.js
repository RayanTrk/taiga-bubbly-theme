/**
 * Resource Hints System for Taiga Theme
 * Handles preload, prefetch, preconnect, and dns-prefetch optimizations
 * Following shopirule.mdc specifications for blazing-fast performance
 */

class ResourceHints {
  constructor() {
    this.preloadedResources = new Set();
    this.prefetchedResources = new Set();
    this.preconnectedDomains = new Set();
    this.dnsPrefetchedDomains = new Set();
    
    this.performanceMetrics = {
      preloadHints: 0,
      prefetchHints: 0,
      preconnectHints: 0,
      dnsPrefetchHints: 0,
      resourcesSaved: 0,
      timeSaved: 0
    };
    
    this.init();
  }
  
  init() {
    this.setupCriticalResourcePreloads();
    this.setupResourcePrefetching();
    this.setupConnectionOptimizations();
    this.setupIntelligentPrefetching();
    this.setupPerformanceMonitoring();
  }
  
  /**
   * Setup critical resource preloads
   */
  setupCriticalResourcePreloads() {
    // Critical CSS files
    this.preloadCriticalCSS();
    
    // Critical JavaScript files
    this.preloadCriticalJS();
    
    // Critical fonts
    this.preloadCriticalFonts();
    
    // Critical images
    this.preloadCriticalImages();
    
    // Hero section resources
    this.preloadHeroResources();
  }
  
  /**
   * Preload critical CSS files
   */
  preloadCriticalCSS() {
    const criticalCSSFiles = [
      'theme.css',
      'base.css',
      'component-header.css',
      'section-hero.css',
      'section-bubbly.css' // Bubbly design specific
    ];
    
    criticalCSSFiles.forEach(cssFile => {
      this.preloadResource(cssFile, 'style', {
        critical: true,
        as: 'style'
      });
    });
  }
  
  /**
   * Preload critical JavaScript files
   */
  preloadCriticalJS() {
    const criticalJSFiles = [
      'theme.js',
      'ai-navigation.js', // AI Navigation feature
      'bubble-animations.js', // Bubbly design animations
      'image-optimization.js',
      'performance-monitor.js'
    ];
    
    criticalJSFiles.forEach(jsFile => {
      this.preloadResource(jsFile, 'script', {
        critical: true,
        as: 'script'
      });
    });
  }
  
  /**
   * Preload critical fonts
   */
  preloadCriticalFonts() {
    // Get font URLs from CSS or theme settings
    const criticalFonts = this.getCriticalFonts();
    
    criticalFonts.forEach(fontUrl => {
      this.preloadResource(fontUrl, 'font', {
        critical: true,
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous'
      });
    });
  }
  
  /**
   * Get critical fonts from theme
   */
  getCriticalFonts() {
    const fonts = [];
    
    // Check for theme font settings
    if (window.Shopify?.theme?.settings) {
      const settings = window.Shopify.theme.settings;
      
      // Common font setting keys
      const fontKeys = [
        'type_header_font',
        'type_base_font',
        'font_heading',
        'font_body'
      ];
      
      fontKeys.forEach(key => {
        if (settings[key] && settings[key].includes('http')) {
          fonts.push(settings[key]);
        }
      });
    }
    
    // Fallback to common Google Fonts used in Shopify themes
    if (fonts.length === 0) {
      fonts.push(
        'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
        'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2'
      );
    }
    
    return fonts;
  }
  
  /**
   * Preload critical images
   */
  preloadCriticalImages() {
    // Hero images
    const heroImages = document.querySelectorAll('.hero img[data-critical], .hero [data-bg-src]');
    heroImages.forEach(img => {
      const src = img.src || img.dataset.bgSrc || img.dataset.src;
      if (src) {
        this.preloadResource(src, 'image', {
          critical: true,
          as: 'image'
        });
      }
    });
    
    // Logo
    const logo = document.querySelector('.site-logo img, .header-logo img');
    if (logo && logo.src) {
      this.preloadResource(logo.src, 'image', {
        critical: true,
        as: 'image'
      });
    }
    
    // First product images (if on collection page)
    const firstProductImages = document.querySelectorAll('.product-card:nth-child(-n+3) img');
    firstProductImages.forEach(img => {
      if (img.src) {
        this.preloadResource(img.src, 'image', {
          as: 'image'
        });
      }
    });
  }
  
  /**
   * Preload hero section resources
   */
  preloadHeroResources() {
    const heroSection = document.querySelector('.hero, .hero-banner, .banner');
    if (!heroSection) return;
    
    // Hero background images
    const bgImage = window.getComputedStyle(heroSection).backgroundImage;
    if (bgImage && bgImage !== 'none') {
      const imageUrl = bgImage.match(/url\\([\"']?([^\"']+)[\"']?\\)/);
      if (imageUrl && imageUrl[1]) {
        this.preloadResource(imageUrl[1], 'image', {
          critical: true,
          as: 'image'
        });
      }
    }
    
    // Hero videos
    const heroVideo = heroSection.querySelector('video source, video');
    if (heroVideo) {
      const videoSrc = heroVideo.src || heroVideo.querySelector('source')?.src;
      if (videoSrc) {
        this.preloadResource(videoSrc, 'video', {
          critical: true,
          as: 'video'
        });
      }
    }
  }
  
  /**
   * Setup resource prefetching for next likely resources
   */
  setupResourcePrefetching() {
    // Prefetch next page resources based on user behavior
    this.setupNavigationPrefetching();
    
    // Prefetch product page resources on collection pages
    this.setupProductPrefetching();
    
    // Prefetch cart resources when user shows buying intent
    this.setupCartPrefetching();
    
    // Prefetch search resources
    this.setupSearchPrefetching();
  }
  
  /**
   * Setup navigation prefetching
   */
  setupNavigationPrefetching() {
    // Prefetch on hover for navigation links
    const navLinks = document.querySelectorAll('nav a, .navigation a, .menu a');
    
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        this.prefetchPage(link.href);
      }, { passive: true });
      
      // Also prefetch on focus for keyboard navigation
      link.addEventListener('focus', () => {
        this.prefetchPage(link.href);
      }, { passive: true });
    });
    
    // Prefetch next/prev page links
    const paginationLinks = document.querySelectorAll('.pagination a[rel="next"], .pagination a[rel="prev"]');
    paginationLinks.forEach(link => {
      // Prefetch after a delay
      setTimeout(() => {
        this.prefetchPage(link.href);
      }, 2000);
    });
  }
  
  /**
   * Setup product prefetching on collection pages
   */
  setupProductPrefetching() {
    if (!this.isCollectionPage()) return;
    
    const productLinks = document.querySelectorAll('.product-card a, .product-item a');
    
    // Use Intersection Observer to prefetch when products come into view
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target.querySelector('a') || entry.target;
            if (link.href) {
              this.prefetchPage(link.href);
            }
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '100px'
      });
      
      productLinks.forEach(link => {
        observer.observe(link.closest('.product-card, .product-item') || link);
      });
    }
    
    // Prefetch first few products immediately
    productLinks.forEach((link, index) => {
      if (index < 3) {
        setTimeout(() => {
          this.prefetchPage(link.href);
        }, 1000 + (index * 500));
      }
    });
  }
  
  /**
   * Setup cart prefetching based on buying intent
   */
  setupCartPrefetching() {
    const buyingIntentSelectors = [
      '.add-to-cart',
      '.btn-cart',
      '.product-form button',
      '.quick-add',
      '.cart-icon'
    ];
    
    buyingIntentSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.addEventListener('mouseenter', () => {
          this.prefetchCartResources();
        }, { passive: true, once: true });
      });
    });
  }
  
  /**
   * Setup search prefetching
   */
  setupSearchPrefetching() {
    const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
    
    searchInputs.forEach(input => {
      input.addEventListener('focus', () => {
        this.prefetchSearchResources();
      }, { passive: true, once: true });
    });
  }
  
  /**
   * Setup connection optimizations
   */
  setupConnectionOptimizations() {
    // Preconnect to critical domains
    this.preconnectCriticalDomains();
    
    // DNS prefetch for likely domains
    this.dnsPrefetchLikelyDomains();
    
    // Setup dynamic connection optimization
    this.setupDynamicConnectionOptimization();
  }
  
  /**
   * Preconnect to critical domains
   */
  preconnectCriticalDomains() {
    const criticalDomains = [
      'https://cdn.shopify.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com'
    ];
    
    // Add custom domains from theme settings
    if (window.Shopify?.routes?.root) {
      const shopDomain = new URL(window.Shopify.routes.root, window.location.origin).origin;
      criticalDomains.push(shopDomain);
    }
    
    criticalDomains.forEach(domain => {
      this.preconnect(domain);
    });
  }
  
  /**
   * DNS prefetch for likely domains
   */
  dnsPrefetchLikelyDomains() {
    const likelyDomains = [
      'https://api.shopify.com',
      'https://checkout.shopify.com',
      'https://js.shopifycloud.com',
      'https://www.facebook.com',
      'https://connect.facebook.net',
      'https://www.instagram.com',
      'https://platform.twitter.com',
      'https://www.youtube.com',
      'https://player.vimeo.com'
    ];
    
    likelyDomains.forEach(domain => {
      this.dnsPrefetch(domain);
    });
  }
  
  /**
   * Setup dynamic connection optimization
   */
  setupDynamicConnectionOptimization() {
    // Monitor external resource requests
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach(entry => {
            this.analyzeResourceForOptimization(entry);
          });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('Resource monitoring not supported:', e);
      }
    }
  }
  
  /**
   * Analyze resource for optimization opportunities
   */
  analyzeResourceForOptimization(entry) {
    const url = new URL(entry.name);
    const domain = url.origin;
    
    // If resource took long to connect, preconnect for future requests
    if (entry.connectEnd - entry.connectStart > 100) {
      if (!this.preconnectedDomains.has(domain)) {
        this.preconnect(domain);
      }
    }
    
    // If DNS lookup was slow, add to prefetch list
    if (entry.domainLookupEnd - entry.domainLookupStart > 50) {
      if (!this.dnsPrefetchedDomains.has(domain)) {
        this.dnsPrefetch(domain);
      }
    }
  }
  
  /**
   * Setup intelligent prefetching based on user behavior
   */
  setupIntelligentPrefetching() {
    // Track user behavior patterns
    this.setupBehaviorTracking();
    
    // Prefetch based on scroll patterns
    this.setupScrollBasedPrefetching();
    
    // Prefetch based on time on page
    this.setupTimeBasedPrefetching();
  }
  
  /**
   * Setup behavior tracking for intelligent prefetching
   */
  setupBehaviorTracking() {
    let hoveredLinks = [];
    let clickedCategories = [];
    
    // Track link hovers
    document.addEventListener('mouseover', (e) => {
      if (e.target.tagName === 'A' && e.target.href) {
        hoveredLinks.push(e.target.href);
        
        // If user hovers over similar links, prefetch them
        if (hoveredLinks.length > 2) {
          const similarLinks = this.findSimilarLinks(e.target.href);
          similarLinks.forEach(link => this.prefetchPage(link));
        }
      }
    }, { passive: true });
    
    // Track category clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.collection-link, .category-link')) {
        const category = this.extractCategory(e.target.href);
        if (category) {
          clickedCategories.push(category);
          this.prefetchRelatedCategories(category);
        }
      }
    }, { passive: true });
  }
  
  /**
   * Setup scroll-based prefetching
   */
  setupScrollBasedPrefetching() {
    let scrollTimeout;
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset;
        const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
        const scrollPercent = (scrollTop / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        // Prefetch next page when user scrolls to bottom
        if (scrollPercent > 80 && scrollDirection === 'down') {
          const nextPageLink = document.querySelector('a[rel="next"], .pagination .next');
          if (nextPageLink) {
            this.prefetchPage(nextPageLink.href);
          }
        }
        
        lastScrollTop = scrollTop;
      }, 100);
    }, { passive: true });
  }
  
  /**
   * Setup time-based prefetching
   */
  setupTimeBasedPrefetching() {
    // After 5 seconds, prefetch likely next pages
    setTimeout(() => {
      this.prefetchLikelyNextPages();
    }, 5000);
    
    // After 10 seconds, prefetch related products/collections
    setTimeout(() => {
      this.prefetchRelatedContent();
    }, 10000);
  }
  
  /**
   * Core resource hint methods
   */
  
  /**
   * Preload a resource
   */
  preloadResource(url, type, options = {}) {
    if (this.preloadedResources.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = this.resolveAssetUrl(url);
    
    if (options.as) link.as = options.as;
    if (options.type) link.type = options.type;
    if (options.crossorigin) link.crossOrigin = options.crossorigin;
    if (options.media) link.media = options.media;
    
    // Add importance hint if supported
    if ('importance' in link) {
      link.importance = options.critical ? 'high' : 'low';
    }
    
    document.head.appendChild(link);
    this.preloadedResources.add(url);
    this.performanceMetrics.preloadHints++;
    
    // Track loading
    link.onload = () => {
      this.trackResourceHintSuccess('preload', url);
    };
    
    link.onerror = () => {
      this.trackResourceHintError('preload', url);
    };
  }
  
  /**
   * Prefetch a page or resource
   */
  prefetchPage(url) {
    if (!url || this.prefetchedResources.has(url)) return;
    
    // Don't prefetch external domains
    if (!this.isSameDomain(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    document.head.appendChild(link);
    this.prefetchedResources.add(url);
    this.performanceMetrics.prefetchHints++;
    
    // Track success
    link.onload = () => {
      this.trackResourceHintSuccess('prefetch', url);
    };
  }
  
  /**
   * Preconnect to a domain
   */
  preconnect(domain) {
    if (this.preconnectedDomains.has(domain)) return;
    
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    
    // Add crossorigin for font domains
    if (domain.includes('fonts.gstatic.com') || domain.includes('googleapis.com')) {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
    this.preconnectedDomains.add(domain);
    this.performanceMetrics.preconnectHints++;
  }
  
  /**
   * DNS prefetch a domain
   */
  dnsPrefetch(domain) {
    if (this.dnsPrefetchedDomains.has(domain)) return;
    
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    
    document.head.appendChild(link);
    this.dnsPrefetchedDomains.add(domain);
    this.performanceMetrics.dnsPrefetchHints++;
  }
  
  /**
   * Utility methods
   */
  
  /**
   * Resolve asset URL for Shopify
   */
  resolveAssetUrl(url) {
    // If it's already a full URL, return as is
    if (url.startsWith('http') || url.startsWith('//')) {
      return url;
    }
    
    // If it's a Shopify asset, use asset_url equivalent
    if (url.endsWith('.css') || url.endsWith('.js') || url.endsWith('.woff2') || url.endsWith('.woff')) {
      const baseUrl = window.Shopify?.routes?.root || '/';
      return `${baseUrl}assets/${url}`;
    }
    
    return url;
  }
  
  /**
   * Check if URL is same domain
   */
  isSameDomain(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Check if current page is a collection page
   */
  isCollectionPage() {
    return window.location.pathname.includes('/collections/') ||
           document.body.classList.contains('template-collection') ||
           document.querySelector('.collection-page, .collection-products');
  }
  
  /**
   * Find similar links based on URL patterns
   */
  findSimilarLinks(url) {
    const links = [];
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find links with similar path structure
    const allLinks = document.querySelectorAll('a[href]');
    allLinks.forEach(link => {
      try {
        const linkObj = new URL(link.href);
        const linkPathParts = linkObj.pathname.split('/');
        
        // Check if paths have similar structure
        if (pathParts.length === linkPathParts.length) {
          const similarity = this.calculatePathSimilarity(pathParts, linkPathParts);
          if (similarity > 0.5) {
            links.push(link.href);
          }
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });
    
    return links;
  }
  
  /**
   * Calculate path similarity
   */
  calculatePathSimilarity(path1, path2) {
    let matches = 0;
    const minLength = Math.min(path1.length, path2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (path1[i] === path2[i]) {
        matches++;
      }
    }
    
    return matches / Math.max(path1.length, path2.length);
  }
  
  /**
   * Extract category from URL
   */
  extractCategory(url) {
    const match = url.match(/\\/collections\\/([^/]+)/);
    return match ? match[1] : null;
  }
  
  /**
   * Prefetch cart resources
   */
  prefetchCartResources() {
    const cartUrls = [
      '/cart',
      '/cart.js',
      '/cart/add.js'
    ];
    
    cartUrls.forEach(url => {
      this.prefetchPage(url);
    });
    
    // Prefetch cart CSS and JS
    this.preloadResource('section-cart.css', 'style');
    this.preloadResource('cart.js', 'script');
  }
  
  /**
   * Prefetch search resources
   */
  prefetchSearchResources() {
    const searchUrls = [
      '/search',
      '/search/suggest.json'
    ];
    
    searchUrls.forEach(url => {
      this.prefetchPage(url);
    });
    
    // Prefetch search CSS and JS
    this.preloadResource('component-search.css', 'style');
    this.preloadResource('search.js', 'script');
  }
  
  /**
   * Prefetch likely next pages
   */
  prefetchLikelyNextPages() {
    // Homepage -> Collections
    if (window.location.pathname === '/') {
      const collectionLinks = document.querySelectorAll('a[href*="/collections/"]:not([href*="/collections/all"])');
      collectionLinks.forEach((link, index) => {
        if (index < 3) {
          setTimeout(() => this.prefetchPage(link.href), index * 500);
        }
      });
    }
    
    // Collection -> Products
    if (this.isCollectionPage()) {
      const productLinks = document.querySelectorAll('.product-card a, .product-item a');
      productLinks.forEach((link, index) => {
        if (index < 5) {
          setTimeout(() => this.prefetchPage(link.href), index * 300);
        }
      });
    }
  }
  
  /**
   * Prefetch related content
   */
  prefetchRelatedContent() {
    // Prefetch related products
    const relatedLinks = document.querySelectorAll('.related-products a, .recommended-products a');
    relatedLinks.forEach(link => {
      this.prefetchPage(link.href);
    });
    
    // Prefetch blog if present
    const blogLinks = document.querySelectorAll('a[href*="/blogs/"]');
    if (blogLinks.length > 0) {
      this.prefetchPage(blogLinks[0].href);
    }
  }
  
  /**
   * Prefetch related categories
   */
  prefetchRelatedCategories(category) {
    // This would typically use AI or analytics to determine related categories
    // For now, use simple heuristics
    const relatedCategoryMap = {
      'clothing': ['accessories', 'shoes'],
      'accessories': ['clothing', 'jewelry'],
      'home': ['decor', 'furniture'],
      'electronics': ['accessories', 'gadgets']
    };
    
    const related = relatedCategoryMap[category] || [];
    related.forEach(relatedCategory => {
      this.prefetchPage(`/collections/${relatedCategory}`);
    });
  }
  
  /**
   * Performance tracking
   */
  
  /**
   * Track resource hint success
   */
  trackResourceHintSuccess(type, url) {
    this.performanceMetrics.resourcesSaved++;
    
    // Estimate time saved (rough approximation)
    const timeSaved = type === 'preload' ? 200 : 100; // ms
    this.performanceMetrics.timeSaved += timeSaved;
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('resource_hint_success', {
        type: type,
        url: url,
        timeSaved: timeSaved
      });
    }
  }
  
  /**
   * Track resource hint error
   */
  trackResourceHintError(type, url) {
    console.warn(`Resource hint failed: ${type} for ${url}`);
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('resource_hint_error', {
        type: type,
        url: url
      });
    }
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      ...this.performanceMetrics,
      preloadedResourcesCount: this.preloadedResources.size,
      prefetchedResourcesCount: this.prefetchedResources.size,
      preconnectedDomainsCount: this.preconnectedDomains.size,
      dnsPrefetchedDomainsCount: this.dnsPrefetchedDomains.size,
      estimatedTimeSaved: this.performanceMetrics.timeSaved
    };
  }
  
  /**
   * Public API methods
   */
  
  // Add custom preload
  addPreload(url, as, options = {}) {
    this.preloadResource(url, as, { ...options, as });
  }
  
  // Add custom prefetch
  addPrefetch(url) {
    this.prefetchPage(url);
  }
  
  // Add custom preconnect
  addPreconnect(domain) {
    this.preconnect(domain);
  }
  
  // Force prefetch all visible links
  prefetchAllVisibleLinks() {
    const visibleLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])');
    
    visibleLinks.forEach(link => {
      const rect = link.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= window.innerHeight) {
        this.prefetchPage(link.href);
      }
    });
  }
  
  // Cleanup
  destroy() {
    this.preloadedResources.clear();
    this.prefetchedResources.clear();
    this.preconnectedDomains.clear();
    this.dnsPrefetchedDomains.clear();
  }
}

// Initialize resource hints when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.resourceHints = new ResourceHints();
  });
} else {
  window.resourceHints = new ResourceHints();
}

// Export for external use
window.ResourceHints = ResourceHints; 