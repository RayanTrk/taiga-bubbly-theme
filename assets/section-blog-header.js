/**
 * Blog Header Section JavaScript
 * Handles parallax effects, animations, and interactive elements
 * Follows Bubbly design principles from shopirule.mdc
 */

class BlogHeaderManager {
  constructor() {
    this.blogHeader = document.querySelector('[data-blog-header]');
    this.parallaxEnabled = this.blogHeader?.dataset.parallax === 'true';
    this.parallaxImage = this.blogHeader?.querySelector('[data-parallax-image]');
    this.parallaxContainer = this.blogHeader?.querySelector('[data-parallax-container]');
    
    // Performance tracking
    this.isScrolling = false;
    this.ticking = false;
    
    // AI Navigation integration
    this.aiNavigation = window.AiNavigation || null;
    
    this.init();
  }
  
  init() {
    if (!this.blogHeader) return;
    
    this.setupParallax();
    this.setupAnimations();
    this.setupAccessibility();
    this.setupAINavigation();
    this.setupPerformanceOptimizations();
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onReady());
    } else {
      this.onReady();
    }
  }
  
  onReady() {
    this.animateIn();
    this.trackInteractions();
  }
  
  setupParallax() {
    if (!this.parallaxEnabled || !this.parallaxImage) return;
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    this.handleParallaxScroll = this.throttle(() => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateParallax();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, 16); // ~60fps
    
    window.addEventListener('scroll', this.handleParallaxScroll, { passive: true });
    
    // Initial parallax position
    this.updateParallax();
  }
  
  updateParallax() {
    if (!this.parallaxImage || !this.parallaxContainer) return;
    
    const rect = this.parallaxContainer.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Only calculate parallax when element is in viewport
    if (rect.bottom >= 0 && rect.top <= windowHeight) {
      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.5;
      const yPos = scrolled * parallaxSpeed;
      
      this.parallaxImage.style.transform = `translate3d(0, ${yPos}px, 0) scale(1.1)`;
    }
  }
  
  setupAnimations() {
    // Animate elements on scroll into view
    const animatedElements = this.blogHeader.querySelectorAll(
      '.blog-header__title, .blog-header__description, .blog-header__tags, .blog-header__breadcrumbs'
    );
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);
    
    animatedElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(2rem)';
      element.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(element);
    });
    
    // Animate decorative bubbles
    this.animateBubbles();
  }
  
  animateBubbles() {
    const bubbles = this.blogHeader.querySelectorAll('.blog-header__bubble');
    
    bubbles.forEach((bubble, index) => {
      // Add random animation delays and durations for organic movement
      const delay = Math.random() * 2;
      const duration = 6 + Math.random() * 4;
      
      bubble.style.animationDelay = `${delay}s`;
      bubble.style.animationDuration = `${duration}s`;
      
      // Add mouse interaction
      bubble.addEventListener('mouseenter', () => {
        bubble.style.animationPlayState = 'paused';
        bubble.style.transform = 'scale(1.1)';
      });
      
      bubble.addEventListener('mouseleave', () => {
        bubble.style.animationPlayState = 'running';
        bubble.style.transform = 'scale(1)';
      });
    });
  }
  
  animateIn() {
    this.blogHeader.style.opacity = '1';
    this.blogHeader.style.transform = 'translateY(0)';
    
    // Stagger animation of child elements
    const elements = this.blogHeader.querySelectorAll(
      '.blog-header__breadcrumbs, .blog-header__title, .blog-header__description, .blog-header__tags'
    );
    
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }
  
  setupAccessibility() {
    // Ensure proper focus management
    const focusableElements = this.blogHeader.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
      element.addEventListener('focus', this.handleFocus.bind(this));
      element.addEventListener('blur', this.handleBlur.bind(this));
    });
    
    // Add keyboard navigation for tags
    const tags = this.blogHeader.querySelectorAll('.blog-header__tag');
    tags.forEach(tag => {
      tag.addEventListener('keydown', this.handleTagKeydown.bind(this));
    });
  }
  
  handleFocus(event) {
    event.target.style.outline = '2px solid rgba(102, 126, 234, 0.8)';
    event.target.style.outlineOffset = '2px';
  }
  
  handleBlur(event) {
    event.target.style.outline = '';
    event.target.style.outlineOffset = '';
  }
  
  handleTagKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.target.click();
    }
  }
  
  setupAINavigation() {
    if (!this.aiNavigation) return;
    
    // Track blog header interactions
    const trackableElements = this.blogHeader.querySelectorAll(
      '.blog-header__tag, .breadcrumbs__link'
    );
    
    trackableElements.forEach(element => {
      element.addEventListener('click', (event) => {
        this.aiNavigation.trackInteraction({
          type: 'blog_header_navigation',
          element: event.target.tagName.toLowerCase(),
          text: event.target.textContent.trim(),
          href: event.target.href || null,
          timestamp: Date.now(),
          section: 'blog_header'
        });
      });
    });
    
    // Track scroll depth for engagement
    this.trackScrollDepth();
  }
  
  trackScrollDepth() {
    if (!this.aiNavigation) return;
    
    let maxScrollDepth = 0;
    const trackingThresholds = [25, 50, 75, 100];
    const trackedThresholds = new Set();
    
    const handleScroll = this.throttle(() => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);
      
      maxScrollDepth = Math.max(maxScrollDepth, scrollPercentage);
      
      trackingThresholds.forEach(threshold => {
        if (scrollPercentage >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          this.aiNavigation.trackInteraction({
            type: 'scroll_depth',
            depth: threshold,
            section: 'blog_header',
            timestamp: Date.now()
          });
        }
      });
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  trackInteractions() {
    // Track time spent on blog header
    const startTime = Date.now();
    
    // Track when user leaves the page
    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - startTime;
      
      if (this.aiNavigation && timeSpent > 1000) { // Only track if more than 1 second
        this.aiNavigation.trackInteraction({
          type: 'time_on_blog_header',
          duration: timeSpent,
          timestamp: Date.now(),
          section: 'blog_header'
        });
      }
    });
  }
  
  setupPerformanceOptimizations() {
    // Intersection Observer for performance
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.blogHeader.classList.add('blog-header--visible');
        } else {
          this.blogHeader.classList.remove('blog-header--visible');
        }
      });
    }, {
      threshold: 0.1
    });
    
    observer.observe(this.blogHeader);
    
    // Debounce resize events
    window.addEventListener('resize', this.throttle(() => {
      this.handleResize();
    }, 250));
  }
  
  handleResize() {
    // Recalculate parallax on resize
    if (this.parallaxEnabled) {
      this.updateParallax();
    }
  }
  
  // Utility functions
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // Cleanup method
  destroy() {
    if (this.handleParallaxScroll) {
      window.removeEventListener('scroll', this.handleParallaxScroll);
    }
    
    // Remove event listeners
    const focusableElements = this.blogHeader?.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements?.forEach(element => {
      element.removeEventListener('focus', this.handleFocus);
      element.removeEventListener('blur', this.handleBlur);
    });
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new BlogHeaderManager();
});

// Handle Shopify section reloads
document.addEventListener('shopify:section:load', (event) => {
  if (event.target.querySelector('[data-blog-header]')) {
    new BlogHeaderManager();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlogHeaderManager;
} 