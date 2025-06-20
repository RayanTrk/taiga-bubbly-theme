/**
 * Lazy Loading System - Bubbly Style
 * Optimized image and video loading for better performance
 */

class LazyLoadManager {
  constructor() {
    this.observers = new Map();
    this.loadedImages = new Set();
    this.loadedVideos = new Set();
    this.config = {
      rootMargin: '50px',
      threshold: 0.1,
      enableNativeLoading: 'loading' in HTMLImageElement.prototype
    };
    
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupImageLoading();
    this.setupVideoLoading();
    this.setupBackgroundImages();
    this.setupIframes();
    this.bindEvents();
    
    console.log('Lazy loading system initialized');
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.loadAllContent();
      return;
    }

    // Image observer
    this.observers.set('images', new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observers.get('images').unobserve(entry.target);
        }
      });
    }, this.config));

    // Video observer
    this.observers.set('videos', new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadVideo(entry.target);
          this.observers.get('videos').unobserve(entry.target);
        }
      });
    }, this.config));

    // Background image observer
    this.observers.set('backgrounds', new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadBackgroundImage(entry.target);
          this.observers.get('backgrounds').unobserve(entry.target);
        }
      });
    }, this.config));

    // Iframe observer
    this.observers.set('iframes', new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadIframe(entry.target);
          this.observers.get('iframes').unobserve(entry.target);
        }
      });
    }, this.config));
  }

  setupImageLoading() {
    const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    
    images.forEach(img => {
      // Skip if already processed
      if (this.loadedImages.has(img)) return;
      
      // Use native lazy loading if available and enabled
      if (this.config.enableNativeLoading && img.hasAttribute('loading')) {
        img.addEventListener('load', () => this.handleImageLoad(img));
        img.addEventListener('error', () => this.handleImageError(img));
        return;
      }
      
      // Use intersection observer for custom lazy loading
      if (img.hasAttribute('data-src')) {
        this.observers.get('images').observe(img);
      }
    });
  }

  setupVideoLoading() {
    const videos = document.querySelectorAll('video[data-src], video[data-poster]');
    
    videos.forEach(video => {
      if (this.loadedVideos.has(video)) return;
      this.observers.get('videos').observe(video);
    });
  }

  setupBackgroundImages() {
    const elements = document.querySelectorAll('[data-bg-src]');
    
    elements.forEach(element => {
      this.observers.get('backgrounds').observe(element);
    });
  }

  setupIframes() {
    const iframes = document.querySelectorAll('iframe[data-src]');
    
    iframes.forEach(iframe => {
      this.observers.get('iframes').observe(iframe);
    });
  }

  loadImage(img) {
    if (this.loadedImages.has(img)) return;
    
    const src = img.getAttribute('data-src');
    const srcset = img.getAttribute('data-srcset');
    const sizes = img.getAttribute('data-sizes');
    
    if (!src && !srcset) return;
    
    // Create a new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Set the actual src attributes
      if (src) img.src = src;
      if (srcset) img.srcset = srcset;
      if (sizes) img.sizes = sizes;
      
      this.handleImageLoad(img);
    };
    
    imageLoader.onerror = () => {
      this.handleImageError(img);
    };
    
    // Start loading
    if (srcset) {
      imageLoader.srcset = srcset;
      if (sizes) imageLoader.sizes = sizes;
    }
    if (src) imageLoader.src = src;
    
    this.loadedImages.add(img);
  }

  loadVideo(video) {
    if (this.loadedVideos.has(video)) return;
    
    const src = video.getAttribute('data-src');
    const poster = video.getAttribute('data-poster');
    
    // Load poster first if available
    if (poster) {
      video.poster = poster;
    }
    
    // Load video source
    if (src) {
      video.src = src;
    } else {
      // Handle source elements
      const sources = video.querySelectorAll('source[data-src]');
      sources.forEach(source => {
        source.src = source.getAttribute('data-src');
        source.removeAttribute('data-src');
      });
    }
    
    video.load();
    this.handleVideoLoad(video);
    this.loadedVideos.add(video);
  }

  loadBackgroundImage(element) {
    const bgSrc = element.getAttribute('data-bg-src');
    if (!bgSrc) return;
    
    const img = new Image();
    img.onload = () => {
      element.style.backgroundImage = `url(${bgSrc})`;
      element.classList.add('bg-loaded');
      element.removeAttribute('data-bg-src');
    };
    img.src = bgSrc;
  }

  loadIframe(iframe) {
    const src = iframe.getAttribute('data-src');
    if (!src) return;
    
    iframe.src = src;
    iframe.removeAttribute('data-src');
    iframe.classList.add('iframe-loaded');
  }

  handleImageLoad(img) {
    img.classList.add('loaded');
    img.classList.remove('loading');
    
    // Remove data attributes
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
    img.removeAttribute('data-sizes');
    
    // Trigger custom event
    img.dispatchEvent(new CustomEvent('imageLoaded', {
      bubbles: true,
      detail: { image: img }
    }));
    
    // Track performance
    this.trackImagePerformance(img);
  }

  handleImageError(img) {
    img.classList.add('error');
    img.classList.remove('loading');
    
    // Try to load fallback image
    const fallback = img.getAttribute('data-fallback');
    if (fallback && img.src !== fallback) {
      img.src = fallback;
      return;
    }
    
    // Trigger error event
    img.dispatchEvent(new CustomEvent('imageError', {
      bubbles: true,
      detail: { image: img }
    }));
  }

  handleVideoLoad(video) {
    video.classList.add('loaded');
    video.classList.remove('loading');
    
    // Remove data attributes
    video.removeAttribute('data-src');
    video.removeAttribute('data-poster');
    
    // Trigger custom event
    video.dispatchEvent(new CustomEvent('videoLoaded', {
      bubbles: true,
      detail: { video: video }
    }));
  }

  trackImagePerformance(img) {
    // Track loading performance for AI Navigation
    if (window.AINavigation) {
      const loadTime = performance.now();
      window.AINavigation.trackEvent('image_loaded', {
        src: img.src,
        loadTime: loadTime,
        section: this.findSectionName(img)
      });
    }
  }

  findSectionName(element) {
    // Find the section this element belongs to
    const section = element.closest('[class*="section"]');
    if (section) {
      const classList = Array.from(section.classList);
      const sectionClass = classList.find(cls => cls.includes('section'));
      return sectionClass || 'unknown';
    }
    return 'unknown';
  }

  bindEvents() {
    // Handle dynamic content
    document.addEventListener('DOMContentLoaded', () => {
      this.refreshObservers();
    });
    
    // Handle Shopify section reloads
    document.addEventListener('shopify:section:load', (e) => {
      setTimeout(() => {
        this.refreshObservers();
      }, 100);
    });
    
    // Handle AJAX content updates
    document.addEventListener('ajaxComplete', () => {
      this.refreshObservers();
    });
    
    // Handle window resize for responsive images
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }

  refreshObservers() {
    // Re-scan for new lazy load elements
    this.setupImageLoading();
    this.setupVideoLoading();
    this.setupBackgroundImages();
    this.setupIframes();
  }

  handleResize() {
    // Update responsive images if needed
    const responsiveImages = document.querySelectorAll('img[data-responsive="true"]');
    responsiveImages.forEach(img => {
      if (img.dataset.srcset) {
        // Trigger re-evaluation of srcset
        const currentSrc = img.src;
        img.src = '';
        img.src = currentSrc;
      }
    });
  }

  loadAllContent() {
    // Fallback for browsers without IntersectionObserver
    const images = document.querySelectorAll('img[data-src]');
    const videos = document.querySelectorAll('video[data-src]');
    const backgrounds = document.querySelectorAll('[data-bg-src]');
    const iframes = document.querySelectorAll('iframe[data-src]');
    
    images.forEach(img => this.loadImage(img));
    videos.forEach(video => this.loadVideo(video));
    backgrounds.forEach(bg => this.loadBackgroundImage(bg));
    iframes.forEach(iframe => this.loadIframe(iframe));
  }

  // Public methods for manual control
  loadElement(element) {
    if (element.tagName === 'IMG') {
      this.loadImage(element);
    } else if (element.tagName === 'VIDEO') {
      this.loadVideo(element);
    } else if (element.hasAttribute('data-bg-src')) {
      this.loadBackgroundImage(element);
    } else if (element.tagName === 'IFRAME') {
      this.loadIframe(element);
    }
  }

  preloadImages(urls) {
    // Preload specific images
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }

  destroy() {
    // Clean up observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    
    console.log('Lazy loading system destroyed');
  }
}

