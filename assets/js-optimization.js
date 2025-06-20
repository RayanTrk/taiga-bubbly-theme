/**
 * JavaScript Optimization System for Taiga Theme
 * Handles minification, tree-shaking, code splitting, and performance monitoring
 * Following shopirule.mdc specifications for blazing-fast performance
 */

class JSOptimization {
  constructor() {
    this.loadedModules = new Map();
    this.deferredScripts = new Set();
    this.criticalScripts = new Set();
    this.performanceMetrics = {
      totalScripts: 0,
      criticalScripts: 0,
      deferredScripts: 0,
      asyncScripts: 0,
      moduleScripts: 0,
      totalSize: 0,
      compressionRatio: 0,
      executionTime: 0
    };
    
    this.init();
  }
  
  init() {
    this.identifyCriticalScripts();
    this.setupDeferredLoading();
    this.setupCodeSplitting();
    this.setupPerformanceMonitoring();
    this.optimizeExistingScripts();
    this.setupErrorHandling();
  }
  
  /**
   * Identify critical scripts that should load immediately
   */
  identifyCriticalScripts() {
    // Critical scripts based on shopirule.mdc specifications
    this.criticalScriptPatterns = [
      // Core theme functionality
      'theme.js',
      'main.js',
      'critical.js',
      
      // Above-the-fold functionality
      'header.js',
      'navigation.js',
      'hero.js',
      
      // Performance critical
      'lazy-loading.js',
      'image-optimization.js',
      'css-optimization.js',
      
      // AI Navigation (performance feature)
      'ai-navigation.js',
      
      // Bubbly design animations (core to theme)
      'bubble-animations.js',
      
      // Critical e-commerce
      'cart.js',
      'product.js'
    ];
    
    this.identifyExistingCriticalScripts();
  }
  
  /**
   * Identify existing critical scripts
   */
  identifyExistingCriticalScripts() {
    const scripts = document.querySelectorAll('script[src]');
    
    scripts.forEach(script => {
      const src = script.src;
      const isCritical = this.criticalScriptPatterns.some(pattern => 
        src.includes(pattern) || script.hasAttribute('data-critical')
      );
      
      if (isCritical) {
        this.criticalScripts.add(script);
        script.dataset.critical = 'true';
        this.performanceMetrics.criticalScripts++;
      }
      
      this.performanceMetrics.totalScripts++;
    });
  }
  
  /**
   * Setup deferred loading for non-critical scripts
   */
  setupDeferredLoading() {
    const nonCriticalScripts = document.querySelectorAll('script[src]:not([data-critical]):not([async]):not([defer])');
    
    nonCriticalScripts.forEach(script => {
      this.deferScript(script);
    });
    
    // Setup intersection-based loading for below-fold scripts
    this.setupIntersectionBasedLoading();
  }
  
  /**
   * Defer non-critical script loading
   */
  deferScript(script) {
    // Skip if already processed
    if (script.dataset.deferred) return;
    
    const src = script.src;
    const originalScript = script;
    
    // Mark as deferred
    script.dataset.deferred = 'true';
    this.deferredScripts.add(script);
    this.performanceMetrics.deferredScripts++;
    
    // Remove from DOM temporarily
    script.remove();
    
    // Load after page load or user interaction
    const loadScript = () => {
      const newScript = document.createElement('script');
      newScript.src = src;
      newScript.async = true;
      
      // Copy attributes
      Array.from(originalScript.attributes).forEach(attr => {
        if (attr.name !== 'src') {
          newScript.setAttribute(attr.name, attr.value);
        }
      });
      
      newScript.onload = () => {
        this.handleScriptLoad(newScript, src);
      };
      
      newScript.onerror = () => {
        this.handleScriptError(newScript, src);
      };
      
      document.head.appendChild(newScript);
    };
    
    // Load based on strategy
    this.scheduleScriptLoad(loadScript, script);
  }
  
  /**
   * Schedule script loading based on strategy
   */
  scheduleScriptLoad(loadFunction, script) {
    const strategy = script.dataset.loadStrategy || 'idle';
    
    switch (strategy) {
      case 'immediate':
        loadFunction();
        break;
        
      case 'interaction':
        this.loadOnInteraction(loadFunction);
        break;
        
      case 'visible':
        this.loadOnVisible(loadFunction, script);
        break;
        
      case 'idle':
      default:
        this.loadOnIdle(loadFunction);
        break;
    }
  }
  
