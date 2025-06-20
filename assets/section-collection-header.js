/**
 * Collection Header Component - Bubbly Theme
 * Handles parallax effects, animations, and AI Navigation integration
 */

class CollectionHeaderManager {
  constructor(element) {
    this.element = element;
    this.image = element.querySelector('.collection-header__image');
    this.decorations = element.querySelector('.collection-header__decorations');
    this.isParallaxEnabled = element.hasAttribute('data-parallax');
    this.isVisible = false;
    
    // Performance optimization
    this.rafId = null;
    this.lastScrollY = 0;
    this.ticking = false;
    
    // AI Navigation integration
    this.aiNavigation = window.AINavigation || null;
    
    this.init();
  }
  
  init() {
    this.setupIntersectionObserver();
    
    if (this.isParallaxEnabled && this.image) {
      this.setupParallax();
    }
    
    this.setupAnimations();
    this.trackInteractions();
    
    // Initialize accessibility features
    this.setupAccessibility();
    
    console.log('Collection Header initialized');
  }
  
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        
        if (entry.isIntersecting) {
          this.element.classList.add('collection-header--visible');
          this.startAnimations();
          
          // AI Navigation: Track header view
          this.trackAIEvent('collection_header_viewed', {
            collection: this.getCollectionData(),
            visibility_ratio: entry.intersectionRatio
          });
        } else {
          this.element.classList.remove('collection-header--visible');
          this.stopAnimations();
        }
      });
    }, options);
    
    this.observer.observe(this.element);
  }
  
  setupParallax() {
    if (!this.image || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    const handleScroll = () => {
      if (!this.isVisible) return;
      
      const scrollY = window.pageYOffset;
      const rate = scrollY * -0.5;
      
      if (this.image) {
        this.image.style.transform = `scale(1.1) translate3d(0, ${rate}px, 0)`;
      }
      
      // Parallax decorative elements
      if (this.decorations) {
        const bubbles = this.decorations.querySelectorAll('.floating-bubble');
        bubbles.forEach((bubble, index) => {
          const speed = 0.2 + (index * 0.1);
          const yPos = scrollY * speed;
          bubble.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
      }
      
      this.ticking = false;
    };
    
    const requestScrollUpdate = () => {
      if (!this.ticking) {
        this.rafId = requestAnimationFrame(handleScroll);
        this.ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    
    // Store cleanup function
    this.cleanupParallax = () => {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      window.removeEventListener('scroll', requestScrollUpdate);
    };
  }
  
  setupAnimations() {
    // Staggered animation for content elements
    const animatedElements = this.element.querySelectorAll([
      '.collection-header__breadcrumbs',
      '.collection-header__title',
      '.collection-header__description',
      '.collection-header__count'
    ].join(','));
    
    animatedElements.forEach((element, index) => {
      if (element) {
        element.style.animationDelay = `${0.2 + (index * 0.1)}s`;
      }
    });
    
    // Initialize floating bubbles animation
    this.initializeBubbleAnimations();
  }
  
  initializeBubbleAnimations() {
    if (!this.decorations || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    const bubbles = this.decorations.querySelectorAll('.floating-bubble');
    
    bubbles.forEach((bubble, index) => {
      // Randomize animation properties
      const duration = 6 + Math.random() * 4; // 6-10s
      const delay = Math.random() * 2; // 0-2s
      
      bubble.style.animationDuration = `${duration}s`;
      bubble.style.animationDelay = `${delay}s`;
      
      // Add mouse interaction
      bubble.addEventListener('mouseenter', () => {
        bubble.style.animationPlayState = 'paused';
        bubble.style.transform += ' scale(1.1)';
      });
      
      bubble.addEventListener('mouseleave', () => {
        bubble.style.animationPlayState = 'running';
        bubble.style.transform = bubble.style.transform.replace(' scale(1.1)', '');
      });
    });
  }
  
  startAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    const bubbles = this.decorations?.querySelectorAll('.floating-bubble') || [];
    bubbles.forEach(bubble => {
      bubble.style.animationPlayState = 'running';
    });
  }
  
  stopAnimations() {
    const bubbles = this.decorations?.querySelectorAll('.floating-bubble') || [];
    bubbles.forEach(bubble => {
      bubble.style.animationPlayState = 'paused';
    });
  }
  
  setupAccessibility() {
    // Ensure proper focus management
    const focusableElements = this.element.querySelectorAll([
      'a[href]',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(','));
    
    // Add skip link for screen readers
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    this.element.insertBefore(skipLink, this.element.firstChild);
    
    // Announce collection information to screen readers
    this.announceCollectionInfo();
  }
  
  announceCollectionInfo() {
    const title = this.element.querySelector('.collection-header__title');
    const description = this.element.querySelector('.collection-header__description');
    const count = this.element.querySelector('.collection-header__count-text');
    
    if (title) {
      title.setAttribute('aria-label', `Collection: ${title.textContent.trim()}`);
    }
    
    if (description) {
      description.setAttribute('aria-label', `Description: ${description.textContent.trim()}`);
    }
    
    if (count) {
      count.setAttribute('aria-live', 'polite');
      count.setAttribute('aria-label', `Product count: ${count.textContent.trim()}`);
    }
  }
  
  trackInteractions() {
    // Track breadcrumb clicks
    const breadcrumbLinks = this.element.querySelectorAll('.breadcrumbs__link');
    breadcrumbLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this.trackAIEvent('breadcrumb_clicked', {
          url: link.href,
          text: link.textContent.trim(),
          collection: this.getCollectionData()
        });
      });
    });
    
    // Track scroll depth
    this.trackScrollDepth();
  }
  
  trackScrollDepth() {
    let maxScrollDepth = 0;
    const headerHeight = this.element.offsetHeight;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const scrollDepth = Math.min(100, Math.round((scrollTop / headerHeight) * 100));
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track significant scroll milestones
        if ([25, 50, 75, 100].includes(scrollDepth)) {
          this.trackAIEvent('header_scroll_depth', {
            depth: scrollDepth,
            collection: this.getCollectionData()
          });
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  getCollectionData() {
    const title = this.element.querySelector('.collection-header__title')?.textContent.trim();
    const countElement = this.element.querySelector('.collection-header__count-text');
    const count = countElement ? parseInt(countElement.textContent.match(/\d+/)?.[0] || '0') : 0;
    
    return {
      title: title || 'Unknown Collection',
      product_count: count,
      has_image: !!this.image,
      has_description: !!this.element.querySelector('.collection-header__description')
    };
  }
  
  trackAIEvent(eventName, data = {}) {
    if (this.aiNavigation && typeof this.aiNavigation.trackEvent === 'function') {
      this.aiNavigation.trackEvent(eventName, {
        ...data,
        component: 'collection_header',
        timestamp: Date.now(),
        page_type: 'collection',
        url: window.location.href
      });
    }
    
    // Fallback to dataLayer if available
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        component: 'collection_header',
        ...data
      });
    }
  }
  
  // Performance monitoring
  measurePerformance() {
    if (window.performance && window.performance.mark) {
      window.performance.mark('collection-header-start');
      
      requestAnimationFrame(() => {
        window.performance.mark('collection-header-end');
        window.performance.measure(
          'collection-header-render',
          'collection-header-start',
          'collection-header-end'
        );
        
        const measure = window.performance.getEntriesByName('collection-header-render')[0];
        if (measure && measure.duration > 100) {
          console.warn(`Collection header render took ${measure.duration.toFixed(2)}ms`);
        }
      });
    }
  }
  
  // Cleanup method
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.cleanupParallax) {
      this.cleanupParallax();
    }
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

// Initialize collection headers
document.addEventListener('DOMContentLoaded', () => {
  const collectionHeaders = document.querySelectorAll('[data-collection-header]');
  
  collectionHeaders.forEach(header => {
    try {
      new CollectionHeaderManager(header);
    } catch (error) {
      console.error('Failed to initialize collection header:', error);
    }
  });
});

// Handle dynamic content loading
if (window.theme && window.theme.initializeCollectionHeader) {
  window.theme.initializeCollectionHeader = (element) => {
    if (element && element.hasAttribute('data-collection-header')) {
      new CollectionHeaderManager(element);
    }
  };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CollectionHeaderManager;
} 