// Critical CSS loader for above-the-fold content
class CriticalCSSLoader {
  constructor() {
    this.loadedStyles = new Set();
    this.init();
  }

  init() {
    this.loadCriticalCSS();
    this.setupDeferredCSS();
  }

  loadCriticalCSS() {
    // Load critical CSS for above-the-fold content
    const criticalSections = document.querySelectorAll('[data-critical="true"]');
    
    criticalSections.forEach(section => {
      const cssFile = section.getAttribute('data-css');
      if (cssFile && !this.loadedStyles.has(cssFile)) {
        this.loadCSS(cssFile, true);
        this.loadedStyles.add(cssFile);
      }
    });
  }

  setupDeferredCSS() {
    // Load non-critical CSS after page load
    window.addEventListener('load', () => {
      const deferredSections = document.querySelectorAll('[data-deferred-css]');
      
      deferredSections.forEach(section => {
        const cssFile = section.getAttribute('data-deferred-css');
        if (cssFile && !this.loadedStyles.has(cssFile)) {
          setTimeout(() => {
            this.loadCSS(cssFile, false);
            this.loadedStyles.add(cssFile);
          }, 100);
        }
      });
    });
  }

  loadCSS(href, critical = false) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    
    if (critical) {
      link.media = 'all';
      document.head.appendChild(link);
    } else {
      link.media = 'print';
      link.onload = function() {
        this.media = 'all';
      };
      document.head.appendChild(link);
    }
  }
}

