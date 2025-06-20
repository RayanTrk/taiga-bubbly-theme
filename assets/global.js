/**
 * Taiga Theme - Global JavaScript
 * Style Bubbly avec navigation IA et performance optimisée
 * Respecte les règles shopirule pour le chargement rapide
 */

// Utilities et helpers pour la performance
const Utils = {
  // Debounce function pour optimiser les performances
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Throttle function pour limiter les appels
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Lazy loading pour les images
  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('img-lazy');
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  },

  // Préchargement intelligent selon les règles shopirule
  prefetchCriticalResources() {
    const criticalPages = ['/cart', '/account/login', '/collections'];
    
    // Précharger les pages critiques après le chargement initial
    setTimeout(() => {
      criticalPages.forEach(page => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = page;
        document.head.appendChild(link);
      });
    }, 2000);
  },

  // Animation entrée avec intersection observer
  animateOnScroll() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-bounce');
          animationObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    animatedElements.forEach(el => animationObserver.observe(el));
  }
};

// Navigation IA - Apprentissage des patterns utilisateur
class AINavigation {
  constructor() {
    this.userBehavior = JSON.parse(localStorage.getItem('taiga_user_behavior') || '{}');
    this.currentSession = [];
    this.init();
  }

  init() {
    this.trackPageView();
    this.trackClicks();
    this.predictNextPages();
  }

  trackPageView() {
    const currentPage = window.location.pathname;
    const timestamp = Date.now();
    
    this.currentSession.push({
      page: currentPage,
      timestamp: timestamp,
      scrollDepth: 0
    });

    // Tracker le scroll depth
    const trackScroll = Utils.throttle(() => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      const lastEntry = this.currentSession[this.currentSession.length - 1];
      if (lastEntry && lastEntry.page === currentPage) {
        lastEntry.scrollDepth = Math.max(lastEntry.scrollDepth, scrollPercent);
      }
    }, 1000);

    window.addEventListener('scroll', trackScroll);
  }

  trackClicks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link && link.href.includes(window.location.origin)) {
        const targetPage = new URL(link.href).pathname;
        const currentPage = window.location.pathname;
        
        if (!this.userBehavior[currentPage]) {
          this.userBehavior[currentPage] = {};
        }
        
        if (!this.userBehavior[currentPage][targetPage]) {
          this.userBehavior[currentPage][targetPage] = 0;
        }
        
        this.userBehavior[currentPage][targetPage]++;
        this.saveBehavior();
      }
    });
  }

  predictNextPages() {
    const currentPage = window.location.pathname;
    const predictions = this.userBehavior[currentPage];
    
    if (predictions) {
      // Trier par fréquence et précharger les 2 pages les plus probables
      const sortedPredictions = Object.entries(predictions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2);
      
      sortedPredictions.forEach(([page]) => {
        setTimeout(() => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = page;
          document.head.appendChild(link);
        }, 1000);
      });
    }
  }

  saveBehavior() {
    localStorage.setItem('taiga_user_behavior', JSON.stringify(this.userBehavior));
  }
}

// Performance Monitor selon shopirule
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    // Core Web Vitals monitoring
    this.measureCLS();
    this.measureLCP();
    this.measureFID();
  }

  measureCLS() {
    let clsValue = 0;
    let clsEntries = [];

    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsEntries.push(entry);
          clsValue += entry.value;
        }
      }
      
      this.metrics.cls = clsValue;
    });

    observer.observe({type: 'layout-shift', buffered: true});
  }

  measureLCP() {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
    });

    observer.observe({type: 'largest-contentful-paint', buffered: true});
  }

  measureFID() {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.metrics.fid = entry.processingStart - entry.startTime;
      }
    });

    observer.observe({type: 'first-input', buffered: true});
  }

  getMetrics() {
    return this.metrics;
  }
}

// Cart functionality optimisée
class CartManager {
  constructor() {
    this.cart = null;
    this.isUpdating = false;
    this.init();
  }

