/**
 * Rich Text with Image Section - Bubbly Style
 * Handles parallax effects, animations, and AI Navigation integration
 */

class RichTextWithImageSection {
  constructor(container) {
    this.container = container;
    this.imageContainer = container.querySelector('[data-image-container]');
    this.parallaxImage = container.querySelector('[data-parallax-image]');
    this.decorativeElements = container.querySelector('[data-decorative-elements]');
    this.contentElements = container.querySelectorAll('[data-aos]');
    this.buttons = container.querySelectorAll('.button');
    
    this.isParallaxEnabled = container.dataset.parallax === 'true';
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.rafId = null;
    this.ticking = false;
    
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupParallax();
    this.setupImageHoverEffects();
    this.setupButtonEffects();
    this.setupKeyboardNavigation();
    this.setupAINavigation();
    
    // Performance optimization
    this.setupPerformanceOptimizations();
    
    console.log('Rich Text with Image section initialized');
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    const observerOptions = {
      root: null,
      rootMargin: '50px 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleIntersection(entry);
        }
      });
    }, observerOptions);

    // Observe main container and content elements
    this.observer.observe(this.container);
    this.contentElements.forEach(element => {
      this.observer.observe(element);
    });
  }

  handleIntersection(entry) {
    const element = entry.target;
    const intersectionRatio = entry.intersectionRatio;

    if (element === this.container) {
      // Track section visibility for AI Navigation
      this.trackSectionView(intersectionRatio);
    } else {
      // Handle content element animations
      this.animateContentElement(element, intersectionRatio);
    }
  }

  trackSectionView(intersectionRatio) {
    if (typeof window.aiNavigation !== 'undefined' && intersectionRatio > 0.5) {
      window.aiNavigation.trackEvent('rich_text_section_viewed', {
        section_id: this.container.closest('section')?.id || 'unknown',
        layout: this.container.dataset.layout,
        has_image: !!this.imageContainer,
        has_parallax: this.isParallaxEnabled,
        timestamp: Date.now(),
        viewport_ratio: intersectionRatio
      });
    }
  }

  animateContentElement(element, intersectionRatio) {
    if (this.isReducedMotion) return;

    const animationType = element.dataset.aos;
    const delay = parseInt(element.dataset.aosDelay) || 0;

    if (intersectionRatio > 0.3) {
      setTimeout(() => {
        element.style.transform = this.getAnimationTransform(animationType, 1);
        element.style.opacity = '1';
      }, delay);
    }
  }

  getAnimationTransform(animationType, progress) {
    switch (animationType) {
      case 'fade-up':
        return `translateY(${20 * (1 - progress)}px)`;
      case 'fade-left':
        return `translateX(${20 * (1 - progress)}px)`;
      case 'fade-right':
        return `translateX(${-20 * (1 - progress)}px)`;
      case 'zoom-in':
        return `scale(${0.9 + 0.1 * progress})`;
      default:
        return 'none';
    }
  }

  setupParallax() {
    if (!this.isParallaxEnabled || !this.parallaxImage || this.isReducedMotion) return;

    const handleScroll = () => {
      if (!this.ticking) {
        this.rafId = requestAnimationFrame(() => {
          this.updateParallax();
          this.ticking = false;
        });
        this.ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup function
    this.cleanupFunctions = this.cleanupFunctions || [];
    this.cleanupFunctions.push(() => {
      window.removeEventListener('scroll', handleScroll);
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
    });
  }

  updateParallax() {
    const rect = this.container.getBoundingClientRect();
    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.5;
    
    if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
      const yPos = -(scrolled * parallaxSpeed);
      this.parallaxImage.style.transform = `translate3d(0, ${yPos}px, 0)`;
      
      // Update decorative elements with different speeds
      if (this.decorativeElements) {
        const bubbles = this.decorativeElements.querySelectorAll('.floating-bubble');
        const shapes = this.decorativeElements.querySelectorAll('.floating-shape');
        
        bubbles.forEach((bubble, index) => {
          const speed = 0.2 + (index * 0.1);
          const yOffset = -(scrolled * speed);
          bubble.style.transform = `translate3d(0, ${yOffset}px, 0)`;
        });
        
        shapes.forEach((shape, index) => {
          const speed = 0.15 + (index * 0.05);
          const yOffset = -(scrolled * speed);
          const rotation = scrolled * 0.1;
          shape.style.transform = `translate3d(0, ${yOffset}px, 0) rotate(${rotation}deg)`;
        });
      }
    }
  }

  setupImageHoverEffects() {
    if (!this.imageContainer) return;

    const image = this.imageContainer.querySelector('.rich-text__image');
    const overlay = this.imageContainer.querySelector('.image-overlay');
    
    if (!image || !overlay) return;

    // Mouse enter effect
    this.imageContainer.addEventListener('mouseenter', () => {
      if (this.isReducedMotion) return;
      
      image.style.transform = 'scale(1.05)';
      overlay.style.opacity = '1';
      
      // Add subtle rotation to secondary image
      const secondaryImage = this.imageContainer.querySelector('.rich-text__secondary-image');
      if (secondaryImage) {
        secondaryImage.style.transform = 'translateY(-3px) rotate(2deg)';
      }
    });

    // Mouse leave effect
    this.imageContainer.addEventListener('mouseleave', () => {
      if (this.isReducedMotion) return;
      
      image.style.transform = 'scale(1)';
      overlay.style.opacity = '0';
      
      const secondaryImage = this.imageContainer.querySelector('.rich-text__secondary-image');
      if (secondaryImage) {
        secondaryImage.style.transform = 'translateY(0) rotate(0deg)';
      }
    });

    // Mouse move parallax effect
    this.imageContainer.addEventListener('mousemove', (e) => {
      if (this.isReducedMotion) return;
      
      const rect = this.imageContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      const moveX = (x - 0.5) * 10;
      const moveY = (y - 0.5) * 10;
      
      image.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`;
    });
  }

  setupButtonEffects() {
    this.buttons.forEach(button => {
      // Ripple effect on click
      button.addEventListener('click', (e) => {
        this.createRippleEffect(button, e);
        this.trackButtonClick(button);
      });

      // Hover effects
      button.addEventListener('mouseenter', () => {
        if (this.isReducedMotion) return;
        button.style.transform = 'translateY(-2px)';
      });

      button.addEventListener('mouseleave', () => {
        if (this.isReducedMotion) return;
        button.style.transform = 'translateY(0)';
      });
    });
  }

  createRippleEffect(button, event) {
    if (this.isReducedMotion) return;

    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      z-index: 1;
    `;

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  trackButtonClick(button) {
    if (typeof window.aiNavigation !== 'undefined') {
      const isPrimary = button.classList.contains('button--primary');
      const buttonText = button.textContent.trim();
      
      window.aiNavigation.trackEvent('rich_text_button_clicked', {
        section_id: this.container.closest('section')?.id || 'unknown',
        button_type: isPrimary ? 'primary' : 'secondary',
        button_text: buttonText,
        timestamp: Date.now()
      });
    }
  }

  setupKeyboardNavigation() {
    // Ensure buttons are keyboard accessible
    this.buttons.forEach(button => {
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });

      // Focus styles
      button.addEventListener('focus', () => {
        button.style.outline = '2px solid rgb(var(--color-accent-1))';
        button.style.outlineOffset = '2px';
      });

      button.addEventListener('blur', () => {
        button.style.outline = 'none';
      });
    });
  }

  setupAINavigation() {
    if (typeof window.aiNavigation === 'undefined') return;

    // Track feature interaction
    const features = this.container.querySelectorAll('.feature-item');
    features.forEach((feature, index) => {
      feature.addEventListener('mouseenter', () => {
        window.aiNavigation.trackEvent('rich_text_feature_hovered', {
          section_id: this.container.closest('section')?.id || 'unknown',
          feature_index: index,
          feature_title: feature.querySelector('.feature-title')?.textContent.trim(),
          timestamp: Date.now()
        });
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      const rect = this.container.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const scrollDepth = Math.max(0, visibleHeight / rect.height);
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (scrollDepth > 0.8) {
          window.aiNavigation.trackEvent('rich_text_deep_scroll', {
            section_id: this.container.closest('section')?.id || 'unknown',
            scroll_depth: scrollDepth,
            timestamp: Date.now()
          });
        }
      }
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    
    this.cleanupFunctions = this.cleanupFunctions || [];
    this.cleanupFunctions.push(() => {
      window.removeEventListener('scroll', trackScrollDepth);
    });
  }

  setupPerformanceOptimizations() {
    // Lazy load images
    const images = this.container.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported
      images.forEach(img => {
        img.addEventListener('load', () => {
          img.style.opacity = '1';
        });
      });
    } else {
      // Fallback for browsers without native lazy loading
      this.setupLazyLoading(images);
    }

    // Optimize animations for performance
    if (!this.isReducedMotion) {
      this.setupGPUAcceleration();
    }

    // Debounce resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }

  setupLazyLoading(images) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.style.opacity = '1';
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  setupGPUAcceleration() {
    // Apply GPU acceleration to animated elements
    const animatedElements = [
      this.imageContainer,
      ...this.contentElements,
      ...this.buttons
    ].filter(Boolean);

    animatedElements.forEach(element => {
      element.style.willChange = 'transform, opacity';
      element.style.backfaceVisibility = 'hidden';
      element.style.perspective = '1000px';
    });
  }

  handleResize() {
    // Update parallax calculations on resize
    if (this.isParallaxEnabled && !this.isReducedMotion) {
      this.updateParallax();
    }

    // Recalculate intersection observer roots
    if (this.observer) {
      this.observer.disconnect();
      this.setupIntersectionObserver();
    }
  }

  // Cleanup method
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.cleanupFunctions) {
      this.cleanupFunctions.forEach(cleanup => cleanup());
    }

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    console.log('Rich Text with Image section destroyed');
  }
}

// CSS for ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// Initialize sections when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const richTextSections = document.querySelectorAll('[data-rich-text-section]');
  
  richTextSections.forEach(section => {
    new RichTextWithImageSection(section);
  });
});

// Handle dynamic section loading (for theme editor)
if (Shopify && Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    const section = event.target.querySelector('[data-rich-text-section]');
    if (section) {
      new RichTextWithImageSection(section);
    }
  });

  document.addEventListener('shopify:section:unload', (event) => {
    const section = event.target.querySelector('[data-rich-text-section]');
    if (section && section.richTextInstance) {
      section.richTextInstance.destroy();
    }
  });
}

// Export for potential external use
window.RichTextWithImageSection = RichTextWithImageSection; 