/**
 * Feature Grid Section JavaScript
 * Handles interactive features, animations, and AI Navigation integration
 * Follows Bubbly style from shopirule.mdc
 */

class FeatureGridManager {
  constructor(container) {
    this.container = container;
    this.features = container.querySelectorAll('.feature-grid__item');
    this.observer = null;
    this.animationQueue = [];
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupAnimations();
    this.setupHoverEffects();
    this.setupAINavigation();
    this.setupAccessibility();
    this.setupResponsiveHandling();
  }

  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateFeature(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });

      this.features.forEach(feature => {
        this.observer.observe(feature);
      });
    }
  }

  setupAnimations() {
    if (this.isReducedMotion) return;

    // Stagger animation delays for Bubbly entrance effect
    this.features.forEach((feature, index) => {
      feature.style.setProperty('--animation-delay', `${index * 0.1}s`);
    });

    // Create floating bubble animations
    this.createFloatingBubbles();
  }

  createFloatingBubbles() {
    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = 'feature-grid__bubbles';
    this.container.appendChild(bubbleContainer);

    // Create multiple bubbles with random properties
    for (let i = 0; i < 12; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'feature-grid__bubble';
      
      // Random properties for natural movement
      const size = Math.random() * 60 + 20;
      const delay = Math.random() * 10;
      const duration = Math.random() * 15 + 10;
      const opacity = Math.random() * 0.3 + 0.1;
      
      bubble.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        opacity: ${opacity};
        left: ${Math.random() * 100}%;
      `;
      
      bubbleContainer.appendChild(bubble);
    }
  }

  animateFeature(feature) {
    if (this.isReducedMotion) {
      feature.classList.add('feature-grid__item--visible');
      return;
    }

    // Bubbly entrance animation
    feature.classList.add('feature-grid__item--animate');
    
    // Add ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'feature-grid__ripple';
    feature.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 1000);
  }

  setupHoverEffects() {
    this.features.forEach(feature => {
      const icon = feature.querySelector('.feature-grid__icon');
      const content = feature.querySelector('.feature-grid__content');
      
      if (!icon || !content) return;

      feature.addEventListener('mouseenter', () => {
        if (this.isReducedMotion) return;
        
        // Bubbly hover effect with scale and glow
        icon.style.transform = 'scale(1.1) rotate(5deg)';
        content.style.transform = 'translateY(-2px)';
        
        // Add particle effect
        this.createHoverParticles(feature);
      });

      feature.addEventListener('mouseleave', () => {
        if (this.isReducedMotion) return;
        
        icon.style.transform = '';
        content.style.transform = '';
      });

      // Touch support for mobile
      feature.addEventListener('touchstart', () => {
        feature.classList.add('feature-grid__item--touched');
      });

      feature.addEventListener('touchend', () => {
        setTimeout(() => {
          feature.classList.remove('feature-grid__item--touched');
        }, 300);
      });
    });
  }

  createHoverParticles(feature) {
    const particles = [];
    const particleCount = 6;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'feature-grid__particle';
      
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: var(--gradient-accent);
        border-radius: 50%;
        pointer-events: none;
        opacity: 0;
        transform: translate(${x}px, ${y}px) scale(0);
        animation: particleFloat 0.8s ease-out forwards;
      `;
      
      feature.appendChild(particle);
      particles.push(particle);
    }
    
    // Clean up particles
    setTimeout(() => {
      particles.forEach(particle => particle.remove());
    }, 800);
  }

  setupAINavigation() {
    // AI Navigation integration for pattern learning
    if (window.AINavigation) {
      this.features.forEach((feature, index) => {
        feature.addEventListener('click', () => {
          window.AINavigation.trackInteraction('feature_click', {
            feature_index: index,
            feature_title: feature.querySelector('.feature-grid__title')?.textContent,
            section_type: 'feature_grid',
            timestamp: Date.now()
          });
        });

        // Track hover patterns for AI learning
        let hoverStartTime;
        feature.addEventListener('mouseenter', () => {
          hoverStartTime = Date.now();
        });

        feature.addEventListener('mouseleave', () => {
          if (hoverStartTime) {
            const hoverDuration = Date.now() - hoverStartTime;
            window.AINavigation.trackInteraction('feature_hover', {
              feature_index: index,
              hover_duration: hoverDuration,
              section_type: 'feature_grid'
            });
          }
        });
      });
    }
  }

  setupAccessibility() {
    this.features.forEach(feature => {
      // Ensure proper keyboard navigation
      if (!feature.hasAttribute('tabindex')) {
        feature.setAttribute('tabindex', '0');
      }

      // Add ARIA labels if missing
      const title = feature.querySelector('.feature-grid__title');
      const description = feature.querySelector('.feature-grid__description');
      
      if (title && !feature.hasAttribute('aria-label')) {
        const label = title.textContent + (description ? ': ' + description.textContent : '');
        feature.setAttribute('aria-label', label);
      }

      // Keyboard interaction
      feature.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          feature.click();
        }
      });

      // Focus management
      feature.addEventListener('focus', () => {
        feature.classList.add('feature-grid__item--focused');
      });

      feature.addEventListener('blur', () => {
        feature.classList.remove('feature-grid__item--focused');
      });
    });
  }

  setupResponsiveHandling() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }

  handleResize() {
    // Recalculate animations and positions on resize
    if (this.isReducedMotion) return;
    
    const bubbles = this.container.querySelectorAll('.feature-grid__bubble');
    bubbles.forEach(bubble => {
      bubble.style.left = Math.random() * 100 + '%';
    });
  }

  // Performance optimization methods
  optimizePerformance() {
    // Use requestAnimationFrame for smooth animations
    const animateElements = () => {
      if (this.animationQueue.length > 0) {
        const element = this.animationQueue.shift();
        this.animateFeature(element);
      }
      
      if (this.animationQueue.length > 0) {
        requestAnimationFrame(animateElements);
      }
    };
    
    requestAnimationFrame(animateElements);
  }

  // Cleanup method
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Remove event listeners
    this.features.forEach(feature => {
      feature.replaceWith(feature.cloneNode(true));
    });
    
    // Clean up bubbles
    const bubbleContainer = this.container.querySelector('.feature-grid__bubbles');
    if (bubbleContainer) {
      bubbleContainer.remove();
    }
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const featureGrids = document.querySelectorAll('.feature-grid');
  
  featureGrids.forEach(grid => {
    new FeatureGridManager(grid);
  });
});

// Handle dynamic content loading
if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    const featureGrid = event.target.querySelector('.feature-grid');
    if (featureGrid) {
      new FeatureGridManager(featureGrid);
    }
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeatureGridManager;
} 