  init() {
    this.fetchCart();
    this.bindEvents();
  }

  async fetchCart() {
    try {
      const response = await fetch('/cart.js');
      this.cart = await response.json();
      this.updateCartUI();
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }

  async addToCart(variantId, quantity = 1, properties = {}) {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: variantId,
          quantity: quantity,
          properties: properties
        })
      });

      if (response.ok) {
        await this.fetchCart();
        this.showCartNotification();
      } else {
        const error = await response.json();
        this.showError(error.message || 'Error adding to cart');
      }
    } catch (error) {
      this.showError('Network error. Please try again.');
    } finally {
      this.isUpdating = false;
    }
  }

  updateCartUI() {
    const cartCountElements = document.querySelectorAll('[data-cart-count]');
    cartCountElements.forEach(element => {
      element.textContent = this.cart ? this.cart.item_count : 0;
    });
  }

  showCartNotification() {
    // Animation bubbly pour la notification
    const notification = document.querySelector('.cart-notification');
    if (notification) {
      notification.classList.add('animate-bounce');
      setTimeout(() => {
        notification.classList.remove('animate-bounce');
      }, 1000);
    }
  }

  showError(message) {
    // Afficher l'erreur avec style bubbly
    const errorElement = document.createElement('div');
    errorElement.className = 'error-notification';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-add-to-cart]')) {
        e.preventDefault();
        const button = e.target;
        const variantId = button.dataset.variantId;
        const quantity = parseInt(button.dataset.quantity) || 1;
        
        if (variantId) {
          this.addToCart(variantId, quantity);
        }
      }
    });
  }
}

// Mobile Navigation Manager selon shopirule
class MobileNavigation {
  constructor() {
    this.mobileNavToggle = document.querySelector('[data-mobile-nav-toggle]');
    this.mobileNav = document.querySelector('#mobile-navigation');
    this.mobileNavClose = document.querySelectorAll('[data-mobile-nav-close]');
    this.mobileSubmenuToggles = document.querySelectorAll('[data-mobile-submenu-toggle]');
    this.isOpen = false;
    
    this.init();
  }

  init() {
    if (!this.mobileNavToggle || !this.mobileNav) return;
    
    this.bindEvents();
    this.setupAccessibility();
  }