  /**
   * Load script when browser is idle
   */
  loadOnIdle(loadFunction) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadFunction, { timeout: 3000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(loadFunction, 2000);
    }
  }
  
  /**
   * Load script on user interaction
   */
  loadOnInteraction(loadFunction) {
    const events = ['click', 'scroll', 'keydown', 'touchstart', 'mouseover'];
    let loaded = false;
    
    const handleInteraction = () => {
      if (!loaded) {
        loaded = true;
        loadFunction();
        
        // Remove event listeners
        events.forEach(event => {
          document.removeEventListener(event, handleInteraction, { passive: true });
        });
      }
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { passive: true });
    });
  }
  
  /**
   * Load script when element becomes visible
   */
  loadOnVisible(loadFunction, script) {
    const targetSelector = script.dataset.visibleTarget;
    if (!targetSelector) {
      this.loadOnIdle(loadFunction);
      return;
    }
    
    const target = document.querySelector(targetSelector);
    if (!target) {
      this.loadOnIdle(loadFunction);
      return;
    }
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadFunction();
            observer.unobserve(target);
          }
        });
      }, {
        rootMargin: '50px'
      });
      
      observer.observe(target);
    } else {
      this.loadOnIdle(loadFunction);
    }
  }
  
  /**
   * Setup intersection-based loading for specific sections
   */
  setupIntersectionBasedLoading() {
    // Define section-specific scripts
    this.sectionScripts = {
      '.product-section': ['product-gallery.js', 'variant-selector.js'],
      '.collection-section': ['collection-filters.js', 'infinite-scroll.js'],
      '.cart-section': ['cart-drawer.js', 'cart-upsells.js'],
      '.blog-section': ['blog-pagination.js', 'article-sharing.js'],
      '.contact-section': ['contact-form.js', 'map-integration.js']
    };
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadSectionScripts(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '100px'
      });
      
      // Observe sections
      Object.keys(this.sectionScripts).forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => observer.observe(el));
      });
    }
  }
  
  /**
   * Load scripts for specific section
   */
  loadSectionScripts(sectionElement) {
    const sectionClass = Array.from(sectionElement.classList).find(cls => 
      Object.keys(this.sectionScripts).some(selector => selector.includes(cls))
    );
    
    if (!sectionClass) return;
    
    const selector = `.${sectionClass}`;
    const scripts = this.sectionScripts[selector];
    
    if (scripts) {
      scripts.forEach(scriptName => {
        this.loadModule(scriptName);
      });
    }
  }
  
  /**
   * Setup code splitting and module loading
   */
  setupCodeSplitting() {
    // Define module dependencies
    this.moduleDependencies = {
      'product-gallery.js': ['image-optimization.js'],
      'cart-drawer.js': ['animation-utils.js'],
      'collection-filters.js': ['ajax-utils.js'],
      'ai-navigation.js': ['analytics-utils.js']
    };
    
    // Setup dynamic import support
    this.setupDynamicImports();
  }
  
  /**
   * Setup dynamic imports for modern browsers
   */
  setupDynamicImports() {
    // Feature detection for dynamic imports
    this.supportsDynamicImports = false;
    
    try {
      new Function('import("")');
      this.supportsDynamicImports = true;
    } catch (e) {
      console.log('Dynamic imports not supported, using fallback');
    }
  }
  
  /**
   * Load module with dependencies
   */
  async loadModule(moduleName) {
    // Check if already loaded
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName);
    }
    
    // Load dependencies first
    const dependencies = this.moduleDependencies[moduleName] || [];
    await Promise.all(dependencies.map(dep => this.loadModule(dep)));
    
    // Load the module
    const modulePromise = this.loadModuleScript(moduleName);
    this.loadedModules.set(moduleName, modulePromise);
    
    return modulePromise;
  }
  
  /**
   * Load individual module script
   */
  loadModuleScript(moduleName) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      
      if (this.supportsDynamicImports && moduleName.endsWith('.mjs')) {
        script.type = 'module';
        script.src = this.getAssetUrl(moduleName);
      } else {
        script.src = this.getAssetUrl(moduleName);
      }
      
      script.onload = () => {
        this.handleScriptLoad(script, moduleName);
        resolve(script);
      };
      
      script.onerror = () => {
        this.handleScriptError(script, moduleName);
        reject(new Error(`Failed to load module: ${moduleName}`));
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * Get asset URL for module
   */
  getAssetUrl(moduleName) {
    // Use Shopify's asset_url filter equivalent
    const baseUrl = window.Shopify?.routes?.root || '/';
    return `${baseUrl}assets/${moduleName}`;
  }
  
  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor script loading performance
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach(entry => {
            if (entry.initiatorType === 'script' || entry.name.endsWith('.js')) {
              this.trackScriptResourceTiming(entry);
            }
          });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('Script performance monitoring not supported:', e);
      }
    }
    
    // Monitor JavaScript execution time
    this.monitorExecutionTime();
    
    // Monitor Long Tasks
    this.monitorLongTasks();
  }
  
  /**
   * Track script resource timing
   */
  trackScriptResourceTiming(entry) {
    const metrics = {
      url: entry.name,
      duration: entry.duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
      isCritical: this.isCriticalScript(entry.name),
      isDeferred: this.isDeferredScript(entry.name)
    };
    
    // Calculate compression ratio
    if (entry.encodedBodySize && entry.decodedBodySize) {
      metrics.compressionRatio = (1 - entry.encodedBodySize / entry.decodedBodySize) * 100;
      this.performanceMetrics.compressionRatio = metrics.compressionRatio;
    }
    
    this.performanceMetrics.totalSize += entry.transferSize || 0;
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('script_performance', metrics);
    }
  }
  
  /**
   * Check if script is critical
   */
  isCriticalScript(url) {
    return this.criticalScriptPatterns.some(pattern => url.includes(pattern));
  }
  
  /**
   * Check if script is deferred
   */
  isDeferredScript(url) {
    const script = document.querySelector(`script[src*="${url}"]`);
    return script && script.dataset.deferred === 'true';
  }
  
  /**
   * Monitor JavaScript execution time
   */
  monitorExecutionTime() {
    const originalEval = window.eval;
    let totalExecutionTime = 0;
    
    // Wrap eval to track execution time (basic measurement)
    window.eval = function(code) {
      const start = performance.now();
      const result = originalEval.call(this, code);
      const end = performance.now();
      
      totalExecutionTime += (end - start);
      return result;
    };
    
    // Track total execution time periodically
    setInterval(() => {
      this.performanceMetrics.executionTime = totalExecutionTime;
    }, 5000);
  }
  
  /**
   * Monitor Long Tasks that block the main thread
   */
  monitorLongTasks() {
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach(entry => {
            this.trackLongTask(entry);
          });
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task monitoring not supported:', e);
      }
    }
  }
  
  /**
   * Track long tasks
   */
  trackLongTask(entry) {
    const metrics = {
      duration: entry.duration,
      startTime: entry.startTime,
      attribution: entry.attribution || []
    };
    
    // Log warning for long tasks
    if (entry.duration > 50) {
      console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
    }
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('long_task', metrics);
    }
    
    // Track with analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'long_task', {
        event_category: 'Performance',
        value: Math.round(entry.duration),
        custom_map: {
          task_duration: entry.duration
        }
      });
    }
  }
  
  /**
   * Optimize existing scripts
   */
  optimizeExistingScripts() {
    // Add async/defer attributes where appropriate
    const scripts = document.querySelectorAll('script[src]:not([data-critical])');
    
    scripts.forEach(script => {
      if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
        // Add defer for non-critical scripts
        script.defer = true;
        this.performanceMetrics.deferredScripts++;
      }
      
      if (script.hasAttribute('async')) {
        this.performanceMetrics.asyncScripts++;
      }
      
      if (script.type === 'module') {
        this.performanceMetrics.moduleScripts++;
      }
    });
    
    // Optimize inline scripts
    this.optimizeInlineScripts();
  }
  
  /**
   * Optimize inline scripts
   */
  optimizeInlineScripts() {
    const inlineScripts = document.querySelectorAll('script:not([src])');
    
    inlineScripts.forEach(script => {
      const content = script.textContent;
      
      // Check if script is critical
      const isCritical = this.isCriticalInlineScript(content);
      
      if (!isCritical) {
        // Defer non-critical inline scripts
        this.deferInlineScript(script);
      }
    });
  }
  
  /**
   * Check if inline script is critical
   */
  isCriticalInlineScript(content) {
    const criticalPatterns = [
      'document.documentElement.className',
      'webp-support',
      'critical-css',
      'theme-detection',
      'viewport-detection'
    ];
    
    return criticalPatterns.some(pattern => content.includes(pattern));
  }
  
  /**
   * Defer inline script execution
   */
  deferInlineScript(script) {
    const content = script.textContent;
    script.remove();
    
    // Execute after page load
    if (document.readyState === 'complete') {
      this.executeInlineScript(content);
    } else {
      window.addEventListener('load', () => {
        this.executeInlineScript(content);
      });
    }
  }
  
  /**
   * Execute inline script content
   */
  executeInlineScript(content) {
    try {
      new Function(content)();
    } catch (e) {
      console.error('Error executing deferred inline script:', e);
    }
  }
  
  /**
   * Handle script load success
   */
  handleScriptLoad(script, src) {
    script.dataset.loaded = 'true';
    
    // Track loading
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('script_loaded', {
        src: src,
        critical: script.dataset.critical === 'true',
        deferred: script.dataset.deferred === 'true'
      });
    }
  }
  
  /**
   * Handle script loading errors
   */
  handleScriptError(script, src) {
    script.dataset.error = 'true';
    
    console.error('Failed to load script:', src);
    
    // Track error
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('script_error', {
        src: src,
        critical: script.dataset.critical === 'true'
      });
    }
    
    // Try fallback if available
    const fallback = script.dataset.fallback;
    if (fallback && script.src !== fallback) {
      script.src = fallback;
    }
  }
  
  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // Global JavaScript error handler
    window.addEventListener('error', (e) => {
      this.handleJavaScriptError(e);
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      this.handleUnhandledRejection(e);
    });
  }
  
  /**
   * Handle JavaScript errors
   */
  handleJavaScriptError(errorEvent) {
    const error = {
      message: errorEvent.message,
      filename: errorEvent.filename,
      lineno: errorEvent.lineno,
      colno: errorEvent.colno,
      stack: errorEvent.error?.stack
    };
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('javascript_error', error);
    }
    
    // Track with analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }
  
  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event) {
    const rejection = {
      reason: event.reason?.toString() || 'Unknown rejection',
      stack: event.reason?.stack
    };
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('unhandled_rejection', rejection);
    }
  }
  
  /**
   * Tree shake unused code (basic implementation)
   */
  treeShakeUnusedCode() {
    // This is a simplified version - in production, this would be done at build time
    const unusedFunctions = this.detectUnusedFunctions();
    
    if (unusedFunctions.length > 0) {
      console.groupCollapsed(`🌳 Tree Shaking: Found ${unusedFunctions.length} potentially unused functions`);
      console.log('Unused functions:', unusedFunctions);
      console.groupEnd();
    }
  }
  
  /**
   * Detect unused functions (basic implementation)
   */
  detectUnusedFunctions() {
    const unusedFunctions = [];
    
    // This is a simplified detection - real tree shaking happens at build time
    try {
      const scripts = document.querySelectorAll('script:not([src])');
      scripts.forEach(script => {
        const content = script.textContent;
        const functionMatches = content.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
        
        if (functionMatches) {
          functionMatches.forEach(match => {
            const functionName = match.replace('function ', '');
            
            // Check if function is called anywhere
            const isUsed = content.includes(`${functionName}(`) || 
                          document.documentElement.outerHTML.includes(`${functionName}(`);
            
            if (!isUsed) {
              unusedFunctions.push(functionName);
            }
          });
        }
      });
    } catch (e) {
      console.warn('Error detecting unused functions:', e);
    }
    
    return unusedFunctions;
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      ...this.performanceMetrics,
      loadedModulesCount: this.loadedModules.size,
      deferredScriptsCount: this.deferredScripts.size,
      criticalScriptsCount: this.criticalScripts.size,
      optimizationScore: this.calculateOptimizationScore()
    };
  }
  
  /**
   * Calculate optimization score
   */
  calculateOptimizationScore() {
    let score = 100;
    
    // Deduct points for blocking scripts
    const blockingScripts = document.querySelectorAll('script[src]:not([async]):not([defer]):not([data-critical])');
    score -= blockingScripts.length * 15;
    
    // Add points for deferred scripts
    if (this.performanceMetrics.deferredScripts > 0) {
      score += 10;
    }
    
    // Add points for async scripts
    if (this.performanceMetrics.asyncScripts > 0) {
      score += 5;
    }
    
    // Add points for module scripts
    if (this.performanceMetrics.moduleScripts > 0) {
      score += 5;
    }
    
    // Deduct points for large total size
    if (this.performanceMetrics.totalSize > 500000) { // 500KB
      score -= 20;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Public API methods
   */
  
  // Force load all deferred scripts
  loadAllScripts() {
    this.deferredScripts.forEach(script => {
      if (!script.dataset.loaded) {
        this.loadModuleScript(script.src);
      }
    });
  }
  
  // Add new script with optimization
  addScript(src, options = {}) {
    const script = document.createElement('script');
    script.src = src;
    
    if (options.critical) {
      script.dataset.critical = 'true';
      this.criticalScripts.add(script);
    } else {
      this.deferScript(script);
    }
    
    if (options.async) {
      script.async = true;
    }
    
    if (options.defer) {
      script.defer = true;
    }
    
    document.head.appendChild(script);
    return script;
  }
  
  // Cleanup
  destroy() {
    this.loadedModules.clear();
    this.deferredScripts.clear();
    this.criticalScripts.clear();
  }
}

// Initialize JS optimization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.jsOptimization = new JSOptimization();
  });
} else {
  window.jsOptimization = new JSOptimization();
}

// Export for external use
window.JSOptimization = JSOptimization; 