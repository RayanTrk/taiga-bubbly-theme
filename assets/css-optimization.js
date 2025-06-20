/**
 * CSS Optimization System for Taiga Theme
 * Handles critical CSS extraction, minification, unused CSS removal, and performance monitoring
 * Following shopirule.mdc specifications for blazing-fast performance
 */

class CSSOptimization {
  constructor() {
    this.criticalCSS = new Set();
    this.loadedStyles = new Map();
    this.unusedSelectors = new Set();
    this.performanceMetrics = {
      totalStylesheets: 0,
      criticalCSS: 0,
      deferredCSS: 0,
      unusedCSS: 0,
      compressionRatio: 0
    };
    
    this.init();
  }
  
  init() {
    this.extractCriticalCSS();
    this.setupDeferredLoading();
    this.setupUnusedCSSDetection();
    this.setupPerformanceMonitoring();
    this.optimizeExistingStyles();
  }
  
  /**
   * Extract critical CSS for above-the-fold content
   */
  extractCriticalCSS() {
    // Define critical selectors based on shopirule.mdc specifications
    this.criticalSelectors = [
      // Layout fundamentals
      'html', 'body', '*', '*::before', '*::after',
      
      // Header (always visible)
      'header', '.header', '.site-header',
      '.header-wrapper', '.header-container',
      '.logo', '.site-logo',
      '.main-nav', '.navigation',
      '.cart-icon', '.search-icon', '.account-icon',
      
      // Hero section (above-the-fold)
      '.hero', '.hero-banner', '.hero-section',
      '.hero-content', '.hero-text', '.hero-image',
      '.hero-cta', '.hero-buttons',
      
      // Critical typography
      'h1', 'h2', '.h1', '.h2',
      '.hero-title', '.page-title', '.section-title',
      
      // Buttons (critical for CTA)
      '.btn', '.button', '.cta-button',
      '.btn-primary', '.btn-secondary',
      
      // Forms (critical for interaction)
      'form', 'input', 'button', 'select', 'textarea',
      '.form-group', '.form-field', '.form-control',
      
      // Grid system (layout critical)
      '.container', '.page-width', '.grid', '.row', '.col',
      '.grid-item', '.flex', '.flexbox',
      
      // Bubbly design essentials (per shopirule.mdc)
      '.floating-bubbles', '.bubble',
      '.gradient-bg', '.bubbly-section',
      
      // Loading states
      '.loading', '.spinner', '.skeleton',
      
      // Accessibility
      '.sr-only', '.skip-link', '.focus-visible',
      
      // Mobile-first responsive
      '@media (max-width: 990px)',
      '@media (max-width: 750px)',
      '@media (max-width: 480px)'
    ];
    
    this.identifyCriticalStyles();
  }
  
  /**
   * Identify critical styles from existing stylesheets
   */
  identifyCriticalStyles() {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
    
    stylesheets.forEach(stylesheet => {
      if (stylesheet.tagName === 'STYLE') {
        this.processCriticalInlineStyles(stylesheet);
      } else if (stylesheet.sheet) {
        this.processCriticalExternalStyles(stylesheet);
      }
    });
  }
  
  /**
   * Process inline styles for critical CSS
   */
  processCriticalInlineStyles(styleElement) {
    try {
      const cssText = styleElement.textContent;
      const criticalRules = this.extractCriticalRules(cssText);
      
      if (criticalRules.length > 0) {
        this.criticalCSS.add(criticalRules.join('\n'));
        styleElement.dataset.critical = 'true';
      }
    } catch (e) {
      console.warn('Error processing inline styles:', e);
    }
  }
  
  /**
   * Process external stylesheets for critical CSS
   */
  processCriticalExternalStyles(linkElement) {
    try {
      if (!linkElement.sheet || !linkElement.sheet.cssRules) return;
      
      const rules = Array.from(linkElement.sheet.cssRules);
      const criticalRules = [];
      
      rules.forEach(rule => {
        if (this.isCriticalRule(rule)) {
          criticalRules.push(rule.cssText);
        }
      });
      
      if (criticalRules.length > 0) {
        this.criticalCSS.add(criticalRules.join('\n'));
        linkElement.dataset.critical = 'true';
        this.performanceMetrics.criticalCSS++;
      }
      
      this.performanceMetrics.totalStylesheets++;
    } catch (e) {
      console.warn('Error processing external stylesheet:', e);
    }
  }
  
