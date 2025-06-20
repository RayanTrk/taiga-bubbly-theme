/**
 * Performance Monitoring System for Taiga Theme
 * Tracks Core Web Vitals, page load metrics, and user experience indicators
 * Following shopirule.mdc specifications for blazing-fast performance
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      // Core Web Vitals
      lcp: null,
      fid: null,
      cls: null,
      
      // Additional Web Vitals
      fcp: null,
      ttfb: null,
      
      // Custom metrics
      pageLoadTime: null,
      domContentLoadedTime: null,
      firstByteTime: null,
      
      // User experience metrics
      scrollDepth: 0,
      timeOnPage: 0,
      bounceRate: null,
      
      // Theme-specific metrics
      bubbleAnimationPerformance: null,
      imageOptimizationScore: null,
      cssOptimizationScore: null,
      jsOptimizationScore: null
    };
    
    this.observers = [];
    this.startTime = performance.now();
    this.isPageVisible = !document.hidden;
    this.hasInteracted = false;
    
    this.init();
  }
  
  init() {
    this.setupCoreWebVitals();
    this.setupNavigationTiming();
    this.setupUserExperienceTracking();
    this.setupCustomMetrics();
    this.setupReporting();
  }
  
  /**
   * Setup Core Web Vitals monitoring
   */
  setupCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // First Input Delay (FID)
    this.observeFID();
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // First Contentful Paint (FCP)
    this.observeFCP();
    
    // Time to First Byte (TTFB)
    this.observeTTFB();
  }
  
  /**
   * Observe Largest Contentful Paint
   */
  observeLCP() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.metrics.lcp = lastEntry.startTime;
        
        // Track LCP element details
        const lcpElement = lastEntry.element;
        if (lcpElement) {
          this.trackLCPElement(lcpElement, lastEntry);
        }
        
        this.reportMetric('lcp', this.metrics.lcp);
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP monitoring not supported:', e);
    }
  }
  
  /**
   * Track LCP element details
   */
  trackLCPElement(element, entry) {
    const lcpDetails = {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      src: element.src || element.currentSrc,
      loadTime: entry.startTime,
      renderTime: entry.renderTime,
      size: entry.size,
      url: entry.url
    };
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('lcp_element', lcpDetails);
    }
    
    // Provide optimization suggestions
    this.suggestLCPOptimizations(lcpDetails);
  }
  
  /**
   * Suggest LCP optimizations
   */
  suggestLCPOptimizations(lcpDetails) {
    const suggestions = [];
    
    if (lcpDetails.tagName === 'IMG') {
      if (!lcpDetails.src.includes('webp')) {
        suggestions.push('Consider using WebP format for better compression');
      }
      
      if (lcpDetails.loadTime > 2500) {
        suggestions.push('Image is loading slowly - consider optimizing size or using preload');
      }
    }
    
    if (lcpDetails.loadTime > 2500) {
      suggestions.push('LCP is slower than recommended (2.5s). Consider optimizing critical resources.');
    }
    
    if (suggestions.length > 0) {
      console.groupCollapsed('🚀 LCP Optimization Suggestions');
      suggestions.forEach(suggestion => console.log('•', suggestion));
      console.groupEnd();
    }
  }
  
  /**
   * Observe First Input Delay
   */
  observeFID() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0];
        
        this.metrics.fid = firstEntry.processingStart - firstEntry.startTime;
        this.reportMetric('fid', this.metrics.fid);
        
        // Track interaction details
        this.trackFIDInteraction(firstEntry);
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID monitoring not supported:', e);
    }
  }
  
  /**
   * Track FID interaction details
   */
  trackFIDInteraction(entry) {
    const fidDetails = {
      name: entry.name,
      startTime: entry.startTime,
      processingStart: entry.processingStart,
      processingEnd: entry.processingEnd,
      duration: entry.duration,
      delay: entry.processingStart - entry.startTime
    };
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('fid_interaction', fidDetails);
    }
    
    // Provide optimization suggestions
    if (fidDetails.delay > 100) {
      console.warn(`⚠️ First Input Delay is ${fidDetails.delay.toFixed(2)}ms (should be < 100ms)`);
      console.log('Consider optimizing JavaScript execution or breaking up long tasks');
    }
  }
  
  /**
   * Observe Cumulative Layout Shift
   */
  observeCLS() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries = [];
      
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Only count layout shifts without recent user input
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
            
            // If the entry occurred less than 1 second after the previous entry and
            // less than 5 seconds after the first entry in the session, include it
            if (sessionValue && 
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }
            
            // Update the current CLS value
            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              this.metrics.cls = clsValue;
              this.reportMetric('cls', this.metrics.cls);
            }
          }
          
          // Track layout shift details
          this.trackLayoutShift(entry);
        }
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS monitoring not supported:', e);
    }
  }
  
  /**
   * Track layout shift details
   */
  trackLayoutShift(entry) {
    const shiftDetails = {
      value: entry.value,
      startTime: entry.startTime,
      hadRecentInput: entry.hadRecentInput,
      sources: entry.sources?.map(source => ({
        node: source.node?.tagName,
        currentRect: source.currentRect,
        previousRect: source.previousRect
      })) || []
    };
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('layout_shift', shiftDetails);
    }
    
    // Provide optimization suggestions
    if (entry.value > 0.1 && !entry.hadRecentInput) {
      console.warn(`⚠️ Layout shift detected: ${entry.value.toFixed(4)} (should be < 0.1)`);
      
      if (entry.sources) {
        console.log('Elements causing layout shift:');
        entry.sources.forEach(source => {
          if (source.node) {
            console.log('•', source.node.tagName, source.node.className || source.node.id);
          }
        });
      }
    }
  }
  
  /**
   * Observe First Contentful Paint
   */
  observeFCP() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime;
          this.reportMetric('fcp', this.metrics.fcp);
        }
      });
      
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);
    } catch (e) {
      console.warn('FCP monitoring not supported:', e);
    }
  }
  
  /**
   * Observe Time to First Byte
   */
  observeTTFB() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const navigationObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const navigationEntry = entries[0];
        
        if (navigationEntry) {
          this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
          this.reportMetric('ttfb', this.metrics.ttfb);
          
          // Track navigation timing details
          this.trackNavigationTiming(navigationEntry);
        }
      });
      
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    } catch (e) {
      console.warn('TTFB monitoring not supported:', e);
    }
  }
  
  /**
   * Track navigation timing details
   */
  trackNavigationTiming(entry) {
    const timingDetails = {
      domainLookupTime: entry.domainLookupEnd - entry.domainLookupStart,
      connectionTime: entry.connectEnd - entry.connectStart,
      requestTime: entry.responseStart - entry.requestStart,
      responseTime: entry.responseEnd - entry.responseStart,
      domProcessingTime: entry.domContentLoadedEventStart - entry.responseEnd,
      loadEventTime: entry.loadEventEnd - entry.loadEventStart
    };
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('navigation_timing', timingDetails);
    }
    
    // Provide optimization suggestions
    this.suggestNavigationOptimizations(timingDetails);
  }
  
  /**
   * Suggest navigation optimizations
   */
  suggestNavigationOptimizations(timingDetails) {
    const suggestions = [];
    
    if (timingDetails.domainLookupTime > 100) {
      suggestions.push('DNS lookup is slow - consider using DNS prefetch');
    }
    
    if (timingDetails.connectionTime > 100) {
      suggestions.push('Connection time is slow - consider using preconnect');
    }
    
    if (timingDetails.requestTime > 200) {
      suggestions.push('Server response time is slow - optimize backend performance');
    }
    
    if (timingDetails.domProcessingTime > 1000) {
      suggestions.push('DOM processing is slow - optimize JavaScript and CSS');
    }
    
    if (suggestions.length > 0) {
      console.groupCollapsed('🚀 Navigation Optimization Suggestions');
      suggestions.forEach(suggestion => console.log('•', suggestion));
      console.groupEnd();
    }
  }
  
  /**
   * Setup navigation timing monitoring
   */
  setupNavigationTiming() {
    if (performance.timing) {
      window.addEventListener('load', () => {
        const timing = performance.timing;
        
        this.metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        this.metrics.domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart;
        this.metrics.firstByteTime = timing.responseStart - timing.navigationStart;
        
        this.reportMetric('page_load_time', this.metrics.pageLoadTime);
        this.reportMetric('dom_content_loaded_time', this.metrics.domContentLoadedTime);
        this.reportMetric('first_byte_time', this.metrics.firstByteTime);
      });
    }
  }
  
  /**
   * Setup user experience tracking
   */
  setupUserExperienceTracking() {
    // Track scroll depth
    this.trackScrollDepth();
    
    // Track time on page
    this.trackTimeOnPage();
    
    // Track user interactions
    this.trackUserInteractions();
    
    // Track page visibility
    this.trackPageVisibility();
  }
  
  /**
   * Track scroll depth
   */
  trackScrollDepth() {
    let maxScrollDepth = 0;
    
    const trackScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        this.metrics.scrollDepth = maxScrollDepth;
        
        // Track milestone scroll depths
        if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
          this.reportEvent('scroll_depth_25');
        } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
          this.reportEvent('scroll_depth_50');
        } else if (maxScrollDepth >= 75 && maxScrollDepth < 100) {
          this.reportEvent('scroll_depth_75');
        } else if (maxScrollDepth >= 100) {
          this.reportEvent('scroll_depth_100');
        }
      }
    };
    
    window.addEventListener('scroll', trackScroll, { passive: true });
  }
  
  /**
   * Track time on page
   */
  trackTimeOnPage() {
    const updateTimeOnPage = () => {
      if (this.isPageVisible) {
        this.metrics.timeOnPage = performance.now() - this.startTime;
      }
    };
    
    // Update every 5 seconds
    setInterval(updateTimeOnPage, 5000);
    
    // Update on page unload
    window.addEventListener('beforeunload', () => {
      updateTimeOnPage();
      this.reportMetric('time_on_page', this.metrics.timeOnPage);
    });
  }
  
  /**
   * Track user interactions
   */
  trackUserInteractions() {
    const interactionEvents = ['click', 'scroll', 'keydown', 'touchstart'];
    
    const markInteraction = () => {
      if (!this.hasInteracted) {
        this.hasInteracted = true;
        this.reportEvent('first_interaction');
      }
    };
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, markInteraction, { passive: true, once: true });
    });
  }
  
  /**
   * Track page visibility
   */
  trackPageVisibility() {
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden;
      
      if (document.hidden) {
        this.reportEvent('page_hidden');
      } else {
        this.reportEvent('page_visible');
      }
    });
  }
  
  /**
   * Setup custom theme-specific metrics
   */
  setupCustomMetrics() {
    // Monitor bubble animation performance
    this.monitorBubbleAnimations();
    
    // Monitor optimization scores
    this.monitorOptimizationScores();
    
    // Monitor theme-specific interactions
    this.monitorThemeInteractions();
  }
  
  /**
   * Monitor bubble animation performance
   */
  monitorBubbleAnimations() {
    const bubbles = document.querySelectorAll('.bubble');
    
    if (bubbles.length > 0) {
      let animationFrameCount = 0;
      let animationStartTime = performance.now();
      
      const measureAnimationPerformance = () => {
        animationFrameCount++;
        
        if (animationFrameCount % 60 === 0) { // Every 60 frames (~1 second)
          const currentTime = performance.now();
          const fps = 60000 / (currentTime - animationStartTime);
          
          this.metrics.bubbleAnimationPerformance = fps;
          
          if (fps < 30) {
            console.warn('⚠️ Bubble animations running below 30fps:', fps.toFixed(2));
          }
          
          animationStartTime = currentTime;
        }
        
        requestAnimationFrame(measureAnimationPerformance);
      };
      
      requestAnimationFrame(measureAnimationPerformance);
    }
  }
  
  /**
   * Monitor optimization scores
   */
  monitorOptimizationScores() {
    // Check optimization systems periodically
    setInterval(() => {
      if (window.imageOptimization) {
        const imageReport = window.imageOptimization.getPerformanceReport();
        this.metrics.imageOptimizationScore = imageReport.successRate;
      }
      
      if (window.cssOptimization) {
        const cssReport = window.cssOptimization.getPerformanceReport();
        this.metrics.cssOptimizationScore = cssReport.optimizationScore;
      }
      
      if (window.jsOptimization) {
        const jsReport = window.jsOptimization.getPerformanceReport();
        this.metrics.jsOptimizationScore = jsReport.optimizationScore;
      }
    }, 10000); // Every 10 seconds
  }
  
  /**
   * Monitor theme-specific interactions
   */
  monitorThemeInteractions() {
    // Track bubble interactions
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('bubble')) {
        this.reportEvent('bubble_interaction');
      }
    });
    
    // Track gradient section views
    if ('IntersectionObserver' in window) {
      const gradientSections = document.querySelectorAll('.gradient-bg, .bubbly-section');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.reportEvent('gradient_section_view', {
              sectionId: entry.target.id,
              sectionClass: entry.target.className
            });
          }
        });
      }, { threshold: 0.5 });
      
      gradientSections.forEach(section => observer.observe(section));
    }
  }
  
  /**
   * Setup reporting
   */
  setupReporting() {
    // Report metrics periodically
    setInterval(() => {
      this.reportAllMetrics();
    }, 30000); // Every 30 seconds
    
    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.reportAllMetrics();
    });
    
    // Report on page hide (for mobile)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.reportAllMetrics();
      }
    });
  }
  
  /**
   * Report individual metric
   */
  reportMetric(name, value) {
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('performance_metric', {
        metric: name,
        value: value,
        timestamp: performance.now()
      });
    }
    
    // Track with Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value)
      });
    }
    
    // Log to console in development
    if (this.isDevelopment()) {
      console.log(`📊 ${name}: ${value.toFixed(2)}ms`);
    }
  }
  
  /**
   * Report event
   */
  reportEvent(eventName, data = {}) {
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent(eventName, {
        ...data,
        timestamp: performance.now()
      });
    }
    
    // Track with Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: 'User Experience',
        ...data
      });
    }
  }
  
  /**
   * Report all metrics
   */
  reportAllMetrics() {
    const report = {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: this.getConnectionInfo()
    };
    
    // Track with AI Navigation
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('performance_report', report);
    }
    
    // Log comprehensive report in development
    if (this.isDevelopment()) {
      this.logPerformanceReport(report);
    }
  }
  
  /**
   * Get connection information
   */
  getConnectionInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }
  
  /**
   * Check if in development mode
   */
  isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname.includes('myshopify.com') ||
           window.Shopify?.designMode;
  }
  
  /**
   * Log performance report
   */
  logPerformanceReport(report) {
    console.groupCollapsed('📊 Performance Report');
    
    // Core Web Vitals
    console.group('🎯 Core Web Vitals');
    console.log(`LCP: ${report.lcp ? report.lcp.toFixed(2) + 'ms' : 'Not measured'} (Good: < 2500ms)`);
    console.log(`FID: ${report.fid ? report.fid.toFixed(2) + 'ms' : 'Not measured'} (Good: < 100ms)`);
    console.log(`CLS: ${report.cls ? report.cls.toFixed(4) : 'Not measured'} (Good: < 0.1)`);
    console.groupEnd();
    
    // Additional metrics
    console.group('📈 Additional Metrics');
    console.log(`FCP: ${report.fcp ? report.fcp.toFixed(2) + 'ms' : 'Not measured'}`);
    console.log(`TTFB: ${report.ttfb ? report.ttfb.toFixed(2) + 'ms' : 'Not measured'}`);
    console.log(`Page Load: ${report.pageLoadTime ? report.pageLoadTime.toFixed(2) + 'ms' : 'Not measured'}`);
    console.groupEnd();
    
    // User experience
    console.group('👤 User Experience');
    console.log(`Scroll Depth: ${report.scrollDepth}%`);
    console.log(`Time on Page: ${report.timeOnPage ? (report.timeOnPage / 1000).toFixed(2) + 's' : 'Not measured'}`);
    console.log(`Has Interacted: ${this.hasInteracted}`);
    console.groupEnd();
    
    // Theme-specific metrics
    console.group('🎨 Theme Metrics');
    console.log(`Bubble Animation FPS: ${report.bubbleAnimationPerformance ? report.bubbleAnimationPerformance.toFixed(2) : 'Not measured'}`);
    console.log(`Image Optimization: ${report.imageOptimizationScore ? report.imageOptimizationScore + '%' : 'Not measured'}`);
    console.log(`CSS Optimization: ${report.cssOptimizationScore ? report.cssOptimizationScore + '%' : 'Not measured'}`);
    console.log(`JS Optimization: ${report.jsOptimizationScore ? report.jsOptimizationScore + '%' : 'Not measured'}`);
    console.groupEnd();
    
    console.groupEnd();
  }
  
  /**
   * Get current metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }
  
  /**
   * Get performance score
   */
  getPerformanceScore() {
    let score = 100;
    
    // Core Web Vitals scoring
    if (this.metrics.lcp) {
      if (this.metrics.lcp > 4000) score -= 30;
      else if (this.metrics.lcp > 2500) score -= 15;
    }
    
    if (this.metrics.fid) {
      if (this.metrics.fid > 300) score -= 25;
      else if (this.metrics.fid > 100) score -= 10;
    }
    
    if (this.metrics.cls) {
      if (this.metrics.cls > 0.25) score -= 25;
      else if (this.metrics.cls > 0.1) score -= 10;
    }
    
    // Additional metrics
    if (this.metrics.fcp) {
      if (this.metrics.fcp > 3000) score -= 10;
      else if (this.metrics.fcp > 1800) score -= 5;
    }
    
    // Theme-specific scoring
    if (this.metrics.bubbleAnimationPerformance && this.metrics.bubbleAnimationPerformance < 30) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Initialize performance monitoring when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor();
  });
} else {
  window.performanceMonitor = new PerformanceMonitor();
}

// Export for external use
window.PerformanceMonitor = PerformanceMonitor; 