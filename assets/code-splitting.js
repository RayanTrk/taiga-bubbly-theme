/**
 * Code Splitting System - Bubbly Style
 * Dynamic module loading for better performance
 */

class CodeSplittingManager {
  constructor() {
    this.loadedModules = new Map();
    this.loadingPromises = new Map();
    this.moduleRegistry = new Map();
    this.config = {
      baseUrl: window.location.origin,
      timeout: 10000,
      retryAttempts: 3,
      enablePreload: true
    };
    
    this.init();
  }

  init() {
    this.registerModules();
    this.setupIntersectionObserver();
    this.bindEvents();
    this.preloadCriticalModules();
    
    console.log('Code splitting system initialized');
  }

  registerModules() {
    // Register available modules with their dependencies and conditions
    this.moduleRegistry.set('cart-drawer', {
      path: '/assets/cart-drawer.js',
      dependencies: [],
      condition: () => document.querySelector('[data-cart-drawer]'),
      critical: false,
      preload: false
    });

    this.moduleRegistry.set('quick-buy', {
      path: '/assets/quick-buy.js',
      dependencies: [],
      condition: () => document.querySelector('[data-quick-buy]'),
      critical: false,
      preload: true
    });

    this.moduleRegistry.set('product-recommendations', {
      path: '/assets/product-recommendations.js',
      dependencies: [],
      condition: () => document.querySelector('[data-product-recommendations]'),
      critical: false,
      preload: false
    });

    this.moduleRegistry.set('newsletter-signup', {
      path: '/assets/section-newsletter.js',
      dependencies: [],
      condition: () => document.querySelector('.newsletter-section'),
      critical: false,
      preload: false
    });

    this.moduleRegistry.set('contact-form', {
      path: '/assets/section-contact-form.js',
      dependencies: [],
      condition: () => document.querySelector('.contact-section'),
      critical: false,
      preload: false
    });

    this.moduleRegistry.set('video-section', {
      path: '/assets/section-video.js',
      dependencies: [],
      condition: () => document.querySelector('.video-section'),
      critical: false,
      preload: false
    });

    this.moduleRegistry.set('image-gallery', {
      path: '/assets/section-image-gallery.js',
      dependencies: [],
      condition: () => document.querySelector('.image-gallery-section'),
      critical: false,
      preload: false
    });

    this.moduleRegistry.set('collection-showcase', {
      path: '/assets/section-collection-showcase.js',
      dependencies: [],
      condition: () => document.querySelector('.collection-showcase-section'),
      critical: false,
      preload: false
    });

    this.moduleRegistry.set('hero-banner', {
      path: '/assets/section-hero-banner.js',
      dependencies: [],
      condition: () => document.querySelector('.hero-section'),
      critical: true,
      preload: true
    });

    this.moduleRegistry.set('lazy-loading', {
      path: '/assets/lazy-loading.js',
      dependencies: [],
      condition: () => document.querySelector('[data-src], [data-bg-src]'),
      critical: true,
      preload: true
    });

    this.moduleRegistry.set('ai-navigation', {
      path: '/assets/ai-navigation.js',
      dependencies: [],
      condition: () => window.performanceConfig?.enableAINavigation,
      critical: false,
      preload: true
    });
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all modules immediately
      this.loadAllModules();
      return;
    }

    // Observer for lazy loading modules when elements come into view
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const moduleName = element.getAttribute('data-module');
          