  /**
   * Extract critical CSS rules from CSS text
   */
  extractCriticalRules(cssText) {
    const criticalRules = [];
    
    // Split CSS into rules
    const rules = cssText.split('}').filter(rule => rule.trim());
    
    rules.forEach(rule => {
      const fullRule = rule + '}';
      
      // Check if rule contains critical selectors
      if (this.isCriticalCSSText(fullRule)) {
        criticalRules.push(fullRule);
      }
    });
    
    return criticalRules;
  }
  
  /**
   * Check if CSS rule is critical
   */
  isCriticalRule(rule) {
    if (!rule.selectorText) return false;
    
    return this.criticalSelectors.some(selector => {
      // Handle media queries
      if (selector.startsWith('@media')) {
        return rule.parentRule && rule.parentRule.conditionText === selector.replace('@media ', '');
      }
      
      // Handle regular selectors
      return rule.selectorText.includes(selector) || 
             selector.includes('*') ||
             this.matchesWildcardSelector(rule.selectorText, selector);
    });
  }
  
  /**
   * Check if CSS text contains critical selectors
   */
  isCriticalCSSText(cssText) {
    return this.criticalSelectors.some(selector => {
      if (selector.startsWith('@media')) {
        return cssText.includes(selector);
      }
      return cssText.includes(selector) || this.matchesWildcardSelector(cssText, selector);
    });
  }
  
  /**
   * Match wildcard selectors
   */
  matchesWildcardSelector(text, pattern) {
    if (!pattern.includes('*')) return false;
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
    return regex.test(text);
  }
  
  /**
   * Setup deferred loading for non-critical CSS
   */
  setupDeferredLoading() {
    const nonCriticalStyles = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    
    nonCriticalStyles.forEach(link => {
      this.deferStylesheet(link);
    });
  }
  
  /**
   * Defer non-critical stylesheet loading
   */
  deferStylesheet(link) {
    // Skip if already processed
    if (link.dataset.deferred) return;
    
    const href = link.href;
    const media = link.media || 'all';
    
    // Change media to 'print' to load without blocking
    link.media = 'print';
    link.dataset.deferred = 'true';
    
    // Load asynchronously
    link.onload = () => {
      link.media = media;
      link.onload = null;
      
      this.performanceMetrics.deferredCSS++;
      
      // Track loading
      if (window.aiNavigation) {
        window.aiNavigation.trackEvent('css_deferred_loaded', {
          href: href,
          media: media
        });
      }
    };
    
    // Fallback for browsers that don't support onload
    setTimeout(() => {
      if (link.media === 'print') {
        link.media = media;
      }
    }, 3000);
  }
  
