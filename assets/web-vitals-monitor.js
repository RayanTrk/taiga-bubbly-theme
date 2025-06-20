/**
 * Core Web Vitals Monitoring System for Shopify Taiga Theme (Bubbly Design)
 * Monitors and reports real user performance metrics in production
 * Compatible with Google Analytics 4, Google Tag Manager, and custom analytics
 */

class WebVitalsMonitor {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      debug: false,
      reportToGA4: true,
      reportToGTM: true,
      reportToCustom: false,
      customEndpoint: null,
      sampleRate: 1.0, // Report 100% of sessions by default
      thresholds: {
        // Core Web Vitals thresholds (Google recommended)
        lcp: { good: 2500, poor: 4000 },
        fid: { good: 100, poor: 300 },
        cls: { good: 0.1, poor: 0.25 },
        // Additional metrics
        fcp: { good: 1800, poor: 3000 },
        ttfb: { good: 800, poor: 1800 },
        inp: { good: 200, poor: 500 }
      },
      ...config
    };

    this.metrics = new Map();
    this.sessionData = {
      id: this.generateSessionId(),
      startTime: performance.now(),
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      viewport: this.getViewportInfo(),
      theme: 'taiga-bubbly',
      version: '1.0.0'
    };

    this.observers = new Map();
    this.reportQueue = [];
    this.isReporting = false;

    this.init();
  }

  /**
   * Initialize Web Vitals monitoring
   */
  async init() {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return;
    }

    try {
      this.log('Initializing Web Vitals monitoring...');
      
      // Load web-vitals library if not already loaded
      await this.loadWebVitalsLibrary();
      
      // Set up Core Web Vitals monitoring
      this.setupCoreWebVitals();
      
      // Set up additional performance monitoring
      this.setupAdditionalMetrics();
      
      // Set up reporting
      this.setupReporting();
      
      // Monitor page lifecycle
      this.setupPageLifecycle();
      
      this.log('Web Vitals monitoring initialized');
      
    } catch (error) {
      console.error('Web Vitals monitoring initialization failed:', error);
    }
  }

  /**
   * Load web-vitals library
   */
  async loadWebVitalsLibrary() {
    if (window.webVitals) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
      script.onload = () => {
        this.log('Web Vitals library loaded');
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load web-vitals library'));
      document.head.appendChild(script);
    });
  }

  /**
   * Set up Core Web Vitals monitoring
   */
  setupCoreWebVitals() {
    if (!window.webVitals) {
      this.log('Web Vitals library not available, using fallback methods');
      this.setupFallbackMetrics();
      return;
    }

    const { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } = window.webVitals;

    // Largest Contentful Paint
    getLCP((metric) => {
      this.recordMetric('LCP', metric);
    });

    // First Input Delay
    getFID((metric) => {
      this.recordMetric('FID', metric);
    });

    // Cumulative Layout Shift
    getCLS((metric) => {
      this.recordMetric('CLS', metric);
    });

    // First Contentful Paint
    getFCP((metric) => {
      this.recordMetric('FCP', metric);
    });

    // Time to First Byte
    getTTFB((metric) => {
      this.recordMetric('TTFB', metric);
    });

    // Interaction to Next Paint (Chrome 96+)
    if (getINP) {
      getINP((metric) => {
        this.recordMetric('INP', metric);
      });
    }

    this.log('Core Web Vitals monitoring set up');
  }

  /**
   * Set up fallback metrics for when web-vitals library is not available
   */
  setupFallbackMetrics() {
    // Fallback LCP using PerformanceObserver
    this.observeLCP();
    
    // Fallback FID using event timing
    this.observeFID();
    
    // Fallback CLS using layout shift observer
    this.observeCLS();
    
    // Navigation timing metrics
    this.observeNavigationTiming();
  }

  /**
   * Observe Largest Contentful Paint (fallback)
   */
  observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          this.recordMetric('LCP', {
            name: 'LCP',
            value: lastEntry.startTime,
            delta: lastEntry.startTime,
            id: this.generateMetricId(),
            entries: [lastEntry]
          });
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.set('lcp', observer);
    } catch (error) {
      this.log('LCP observer setup failed:', error);
    }
  }

  /**
   * Observe First Input Delay (fallback)
   */
  observeFID() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            
            this.recordMetric('FID', {
              name: 'FID',
              value: fid,
              delta: fid,
              id: this.generateMetricId(),
              entries: [entry]
            });
            
            // Only report the first input delay
            break;
          }
        }
      });

      observer.observe({ type: 'first-input', buffered: true });
      this.observers.set('fid', observer);
    } catch (error) {
      this.log('FID observer setup failed:', error);
    }
  }

  /**
   * Observe Cumulative Layout Shift (fallback)
   */
  observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries = [];

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
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

            // If the current session value is larger than the current CLS value,
            // update CLS and the entries contributing to it.
            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              
              this.recordMetric('CLS', {
                name: 'CLS',
                value: clsValue,
                delta: clsValue,
                id: this.generateMetricId(),
                entries: sessionEntries
              });
            }
          }
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.set('cls', observer);
    } catch (error) {
      this.log('CLS observer setup failed:', error);
    }
  }

  /**
   * Observe navigation timing metrics
   */
  observeNavigationTiming() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      
      if (navigation) {
        // Time to First Byte
        const ttfb = navigation.responseStart - navigation.requestStart;
        this.recordMetric('TTFB', {
          name: 'TTFB',
          value: ttfb,
          delta: ttfb,
          id: this.generateMetricId(),
          entries: [navigation]
        });

        // First Contentful Paint (from paint timing)
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          this.recordMetric('FCP', {
            name: 'FCP',
            value: fcpEntry.startTime,
            delta: fcpEntry.startTime,
            id: this.generateMetricId(),
            entries: [fcpEntry]
          });
        }
      }
    });
  }

  /**
   * Set up additional performance metrics
   */
  setupAdditionalMetrics() {
    // Monitor resource loading
    this.monitorResourceLoading();
    
    // Monitor JavaScript errors
    this.monitorJavaScriptErrors();
    
    // Monitor long tasks
    this.monitorLongTasks();
    
    // Monitor memory usage (if available)
    this.monitorMemoryUsage();
  }

  /**
   * Monitor resource loading performance
   */
  monitorResourceLoading() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          if (entry.duration > 1000) { // Resources taking more than 1 second
            this.recordCustomMetric('slow-resource', {
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize || 0,
              type: this.getResourceType(entry.name)
            });
          }
        }
      });

      observer.observe({ type: 'resource', buffered: true });
      this.observers.set('resource', observer);
    } catch (error) {
      this.log('Resource observer setup failed:', error);
    }
  }

  /**
   * Monitor JavaScript errors
   */
  monitorJavaScriptErrors() {
    window.addEventListener('error', (event) => {
      this.recordCustomMetric('javascript-error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordCustomMetric('unhandled-promise-rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });
  }

  /**
   * Monitor long tasks
   */
  monitorLongTasks() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          this.recordCustomMetric('long-task', {
            duration: entry.duration,
            startTime: entry.startTime,
            attribution: entry.attribution
          });
        }
      });

      observer.observe({ type: 'longtask', buffered: true });
      this.observers.set('longtask', observer);
    } catch (error) {
      this.log('Long task observer setup failed:', error);
    }
  }

  /**
   * Monitor memory usage (Chrome only)
   */
  monitorMemoryUsage() {
    if (!('memory' in performance)) return;

    setInterval(() => {
      const memory = performance.memory;
      
      this.recordCustomMetric('memory-usage', {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Record a Core Web Vital metric
   */
  recordMetric(name, metric) {
    const rating = this.getRating(name, metric.value);
    const metricData = {
      ...metric,
      name,
      rating,
      timestamp: Date.now(),
      sessionId: this.sessionData.id,
      page: {
        url: location.href,
        path: location.pathname,
        title: document.title,
        template: this.getShopifyTemplate()
      },
      device: this.getDeviceInfo(),
      connection: this.getConnectionInfo()
    };

    this.metrics.set(name, metricData);
    this.queueReport(metricData);
    
    this.log(`${name} recorded:`, metric.value, rating);
  }

  /**
   * Record a custom metric
   */
  recordCustomMetric(name, data) {
    const metricData = {
      name,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionData.id,
      page: {
        url: location.href,
        path: location.pathname,
        title: document.title
      }
    };

    this.queueReport(metricData);
    this.log(`Custom metric recorded: ${name}`, data);
  }

  /**
   * Get performance rating for a metric
   */
  getRating(metricName, value) {
    const thresholds = this.config.thresholds[metricName.toLowerCase()];
    if (!thresholds) return 'unknown';

    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Set up reporting mechanisms
   */
  setupReporting() {
    // Report when page is hidden (user navigates away)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushReports();
      }
    });

    // Report before page unload
    window.addEventListener('beforeunload', () => {
      this.flushReports();
    });

    // Periodic reporting
    setInterval(() => {
      this.flushReports();
    }, 30000); // Every 30 seconds
  }

  /**
   * Set up page lifecycle monitoring
   */
  setupPageLifecycle() {
    // Track page load complete
    window.addEventListener('load', () => {
      this.recordCustomMetric('page-load-complete', {
        loadTime: performance.now(),
        domContentLoaded: this.getDOMContentLoadedTime(),
        resources: performance.getEntriesByType('resource').length
      });
    });

    // Track user engagement
    let engagementTime = 0;
    let isVisible = true;
    let lastVisibilityChange = Date.now();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        isVisible = true;
        lastVisibilityChange = Date.now();
      } else {
        if (isVisible) {
          engagementTime += Date.now() - lastVisibilityChange;
        }
        isVisible = false;
        
        this.recordCustomMetric('user-engagement', {
          totalEngagementTime: engagementTime,
          visibilityState: document.visibilityState
        });
      }
    });
  }

  /**
   * Queue a report for sending
   */
  queueReport(data) {
    this.reportQueue.push(data);
    
    // Auto-flush if queue gets too large
    if (this.reportQueue.length >= 10) {
      this.flushReports();
    }
  }

  /**
   * Flush all queued reports
   */
  async flushReports() {
    if (this.reportQueue.length === 0 || this.isReporting) return;

    this.isReporting = true;
    const reports = [...this.reportQueue];
    this.reportQueue = [];

    try {
      // Send to Google Analytics 4
      if (this.config.reportToGA4) {
        await this.sendToGA4(reports);
      }

      // Send to Google Tag Manager
      if (this.config.reportToGTM) {
        await this.sendToGTM(reports);
      }

      // Send to custom endpoint
      if (this.config.reportToCustom && this.config.customEndpoint) {
        await this.sendToCustomEndpoint(reports);
      }

      this.log(`Flushed ${reports.length} reports`);
      
    } catch (error) {
      console.error('Failed to flush reports:', error);
      // Re-queue failed reports
      this.reportQueue.unshift(...reports);
    } finally {
      this.isReporting = false;
    }
  }

  /**
   * Send reports to Google Analytics 4
   */
  async sendToGA4(reports) {
    if (typeof gtag === 'undefined') return;

    for (const report of reports) {
      if (report.name && ['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP'].includes(report.name)) {
        gtag('event', report.name, {
          event_category: 'Web Vitals',
          event_label: report.rating,
          value: Math.round(report.value),
          custom_map: {
            metric_id: report.id,
            metric_value: report.value,
            metric_delta: report.delta
          }
        });
      }
    }
  }

  /**
   * Send reports to Google Tag Manager
   */
  async sendToGTM(reports) {
    if (typeof dataLayer === 'undefined') return;

    for (const report of reports) {
      dataLayer.push({
        event: 'web_vitals_measurement',
        metric_name: report.name,
        metric_value: report.value,
        metric_rating: report.rating,
        metric_id: report.id,
        page_path: report.page?.path,
        device_type: report.device?.type
      });
    }
  }

  /**
   * Send reports to custom endpoint
   */
  async sendToCustomEndpoint(reports) {
    try {
      const response = await fetch(this.config.customEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reports,
          session: this.sessionData,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Custom endpoint reporting failed: ${error.message}`);
    }
  }

  /**
   * Utility functions
   */
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  generateMetricId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getShopifyTemplate() {
    const bodyClasses = document.body.className;
    if (bodyClasses.includes('template-product')) return 'product';
    if (bodyClasses.includes('template-collection')) return 'collection';
    if (bodyClasses.includes('template-index')) return 'index';
    return 'unknown';
  }

  getDeviceInfo() {
    return {
      type: this.isMobile() ? 'mobile' : this.isTablet() ? 'tablet' : 'desktop',
      userAgent: navigator.userAgent,
      viewport: this.getViewportInfo()
    };
  }

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

  getViewportInfo() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  getResourceType(url) {
    if (url.includes('.css')) return 'css';
    if (url.includes('.js')) return 'js';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    return 'other';
  }

  getDOMContentLoadedTime() {
    const navigation = performance.getEntriesByType('navigation')[0];
    return navigation ? navigation.domContentLoadedEventEnd - navigation.navigationStart : 0;
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  isTablet() {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  }

  log(...args) {
    if (this.config.debug) {
      console.log('[Web Vitals Monitor]', ...args);
    }
  }

  /**
   * Public API methods
   */
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  getSessionData() {
    return { ...this.sessionData };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  destroy() {
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Flush remaining reports
    this.flushReports();
  }
}

// Initialize Web Vitals monitoring
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.TaigaWebVitalsMonitor = new WebVitalsMonitor();
  });
} else {
  window.TaigaWebVitalsMonitor = new WebVitalsMonitor();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebVitalsMonitor;
} 