          if (moduleName && this.moduleRegistry.has(moduleName)) {
            this.loadModule(moduleName).catch(error => {
              console.error(`Failed to load module ${moduleName}:`, error);
            });
            
            this.observer.unobserve(element);
          }
        }
      });
    }, {
      rootMargin: '100px',
      threshold: 0.1
    });

    // Observe elements that require specific modules
    this.observeModuleElements();
  }

  observeModuleElements() {
    // Set up observers for elements that need specific modules
    const moduleElements = [
      { selector: '[data-cart-drawer]', module: 'cart-drawer' },
      { selector: '[data-quick-buy]', module: 'quick-buy' },
      { selector: '[data-product-recommendations]', module: 'product-recommendations' },
      { selector: '.newsletter-section', module: 'newsletter-signup' },
      { selector: '.contact-section', module: 'contact-form' },
      { selector: '.video-section', module: 'video-section' },
      { selector: '.image-gallery-section', module: 'image-gallery' },
      { selector: '.collection-showcase-section', module: 'collection-showcase' }
    ];

    moduleElements.forEach(({ selector, module }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.setAttribute('data-module', module);
        this.observer.observe(element);
      });
    });
  }

  bindEvents() {
    // Load modules on user interactions
    document.addEventListener('click', (e) => {
      this.handleInteraction(e);
    });

    document.addEventListener('mouseover', (e) => {
      this.handleHover(e);
    });

    // Handle Shopify section loads
    document.addEventListener('shopify:section:load', (e) => {
      setTimeout(() => {
        this.observeModuleElements();
        this.loadModulesForSection(e.target);
      }, 100);
    });

    // Handle dynamic content updates
    document.addEventListener('DOMContentLoaded', () => {
      this.loadConditionalModules();
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.loadDeferredModules();
      }
    });
  }

  handleInteraction(e) {
    const target = e.target.closest('[data-requires-module]');
    if (target) {
      const moduleName = target.getAttribute('data-requires-module');
      this.loadModule(moduleName);
    }

    // Cart interactions
    if (e.target.closest('[data-cart-toggle], [data-add-to-cart]')) {
      this.loadModule('cart-drawer');
    }

    // Quick buy interactions
    if (e.target.closest('[data-quick-buy-trigger]')) {
      this.loadModule('quick-buy');
    }
  }

  handleHover(e) {
    // Preload modules on hover for better UX
    const target = e.target.closest('[data-preload-module]');
    if (target) {
      const moduleName = target.getAttribute('data-preload-module');
      this.preloadModule(moduleName);
    }
  }

  loadModulesForSection(section) {
    // Load modules required by a specific section
    const sectionClasses = Array.from(section.classList);
    
    sectionClasses.forEach(className => {
      switch (className) {
        case 'newsletter-section':
          this.loadModule('newsletter-signup');
          break;
        case 'contact-section':
          this.loadModule('contact-form');
          break;
        case 'video-section':
          this.loadModule('video-section');
          break;
        case 'image-gallery-section':
          this.loadModule('image-gallery');
          break;
        case 'collection-showcase-section':
          this.loadModule('collection-showcase');
          break;
        case 'hero-section':
          this.loadModule('hero-banner');
          break;
      }
    });
  }

  preloadCriticalModules() {
    // Preload critical modules immediately
    this.moduleRegistry.forEach((config, name) => {
      if (config.critical || config.preload) {
        this.preloadModule(name);
      }
    });
  }

  loadConditionalModules() {
    // Load modules based on conditions
    this.moduleRegistry.forEach((config, name) => {
      if (config.condition && config.condition()) {
        if (config.critical) {
          this.loadModule(name);
        } else {
          // Defer non-critical modules
          setTimeout(() => {
            this.loadModule(name);
          }, 1000);
        }
      }
    });
  }

  loadDeferredModules() {
    // Load deferred modules when page becomes visible
    this.moduleRegistry.forEach((config, name) => {
      if (!config.critical && !this.loadedModules.has(name)) {
        if (config.condition && config.condition()) {
          this.loadModule(name);
        }
      }
    });
  }

  async loadModule(name, options = {}) {
    if (!this.moduleRegistry.has(name)) {
      throw new Error(`Module ${name} not registered`);
    }

    // Return existing promise if module is already loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    // Return cached module if already loaded
    if (this.loadedModules.has(name)) {
      return this.loadedModules.get(name);
    }

    const config = this.moduleRegistry.get(name);
    const loadPromise = this.loadModuleScript(name, config, options);
    
    this.loadingPromises.set(name, loadPromise);
    
    try {
      const module = await loadPromise;
      this.loadedModules.set(name, module);
      this.loadingPromises.delete(name);
      
      // Track module loading
      this.trackModuleLoad(name, true);
      
      return module;
    } catch (error) {
      this.loadingPromises.delete(name);
      this.trackModuleLoad(name, false, error);
      throw error;
    }
  }

  async loadModuleScript(name, config, options = {}) {
    const { retryAttempts = this.config.retryAttempts } = options;
    
    // Load dependencies first
    if (config.dependencies && config.dependencies.length > 0) {
      await Promise.all(
        config.dependencies.map(dep => this.loadModule(dep))
      );
    }

    let attempt = 0;
    
    while (attempt < retryAttempts) {
      try {
        const module = await this.loadScript(config.path);
        return module;
      } catch (error) {
        attempt++;
        
        if (attempt >= retryAttempts) {
          throw new Error(`Failed to load module ${name} after ${retryAttempts} attempts: ${error.message}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve(window[this.getModuleGlobalName(src)]);
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      
      const timeout = setTimeout(() => {
        reject(new Error(`Script load timeout: ${src}`));
      }, this.config.timeout);

      script.onload = () => {
        clearTimeout(timeout);
        resolve(window[this.getModuleGlobalName(src)]);
      };

      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Script load error: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  getModuleGlobalName(src) {
    // Extract module name from script path for global variable access
    const filename = src.split('/').pop().replace('.js', '');
    return filename.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
  }

  async preloadModule(name) {
    if (!this.moduleRegistry.has(name)) return;
    
    const config = this.moduleRegistry.get(name);
    
    // Create link preload hint
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = config.path;
    link.as = 'script';
    link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
    
    // Track preload
    if (window.AINavigation) {
      window.AINavigation.trackEvent('module_preload', {
        module: name,
        path: config.path,
        timestamp: Date.now()
      });
    }
  }

  trackModuleLoad(name, success, error = null) {
    // Track module loading for performance analysis
    const trackingData = {
      module: name,
      success: success,
      timestamp: Date.now(),
      loadTime: performance.now()
    };

    if (error) {
      trackingData.error = error.message;
    }

    // Track with AI Navigation
    if (window.AINavigation) {
      window.AINavigation.trackEvent('module_load', trackingData);
    }

    // Track with analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'module_load', {
        event_category: 'performance',
        event_label: name,
        value: success ? 1 : 0
      });
    }

    if (this.config.debug) {
      console.log(`Module ${name} ${success ? 'loaded' : 'failed'}:`, trackingData);
    }
  }

  loadAllModules() {
    // Fallback method to load all modules
    this.moduleRegistry.forEach((config, name) => {
      if (config.condition && config.condition()) {
        this.loadModule(name).catch(error => {
          console.error(`Failed to load module ${name}:`, error);
        });
      }
    });
  }

  // Public API methods
  async require(moduleName) {
    return this.loadModule(moduleName);
  }

  isLoaded(moduleName) {
    return this.loadedModules.has(moduleName);
  }

  isLoading(moduleName) {
    return this.loadingPromises.has(moduleName);
  }

  getLoadedModules() {
    return Array.from(this.loadedModules.keys());
  }

  getRegisteredModules() {
    return Array.from(this.moduleRegistry.keys());
  }

  destroy() {
    // Clean up observers and references
    if (this.observer) {
      this.observer.disconnect();
    }
    
    this.loadedModules.clear();
    this.loadingPromises.clear();
    this.moduleRegistry.clear();
    
    console.log('Code splitting system destroyed');
  }
}

// Initialize code splitting system
document.addEventListener('DOMContentLoaded', () => {
  window.codeSplittingManager = new CodeSplittingManager();
});

// Export for external use
window.CodeSplittingManager = CodeSplittingManager;

// Utility function for manual module loading
window.loadModule = function(moduleName) {
  if (window.codeSplittingManager) {
    return window.codeSplittingManager.require(moduleName);
  }
  
  console.warn('Code splitting manager not initialized');
  return Promise.reject(new Error('Code splitting manager not available'));
}; 