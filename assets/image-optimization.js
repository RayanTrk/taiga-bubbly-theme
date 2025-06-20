/**
 * Image Optimization System for Taiga Theme
 * Handles WebP conversion, responsive images, lazy loading, and performance monitoring
 * Following shopirule.mdc specifications for blazing-fast performance
 */

class ImageOptimization {
  constructor() {
    this.webpSupport = null;
    this.intersectionObserver = null;
    this.loadedImages = new Set();
    this.performanceMetrics = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      averageLoadTime: 0,
      webpUsage: 0
    };
    
    this.init();
  }
  
  init() {
    this.detectWebPSupport();
    this.setupIntersectionObserver();
    this.setupResponsiveImages();
    this.setupPerformanceMonitoring();
    this.initializeExistingImages();
    this.setupErrorHandling();
  }
  
  /**
   * Detect WebP support in the browser
   */
  detectWebPSupport() {
    return new Promise((resolve) => {
      const webp = new Image();
      webp.onload = webp.onerror = () => {
        this.webpSupport = (webp.height === 2);
        document.documentElement.classList.toggle('webp-support', this.webpSupport);
        document.documentElement.classList.toggle('no-webp-support', !this.webpSupport);
        resolve(this.webpSupport);
      };
      webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
  
  /**
   * Setup Intersection Observer for lazy loading
   */
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const options = {
        root: null,
        rootMargin: '50px 0px',
        threshold: 0.01
      };
      
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.intersectionObserver.unobserve(entry.target);
          }
        });
      }, options);
    }
  }
  
  /**
   * Setup responsive images with srcset and sizes
   */
  setupResponsiveImages() {
    // Common breakpoints based on shopirule.mdc
    this.breakpoints = {
      mobile: 480,
      tablet: 750,
      desktop: 990,
      large: 1440
    };
    
    // Image size configurations
    this.imageSizes = {
      hero: {
        mobile: '100vw',
        tablet: '100vw',
        desktop: '100vw'
      },
      product: {
        mobile: '50vw',
        tablet: '33vw',
        desktop: '25vw'
      },
      card: {
        mobile: '100vw',
        tablet: '50vw',
        desktop: '33vw'
      },
      thumbnail: {
        mobile: '20vw',
        tablet: '15vw',
        desktop: '10vw'
      }
    };
  }
  
  /**
   * Initialize existing images on page load
   */
  initializeExistingImages() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    images.forEach(img => this.processImage(img));
    
    // Process background images
    const bgImages = document.querySelectorAll('[data-bg-src]');
    bgImages.forEach(el => this.processBackgroundImage(el));
  }
  
  /**
   * Process individual image for optimization
   */
  processImage(img) {
    if (this.loadedImages.has(img)) return;
    
    this.performanceMetrics.totalImages++;
    
    // Add loading attribute for native lazy loading support
    if ('loading' in HTMLImageElement.prototype) {
      img.loading = 'lazy';
    }
    
    // Add responsive image classes
    img.classList.add('responsive-image');
    
    // Setup intersection observer if available
    if (this.intersectionObserver && img.dataset.src) {
      img.classList.add('lazy-image');
      this.intersectionObserver.observe(img);
    } else {
      // Fallback: load immediately
      this.loadImage(img);
    }
  }
  
  /**
   * Load image with WebP optimization
   */
  loadImage(img) {
    const startTime = performance.now();
    
    return new Promise((resolve, reject) => {
      const originalSrc = img.dataset.src || img.src;
      const originalSrcset = img.dataset.srcset || img.srcset;
      
      if (!originalSrc && !originalSrcset) {
        resolve();
        return;
      }
      
      // Create optimized URLs
      const optimizedSrc = this.getOptimizedImageUrl(originalSrc);
      const optimizedSrcset = this.getOptimizedSrcset(originalSrcset);
      
      // Create new image for preloading
      const newImg = new Image();
      
      newImg.onload = () => {
        const loadTime = performance.now() - startTime;
        this.updatePerformanceMetrics(loadTime, true);
        
        // Apply loaded image
        if (optimizedSrc) img.src = optimizedSrc;
        if (optimizedSrcset) img.srcset = optimizedSrcset;
        
        // Remove lazy loading classes and add loaded class
        img.classList.remove('lazy-image', 'loading');
        img.classList.add('loaded');
        
        // Remove data attributes
        delete img.dataset.src;
        delete img.dataset.srcset;
        
        this.loadedImages.add(img);
        
        // Trigger custom event
        img.dispatchEvent(new CustomEvent('imageLoaded', {
          detail: { loadTime, optimized: true }
        }));
        
        resolve();
      };
      
      newImg.onerror = () => {
        const loadTime = performance.now() - startTime;
        this.updatePerformanceMetrics(loadTime, false);
        
        // Fallback to original image
        if (originalSrc) img.src = originalSrc;
        if (originalSrcset) img.srcset = originalSrcset;
        
        img.classList.remove('lazy-image', 'loading');
        img.classList.add('error');
        
        this.loadedImages.add(img);
        
        img.dispatchEvent(new CustomEvent('imageError', {
          detail: { loadTime, error: true }
        }));
        
        reject(new Error('Image failed to load'));
      };
      
      // Start loading
      img.classList.add('loading');
      if (optimizedSrcset) {
        newImg.srcset = optimizedSrcset;
      }
      if (optimizedSrc) {
        newImg.src = optimizedSrc;
      }
    });
  }
  
  /**
   * Process background images
   */
  processBackgroundImage(element) {
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(element);
    } else {
      this.loadBackgroundImage(element);
    }
  }
  
  /**
   * Load background image with optimization
   */
  loadBackgroundImage(element) {
    const bgSrc = element.dataset.bgSrc;
    if (!bgSrc) return;
    
    const optimizedSrc = this.getOptimizedImageUrl(bgSrc);
    
    const img = new Image();
    img.onload = () => {
      element.style.backgroundImage = `url(${optimizedSrc})`;
      element.classList.remove('loading');
      element.classList.add('loaded');
      delete element.dataset.bgSrc;
    };
    
    img.onerror = () => {
      element.style.backgroundImage = `url(${bgSrc})`;
      element.classList.remove('loading');
      element.classList.add('error');
      delete element.dataset.bgSrc;
    };
    
    element.classList.add('loading');
    img.src = optimizedSrc;
  }
  
  /**
   * Get optimized image URL with WebP support
   */
  getOptimizedImageUrl(originalUrl) {
    if (!originalUrl) return originalUrl;
    
    // Check if it's a Shopify CDN URL
    if (originalUrl.includes('cdn.shopify.com') || originalUrl.includes('shopify.com')) {
      return this.getShopifyOptimizedUrl(originalUrl);
    }
    
    return originalUrl;
  }
  
  /**
   * Get Shopify optimized URL with WebP and size parameters
   */
  getShopifyOptimizedUrl(url) {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      // Add WebP format if supported
      if (this.webpSupport) {
        params.set('format', 'webp');
        this.performanceMetrics.webpUsage++;
      }
      
      // Add quality optimization
      if (!params.has('quality')) {
        params.set('quality', '85');
      }
      
      // Add progressive loading
      params.set('progressive', 'true');
      
      urlObj.search = params.toString();
      return urlObj.toString();
    } catch (e) {
      console.warn('Failed to optimize URL:', url, e);
      return url;
    }
  }
  
  /**
   * Get optimized srcset with WebP support
   */
  getOptimizedSrcset(srcset) {
    if (!srcset) return srcset;
    
    return srcset.split(',').map(src => {
      const [url, descriptor] = src.trim().split(' ');
      const optimizedUrl = this.getOptimizedImageUrl(url);
      return descriptor ? `${optimizedUrl} ${descriptor}` : optimizedUrl;
    }).join(', ');
  }
  
  /**
   * Generate responsive srcset for Shopify images
   */
  generateResponsiveSrcset(baseUrl, sizes = [480, 750, 990, 1440, 1920]) {
    if (!baseUrl.includes('cdn.shopify.com')) return '';
    
    return sizes.map(size => {
      const optimizedUrl = this.getShopifyOptimizedUrl(`${baseUrl}?width=${size}`);
      return `${optimizedUrl} ${size}w`;
    }).join(', ');
  }
  
  /**
   * Generate sizes attribute based on image type
   */
  generateSizesAttribute(imageType = 'default') {
    const sizes = this.imageSizes[imageType] || this.imageSizes.card;
    
    return [
      `(max-width: ${this.breakpoints.mobile}px) ${sizes.mobile}`,
      `(max-width: ${this.breakpoints.tablet}px) ${sizes.tablet}`,
      sizes.desktop
    ].join(', ');
  }
  
  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          // Track LCP if it's an image
          if (lastEntry.element && lastEntry.element.tagName === 'IMG') {
            this.trackLCPImage(lastEntry);
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP monitoring not supported:', e);
      }
    }
    
    // Monitor image loading performance
    this.setupImagePerformanceTracking();
  }
  
  /**
   * Track LCP image performance
   */
  trackLCPImage(entry) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'lcp_image', {
        event_category: 'Performance',
        event_label: entry.element.src,
        value: Math.round(entry.startTime)
      });
    }
    
    // AI Navigation integration
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('lcp_image', {
        url: entry.element.src,
        loadTime: entry.startTime,
        size: entry.size
      });
    }
  }
  
  /**
   * Setup image performance tracking
   */
  setupImagePerformanceTracking() {
    // Track Resource Timing for images
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach(entry => {
            if (entry.initiatorType === 'img') {
              this.trackImageResourceTiming(entry);
            }
          });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('Resource timing monitoring not supported:', e);
      }
    }
  }
  
  /**
   * Track image resource timing
   */
  trackImageResourceTiming(entry) {
    const metrics = {
      url: entry.name,
      duration: entry.duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize
    };
    
    // Calculate compression ratio
    if (entry.encodedBodySize && entry.decodedBodySize) {
      metrics.compressionRatio = (1 - entry.encodedBodySize / entry.decodedBodySize) * 100;
    }
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('image_performance', metrics);
    }
  }
  
  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(loadTime, success) {
    if (success) {
      this.performanceMetrics.loadedImages++;
      
      // Update average load time
      const totalTime = this.performanceMetrics.averageLoadTime * (this.performanceMetrics.loadedImages - 1);
      this.performanceMetrics.averageLoadTime = (totalTime + loadTime) / this.performanceMetrics.loadedImages;
    } else {
      this.performanceMetrics.failedImages++;
    }
  }
  
  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // Global image error handler
    document.addEventListener('error', (e) => {
      if (e.target.tagName === 'IMG') {
        this.handleImageError(e.target);
      }
    }, true);
  }
  
  /**
   * Handle image loading errors
   */
  handleImageError(img) {
    // Add error class
    img.classList.add('image-error');
    
    // Try fallback image if available
    const fallback = img.dataset.fallback;
    if (fallback && img.src !== fallback) {
      img.src = fallback;
      return;
    }
    
    // Add placeholder if no fallback
    if (!img.alt) {
      img.alt = 'Image failed to load';
    }
    
    // Track error
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('image_error', {
        url: img.src,
        alt: img.alt
      });
    }
  }
  
  /**
   * Preload critical images
   */
  preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('img[data-critical="true"]');
    criticalImages.forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.getOptimizedImageUrl(img.dataset.src || img.src);
      
      if (img.dataset.srcset) {
        link.imageSrcset = this.getOptimizedSrcset(img.dataset.srcset);
      }
      
      document.head.appendChild(link);
    });
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    const report = {
      ...this.performanceMetrics,
      webpSupportEnabled: this.webpSupport,
      successRate: this.performanceMetrics.totalImages > 0 
        ? (this.performanceMetrics.loadedImages / this.performanceMetrics.totalImages * 100).toFixed(2)
        : 0,
      webpUsageRate: this.performanceMetrics.totalImages > 0
        ? (this.performanceMetrics.webpUsage / this.performanceMetrics.totalImages * 100).toFixed(2)
        : 0
    };
    
    return report;
  }
  
  /**
   * Public API methods
   */
  
  // Add new image to optimization system
  addImage(img) {
    this.processImage(img);
  }
  
  // Add new background image
  addBackgroundImage(element) {
    this.processBackgroundImage(element);
  }
  
  // Force load all lazy images (useful for print)
  loadAllImages() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    lazyImages.forEach(img => {
      if (this.intersectionObserver) {
        this.intersectionObserver.unobserve(img);
      }
      this.loadImage(img);
    });
  }
  
  // Cleanup
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.loadedImages.clear();
  }
}

// Initialize image optimization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.imageOptimization = new ImageOptimization();
  });
} else {
  window.imageOptimization = new ImageOptimization();
}

// Export for external use
window.ImageOptimization = ImageOptimization; 