  bindEvents() {
    // Toggle mobile navigation
    this.mobileNavToggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });

    // Close mobile navigation
    this.mobileNavClose.forEach(closeBtn => {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });
    });

    // Submenu toggles
    this.mobileSubmenuToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleSubmenu(toggle);
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Close on overlay click
    const overlay = this.mobileNav.querySelector('.mobile-navigation__overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        this.close();
      });
    }

    // Handle window resize
    window.addEventListener('resize', Utils.debounce(() => {
      if (window.innerWidth > 990 && this.isOpen) {
        this.close();
      }
    }, 250));
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    
    // Update ARIA attributes
    this.mobileNavToggle.setAttribute('aria-expanded', 'true');
    this.mobileNav.setAttribute('aria-hidden', 'false');
    
    // Add classes for animation
    this.mobileNav.classList.add('mobile-navigation--opening');
    document.body.classList.add('mobile-nav-open');
    
    // Focus management
    this.trapFocus();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      this.mobileNav.classList.remove('mobile-navigation--opening');
      this.mobileNav.classList.add('mobile-navigation--open');
    }, 50);
  }

  close() {
    this.isOpen = false;
    
    // Update ARIA attributes
    this.mobileNavToggle.setAttribute('aria-expanded', 'false');
    this.mobileNav.setAttribute('aria-hidden', 'true');
    
    // Remove classes
    this.mobileNav.classList.remove('mobile-navigation--open');
    document.body.classList.remove('mobile-nav-open');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Close all submenus
    this.closeAllSubmenus();
    
    // Return focus to toggle button
    this.mobileNavToggle.focus();
  }

  toggleSubmenu(toggle) {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    const submenuId = toggle.getAttribute('aria-controls');
    const submenu = document.getElementById(submenuId);
    
    if (!submenu) return;
    
    if (isExpanded) {
      // Close submenu
      toggle.setAttribute('aria-expanded', 'false');
      submenu.setAttribute('aria-hidden', 'true');
      submenu.style.maxHeight = '0';
    } else {
      // Close other submenus first
      this.closeAllSubmenus();
      
      // Open this submenu
      toggle.setAttribute('aria-expanded', 'true');
      submenu.setAttribute('aria-hidden', 'false');
      submenu.style.maxHeight = submenu.scrollHeight + 'px';
    }
  }

  closeAllSubmenus() {
    this.mobileSubmenuToggles.forEach(toggle => {
      const submenuId = toggle.getAttribute('aria-controls');
      const submenu = document.getElementById(submenuId);
      
      if (submenu) {
        toggle.setAttribute('aria-expanded', 'false');
        submenu.setAttribute('aria-hidden', 'true');
        submenu.style.maxHeight = '0';
      }
    });
  }

  setupAccessibility() {
    // Ensure proper ARIA attributes are set
    this.mobileNavToggle.setAttribute('aria-expanded', 'false');
    this.mobileNav.setAttribute('aria-hidden', 'true');
    
    this.mobileSubmenuToggles.forEach(toggle => {
      toggle.setAttribute('aria-expanded', 'false');
      const submenuId = toggle.getAttribute('aria-controls');
      const submenu = document.getElementById(submenuId);
      if (submenu) {
        submenu.setAttribute('aria-hidden', 'true');
        submenu.style.maxHeight = '0';
      }
    });
  }

  trapFocus() {
    const focusableElements = this.mobileNav.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Focus first element
    firstElement.focus();
    
    // Handle tab navigation
    this.mobileNav.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }
}

// Initialisation du thème
class TaigaTheme {
  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.aiNavigation = new AINavigation();
    this.cartManager = new CartManager();
    this.mobileNavigation = new MobileNavigation();
    this.init();
  }

  init() {
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeFeatures());
    } else {
      this.initializeFeatures();
    }
  }

  initializeFeatures() {
    // Lazy loading pour optimiser les performances
    Utils.lazyLoadImages();
    
    // Animations selon le style bubbly
    Utils.animateOnScroll();
    
    // Préchargement intelligent
    Utils.prefetchCriticalResources();
    
    // Initialiser les composants interactifs
    this.initializeDisclosures();
    this.initializeModals();
    
    // Log performance metrics après 5 secondes
    setTimeout(() => {
      const metrics = this.performanceMonitor.getMetrics();
      console.log('Taiga Performance Metrics:', metrics);
    }, 5000);
  }

  initializeDisclosures() {
    const disclosures = document.querySelectorAll('[data-disclosure]');
    disclosures.forEach(disclosure => {
      const trigger = disclosure.querySelector('[data-disclosure-trigger]');
      const content = disclosure.querySelector('[data-disclosure-content]');
      
      if (trigger && content) {
        trigger.addEventListener('click', () => {
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
          trigger.setAttribute('aria-expanded', !isExpanded);
          content.style.display = isExpanded ? 'none' : 'block';
          
          // Animation bubbly
          if (!isExpanded) {
            content.classList.add('animate-bounce');
          }
        });
      }
    });
  }

  initializeModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.dataset.modalTrigger;
        const modal = document.getElementById(modalId);
        
        if (modal) {
          modal.style.display = 'block';
          modal.classList.add('animate-bounce');
          
          // Focus trap
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length) {
            focusableElements[0].focus();
          }
        }
      });
    });

    // Fermer les modales
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-modal-close]')) {
        const modal = e.target.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
        }
      }
    });

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="block"]');
        if (openModal) {
          openModal.style.display = 'none';
        }
      }
    });
  }
}

// Initialiser le thème Taiga
const taigaTheme = new TaigaTheme(); 