  /**
   * Setup unused CSS detection
   */
  setupUnusedCSSDetection() {
    // Use Intersection Observer to track which elements are visible
    if ('IntersectionObserver' in window) {
      this.setupVisibilityTracking();
    }
    
    // Track user interactions to identify used styles
    this.setupInteractionTracking();
    
    // Analyze after page load
    if (document.readyState === 'complete') {
      this.analyzeUnusedCSS();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.analyzeUnusedCSS(), 2000);
      });
    }
  }
  
  /**
   * Setup visibility tracking for CSS usage
   */
  setupVisibilityTracking() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.trackElementStyles(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    // Observe all elements with classes
    const elementsWithClasses = document.querySelectorAll('[class]');
    elementsWithClasses.forEach(el => observer.observe(el));
  }
  
  /**
   * Setup interaction tracking for CSS usage
   */
  setupInteractionTracking() {
    const events = ['click', 'focus', 'hover', 'touchstart'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        this.trackElementStyles(e.target);
        
        // Track parent elements too
        let parent = e.target.parentElement;
        while (parent && parent !== document.body) {
          this.trackElementStyles(parent);
          parent = parent.parentElement;
        }
      }, { passive: true });
    });
  }
  
  /**
   * Track styles used by an element
   */
  trackElementStyles(element) {
    if (!element.className) return;
    
    const classes = element.className.split(' ').filter(cls => cls.trim());
    classes.forEach(className => {
      this.unusedSelectors.delete(`.${className}`);
    });
    
    // Track computed styles
    if (window.getComputedStyle) {
      const computedStyle = window.getComputedStyle(element);
      this.trackComputedStyles(element, computedStyle);
    }
  }
  
  /**
   * Track computed styles to identify usage
   */
  trackComputedStyles(element, computedStyle) {
    // Track if element uses custom properties (CSS variables)
    const cssText = computedStyle.cssText;
    if (cssText.includes('--')) {
      const customProps = cssText.match(/--[\w-]+/g);
      if (customProps) {
        customProps.forEach(prop => {
          this.unusedSelectors.delete(prop);
        });
      }
    }
    
    // Track animation usage
    if (computedStyle.animationName !== 'none') {
      this.unusedSelectors.delete(`@keyframes ${computedStyle.animationName}`);
    }
  }
  
  /**
   * Analyze unused CSS
   */
  analyzeUnusedCSS() {
    try {
      const stylesheets = document.styleSheets;
      const allSelectors = new Set();
      
      Array.from(stylesheets).forEach(stylesheet => {
        try {
          if (stylesheet.cssRules) {
            Array.from(stylesheet.cssRules).forEach(rule => {
              if (rule.selectorText) {
                allSelectors.add(rule.selectorText);
              }
            });
          }
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      });
      
      // Check which selectors are unused
      allSelectors.forEach(selector => {
        if (!this.isSelectorUsed(selector)) {
          this.unusedSelectors.add(selector);
        }
      });
      
      this.performanceMetrics.unusedCSS = this.unusedSelectors.size;
      
      // Report unused CSS
      this.reportUnusedCSS();
      
    } catch (e) {
      console.warn('Error analyzing unused CSS:', e);
    }
  }
  
  /**
   * Check if a selector is used
   */
  isSelectorUsed(selector) {
    try {
      // Skip pseudo-selectors and complex selectors for basic check
      if (selector.includes(':') || selector.includes('[') || selector.includes('>')) {
        return true; // Assume used to avoid false positives
      }
      
      return document.querySelector(selector) !== null;
    } catch (e) {
      return true; // Assume used if query fails
    }
  }
  
  /**
   * Report unused CSS
   */
  reportUnusedCSS() {
    if (this.unusedSelectors.size > 0) {
      console.groupCollapsed(`🎨 CSS Optimization: Found ${this.unusedSelectors.size} potentially unused selectors`);
      console.log('Unused selectors:', Array.from(this.unusedSelectors));
      console.groupEnd();
      
      // Track with AI Navigation
      if (window.aiNavigation) {
        window.aiNavigation.trackEvent('unused_css_detected', {
          count: this.unusedSelectors.size,
          percentage: (this.unusedSelectors.size / this.performanceMetrics.totalStylesheets * 100).toFixed(2)
        });
      }
    }
  }
  
  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor CSS loading performance
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach(entry => {
            if (entry.initiatorType === 'css' || entry.name.endsWith('.css')) {
              this.trackCSSResourceTiming(entry);
            }
          });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('CSS performance monitoring not supported:', e);
      }
    }
    
    // Monitor First Contentful Paint impact
    this.monitorFCPImpact();
  }
  
  /**
   * Track CSS resource timing
   */
  trackCSSResourceTiming(entry) {
    const metrics = {
      url: entry.name,
      duration: entry.duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      renderBlockingStatus: this.isRenderBlocking(entry.name)
    };
    
    // Calculate compression ratio
    if (entry.encodedBodySize && entry.decodedBodySize) {
      metrics.compressionRatio = (1 - entry.encodedBodySize / entry.decodedBodySize) * 100;
      this.performanceMetrics.compressionRatio = metrics.compressionRatio;
    }
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('css_performance', metrics);
    }
  }
  
  /**
   * Check if CSS file is render-blocking
   */
  isRenderBlocking(url) {
    const link = document.querySelector(`link[href="${url}"]`);
    return link && !link.media.includes('print') && !link.hasAttribute('async');
  }
  
  /**
   * Monitor First Contentful Paint impact
   */
  monitorFCPImpact() {
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const fcp = entries[entries.length - 1];
          
          if (fcp) {
            this.trackFCPMetrics(fcp);
          }
        });
        
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('FCP monitoring not supported:', e);
      }
    }
  }
  
  /**
   * Track FCP metrics related to CSS
   */
  trackFCPMetrics(fcpEntry) {
    const metrics = {
      fcp: fcpEntry.startTime,
      criticalCSSCount: this.performanceMetrics.criticalCSS,
      deferredCSSCount: this.performanceMetrics.deferredCSS,
      totalStylesheets: this.performanceMetrics.totalStylesheets
    };
    
    // Track with analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'css_fcp_impact', {
        event_category: 'Performance',
        value: Math.round(fcpEntry.startTime),
        custom_map: {
          critical_css: this.performanceMetrics.criticalCSS,
          deferred_css: this.performanceMetrics.deferredCSS
        }
      });
    }
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('css_fcp_metrics', metrics);
    }
  }
  
  /**
   * Optimize existing styles
   */
  optimizeExistingStyles() {
    // Add loading classes to stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach(link => {
      link.addEventListener('load', () => {
        link.dataset.loaded = 'true';
      });
      
      link.addEventListener('error', () => {
        link.dataset.error = 'true';
        this.handleStylesheetError(link);
      });
    });
    
    // Optimize font loading
    this.optimizeFontLoading();
  }
  
  /**
   * Handle stylesheet loading errors
   */
  handleStylesheetError(link) {
    console.warn('Failed to load stylesheet:', link.href);
    
    // Track error
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('css_load_error', {
        href: link.href,
        media: link.media
      });
    }
    
    // Try to load from fallback if available
    const fallback = link.dataset.fallback;
    if (fallback && link.href !== fallback) {
      link.href = fallback;
    }
  }
  
  /**
   * Optimize font loading
   */
  optimizeFontLoading() {
    // Add font-display: swap to improve perceived performance
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
    
    // Preload critical fonts
    this.preloadCriticalFonts();
  }
  
  /**
   * Preload critical fonts
   */
  preloadCriticalFonts() {
    const criticalFonts = [
      // Add critical font URLs here
      // These should be the fonts used for headers and above-the-fold content
    ];
    
    criticalFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = fontUrl;
      document.head.appendChild(link);
    });
  }
  
  /**
   * Generate critical CSS
   */
  generateCriticalCSS() {
    const criticalCSS = Array.from(this.criticalCSS).join('\n');
    
    // Minify critical CSS
    const minifiedCSS = this.minifyCSS(criticalCSS);
    
    return minifiedCSS;
  }
  
  /**
   * Minify CSS
   */
  minifyCSS(css) {
    return css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove space around certain characters
      .replace(/\s*([{}:;,>+~])\s*/g, '$1')
      // Remove trailing semicolon
      .replace(/;}/g, '}')
      // Remove empty rules
      .replace(/[^{}]+{\s*}/g, '')
      .trim();
  }
  
  /**
   * Inject critical CSS inline
   */
  injectCriticalCSS() {
    const criticalCSS = this.generateCriticalCSS();
    
    if (criticalCSS) {
      const style = document.createElement('style');
      style.textContent = criticalCSS;
      style.dataset.critical = 'true';
      document.head.insertBefore(style, document.head.firstChild);
      
      console.log('🎨 Critical CSS injected:', criticalCSS.length, 'characters');
    }
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      ...this.performanceMetrics,
      criticalCSSSize: Array.from(this.criticalCSS).join('').length,
      unusedSelectorsCount: this.unusedSelectors.size,
      optimizationScore: this.calculateOptimizationScore()
    };
  }
  
  /**
   * Calculate optimization score
   */
  calculateOptimizationScore() {
    let score = 100;
    
    // Deduct points for render-blocking CSS
    const renderBlockingCSS = document.querySelectorAll('link[rel="stylesheet"]:not([media*="print"]):not([data-deferred])');
    score -= renderBlockingCSS.length * 10;
    
    // Deduct points for unused CSS
    if (this.performanceMetrics.totalStylesheets > 0) {
      const unusedPercentage = (this.unusedSelectors.size / this.performanceMetrics.totalStylesheets) * 100;
      score -= unusedPercentage * 0.5;
    }
    
    // Add points for critical CSS
    if (this.performanceMetrics.criticalCSS > 0) {
      score += 10;
    }
    
    // Add points for deferred CSS
    if (this.performanceMetrics.deferredCSS > 0) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Public API methods
   */
  
  // Force load all deferred CSS (useful for print)
  loadAllCSS() {
    const deferredStyles = document.querySelectorAll('link[data-deferred="true"]');
    deferredStyles.forEach(link => {
      link.media = link.dataset.originalMedia || 'all';
    });
  }
  
  // Add new stylesheet with optimization
  addStylesheet(href, options = {}) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = options.media || 'all';
    
    if (options.critical) {
      link.dataset.critical = 'true';
    } else {
      this.deferStylesheet(link);
    }
    
    document.head.appendChild(link);
    return link;
  }
  
  // Cleanup
  destroy() {
    this.criticalCSS.clear();
    this.loadedStyles.clear();
    this.unusedSelectors.clear();
  }
}

// Initialize CSS optimization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cssOptimization = new CSSOptimization();
  });
} else {
  window.cssOptimization = new CSSOptimization();
}

// Export for external use
window.CSSOptimization = CSSOptimization; 