// Performance monitor
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      imageLoads: 0,
      videoLoads: 0,
      totalLoadTime: 0,
      errors: 0
    };
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.startMonitoring();
  }

  bindEvents() {
    document.addEventListener('imageLoaded', (e) => {
      this.metrics.imageLoads++;
      this.trackLoadTime(e.detail.image);
    });
    
    document.addEventListener('videoLoaded', (e) => {
      this.metrics.videoLoads++;
    });
    
    document.addEventListener('imageError', (e) => {
      this.metrics.errors++;
    });
  }

  startMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      this.monitorWebVitals();
    }
    
    // Monitor custom performance metrics
    setInterval(() => {
      this.reportMetrics();
    }, 30000); // Report every 30 seconds
  }

  trackLoadTime(image) {
    const loadTime = performance.now();
    this.metrics.totalLoadTime += loadTime;
    
    // Track with AI Navigation
    if (window.AINavigation) {
      window.AINavigation.trackEvent('performance_metric', {
        type: 'image_load',
        loadTime: loadTime,
        src: image.src
      });
    }
  }

  reportMetrics() {
    console.log('Performance Metrics:', this.metrics);
    
    // Send to analytics
    if (window.AINavigation) {
      window.AINavigation.trackEvent('performance_report', this.metrics);
    }
  }

  monitorWebVitals() {
    // Monitor Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (window.AINavigation) {
        window.AINavigation.trackEvent('web_vital', {
          name: 'LCP',
          value: lastEntry.startTime
        });
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Monitor Cumulative Layout Shift (CLS)
    new PerformanceObserver((entryList) => {
      let clsValue = 0;
      
      entryList.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      if (window.AINavigation) {
        window.AINavigation.trackEvent('web_vital', {
          name: 'CLS',
          value: clsValue
        });
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Initialize systems
document.addEventListener('DOMContentLoaded', () => {
  window.lazyLoadManager = new LazyLoadManager();
  window.criticalCSSLoader = new CriticalCSSLoader();
  window.performanceMonitor = new PerformanceMonitor();
});

// Export for external use
window.LazyLoadManager = LazyLoadManager;
window.CriticalCSSLoader = CriticalCSSLoader;
window.PerformanceMonitor = PerformanceMonitor; 