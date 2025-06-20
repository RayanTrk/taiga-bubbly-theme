/**
 * Promotional Banner Manager - Taiga Theme Bubbly Style
 * Handles countdown timers, dismissible banners, auto-hide functionality and AI navigation tracking
 * Following shopirule.mdc guidelines
 */

class PromotionalBannerManager {
  constructor() {
    this.banners = document.querySelectorAll('[data-promotional-banner]');
    this.isInitialized = false;
    this.countdownTimers = new Map();
    this.dismissedBanners = this.loadDismissedBanners();
    this.autoHideTimers = new Map();

    this.settings = {
      storageKeys: {
        dismissed: 'taiga_dismissed_promos',
        autoHideDelay: 'taiga_promo_auto_hide'
      },
      countdownSettings: {
        updateInterval: 1000,
        expiredThreshold: 0
      },
      animationSettings: {
        hideDelay: 300,
        showDelay: 150
      }
    };

    this.init();
  }

  init() {
    if (this.isInitialized || this.banners.length === 0) return;

    this.banners.forEach(banner => {
      this.initializeBanner(banner);
    });

    this.bindEvents();
    this.initializeCountdowns();
    this.setupAutoHide();
    this.initializeAINavigation();

    this.isInitialized = true;

    // Track initialization
    this.trackAIEvent('promotional_banners_initialized', {
      banners_count: this.banners.length,
      timestamp: Date.now()
    });
  }

  initializeBanner(banner) {
    const bannerId = this.getBannerId(banner);
    
    // Check if banner was previously dismissed
    if (this.dismissedBanners.includes(bannerId)) {
      this.hideBanner(banner, true);
      return;
    }

    // Set initial state
    banner.setAttribute('data-loaded', 'true');
    banner.removeAttribute('data-loading');

    // Apply entrance animation
    this.showBanner(banner);
  }

  bindEvents() {
    // Close button clicks
    document.addEventListener('click', (event) => {
      const closeButton = event.target.closest('[data-promotional-close]');
      if (closeButton) {
        this.handleCloseClick(closeButton);
      }
    });

    // CTA button clicks
    document.addEventListener('click', (event) => {
      const ctaButton = event.target.closest('[data-promotional-cta]');
      if (ctaButton) {
        this.handleCTAClick(ctaButton);
      }
    });

    // Keyboard events
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      }
    });

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  initializeCountdowns() {
    this.banners.forEach(banner => {
      const countdownElement = banner.querySelector('[data-countdown]');
      if (!countdownElement) return;

      const endDate = countdownElement.getAttribute('data-countdown');
      if (!endDate) return;

      this.startCountdown(banner, countdownElement, endDate);
    });
  }

  startCountdown(banner, element, endDateString) {
    const endDate = new Date(endDateString);
    const bannerId = this.getBannerId(banner);

    if (isNaN(endDate.getTime())) {
      console.warn('Invalid countdown date:', endDateString);
      return;
    }

    // Clear existing timer if any
    if (this.countdownTimers.has(bannerId)) {
      clearInterval(this.countdownTimers.get(bannerId));
    }

    // Start countdown timer
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance <= this.settings.countdownSettings.expiredThreshold) {
        this.handleCountdownExpired(banner, element, timer, bannerId);
        return;
      }

      this.updateCountdownDisplay(element, distance);
    }, this.settings.countdownSettings.updateInterval);

    this.countdownTimers.set(bannerId, timer);

    // Track countdown start
    this.trackAIEvent('countdown_started', {
      banner_id: bannerId,
      end_date: endDateString,
      timestamp: Date.now()
    });
  }

  updateCountdownDisplay(element, distance) {
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dayElement = element.querySelector('[data-days]');
    const hourElement = element.querySelector('[data-hours]');
    const minuteElement = element.querySelector('[data-minutes]');
    const secondElement = element.querySelector('[data-seconds]');

    if (dayElement) dayElement.textContent = String(days).padStart(2, '0');
    if (hourElement) hourElement.textContent = String(hours).padStart(2, '0');
    if (minuteElement) minuteElement.textContent = String(minutes).padStart(2, '0');
    if (secondElement) secondElement.textContent = String(seconds).padStart(2, '0');
  }

  handleCountdownExpired(banner, element, timer, bannerId) {
    clearInterval(timer);
    this.countdownTimers.delete(bannerId);
    
    banner.setAttribute('data-countdown-expired', 'true');
    
    // Track countdown expiration
    this.trackAIEvent('countdown_expired', {
      banner_id: bannerId,
      timestamp: Date.now()
    });

    // Optionally auto-hide banner after countdown expires
    setTimeout(() => {
      this.hideBanner(banner);
    }, 5000);
  }

  setupAutoHide() {
    this.banners.forEach(banner => {
      const autoHideAttr = banner.getAttribute('data-auto-hide');
      if (!autoHideAttr) return;

      const delay = parseInt(autoHideAttr) * 1000; // Convert to milliseconds
      const bannerId = this.getBannerId(banner);

      const timer = setTimeout(() => {
        this.hideBanner(banner);
        this.trackAIEvent('banner_auto_hidden', {
          banner_id: bannerId,
          delay_seconds: delay / 1000,
          timestamp: Date.now()
        });
      }, delay);

      this.autoHideTimers.set(bannerId, timer);
    });
  }

  handleCloseClick(closeButton) {
    const banner = closeButton.closest('[data-promotional-banner]');
    if (!banner) return;

    const bannerId = this.getBannerId(banner);
    
    // Add to dismissed list
    this.dismissedBanners.push(bannerId);
    this.saveDismissedBanners();

    // Hide banner
    this.hideBanner(banner);

    // Track dismissal
    this.trackAIEvent('banner_dismissed', {
      banner_id: bannerId,
      method: 'close_button',
      timestamp: Date.now()
    });
  }

  handleCTAClick(ctaButton) {
    const banner = ctaButton.closest('[data-promotional-banner]');
    if (!banner) return;

    const bannerId = this.getBannerId(banner);
    const buttonText = ctaButton.textContent.trim();
    const buttonUrl = ctaButton.getAttribute('href');

    // Track CTA click
    this.trackAIEvent('promotional_cta_clicked', {
      banner_id: bannerId,
      button_text: buttonText,
      button_url: buttonUrl,
      timestamp: Date.now()
    });
  }

  handleEscapeKey() {
    // Find the topmost visible banner and close it
    const visibleBanners = Array.from(this.banners).filter(banner => 
      !banner.hasAttribute('data-hidden')
    );

    if (visibleBanners.length > 0) {
      const topBanner = visibleBanners[visibleBanners.length - 1];
      const closeButton = topBanner.querySelector('[data-promotional-close]');
      
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Pause countdowns when page is hidden
      this.countdownTimers.forEach(timer => {
        // Note: We can't actually pause setInterval, but we could implement
        // a more sophisticated system if needed
      });
    }
  }

  showBanner(banner) {
    banner.style.display = '';
    banner.removeAttribute('data-hidden');
    
    // Add entrance animation
    setTimeout(() => {
      banner.style.opacity = '1';
      banner.style.transform = 'translateY(0)';
    }, this.settings.animationSettings.showDelay);
  }

  hideBanner(banner, immediate = false) {
    const bannerId = this.getBannerId(banner);

    // Clear auto-hide timer
    if (this.autoHideTimers.has(bannerId)) {
      clearTimeout(this.autoHideTimers.get(bannerId));
      this.autoHideTimers.delete(bannerId);
    }

    // Clear countdown timer
    if (this.countdownTimers.has(bannerId)) {
      clearInterval(this.countdownTimers.get(bannerId));
      this.countdownTimers.delete(bannerId);
    }

    if (immediate) {
      banner.style.display = 'none';
      banner.setAttribute('data-hidden', 'true');
    } else {
      // Animate out
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        banner.style.display = 'none';
        banner.setAttribute('data-hidden', 'true');
      }, this.settings.animationSettings.hideDelay);
    }
  }

  getBannerId(banner) {
    // Generate a unique ID based on banner content or section ID
    const sectionMatch = banner.className.match(/promotional-banner-(\w+)/);
    return sectionMatch ? sectionMatch[1] : 'banner_' + Date.now();
  }

  loadDismissedBanners() {
    try {
      const stored = localStorage.getItem(this.settings.storageKeys.dismissed);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load dismissed banners:', error);
      return [];
    }
  }

  saveDismissedBanners() {
    try {
      localStorage.setItem(
        this.settings.storageKeys.dismissed,
        JSON.stringify(this.dismissedBanners)
      );
    } catch (error) {
      console.warn('Failed to save dismissed banners:', error);
    }
  }

  initializeAINavigation() {
    // Enhanced AI tracking for promotional banners
    this.banners.forEach(banner => {
      this.addViewTimeTracking(banner);
      this.addScrollInteractionTracking(banner);
    });
  }

  addViewTimeTracking(banner) {
    let viewStartTime = null;
    let totalViewTime = 0;
    const bannerId = this.getBannerId(banner);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !viewStartTime) {
          viewStartTime = Date.now();
        } else if (!entry.isIntersecting && viewStartTime) {
          totalViewTime += Date.now() - viewStartTime;
          viewStartTime = null;

          this.trackAIEvent('promotional_banner_view_time', {
            banner_id: bannerId,
            view_duration: totalViewTime,
            timestamp: Date.now()
          });
        }
      });
    }, { threshold: 0.7 });

    observer.observe(banner);
  }

  addScrollInteractionTracking(banner) {
    const bannerId = this.getBannerId(banner);
    let hasTrackedScroll = false;

    const trackScrollPast = () => {
      if (hasTrackedScroll) return;
      
      const bannerRect = banner.getBoundingClientRect();
      if (bannerRect.bottom < 0) {
        hasTrackedScroll = true;
        this.trackAIEvent('promotional_banner_scrolled_past', {
          banner_id: bannerId,
          timestamp: Date.now()
        });
        window.removeEventListener('scroll', trackScrollPast);
      }
    };

    window.addEventListener('scroll', trackScrollPast, { passive: true });
  }

  trackAIEvent(eventName, data) {
    if (typeof window.aiNavigation !== 'undefined') {
      window.aiNavigation.trackEvent(eventName, data);
    }
  }

  cleanup() {
    // Clear all timers
    this.countdownTimers.forEach(timer => clearInterval(timer));
    this.autoHideTimers.forEach(timer => clearTimeout(timer));
    
    this.countdownTimers.clear();
    this.autoHideTimers.clear();
  }

  // Public method to refresh promotional banners
  refresh() {
    this.cleanup();
    this.isInitialized = false;
    this.init();
  }

  // Public method to manually dismiss a banner
  dismissBanner(bannerId) {
    const banner = document.querySelector(`[class*="promotional-banner-${bannerId}"]`);
    if (banner) {
      this.hideBanner(banner);
      this.dismissedBanners.push(bannerId);
      this.saveDismissedBanners();
    }
  }

  // Public method to show a previously dismissed banner
  showBanner(bannerId) {
    this.dismissedBanners = this.dismissedBanners.filter(id => id !== bannerId);
    this.saveDismissedBanners();
    
    const banner = document.querySelector(`[class*="promotional-banner-${bannerId}"]`);
    if (banner) {
      this.showBanner(banner);
    }
  }

  // Public method to update settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }
}

// Initialize promotional banner manager
document.addEventListener('DOMContentLoaded', () => {
  window.promotionalBannerManager = new PromotionalBannerManager();
});

// Theme editor support
document.addEventListener('shopify:section:load', () => {
  if (window.promotionalBannerManager) {
    window.promotionalBannerManager.refresh();
  }
});

document.addEventListener('shopify:section:unload', () => {
  if (window.promotionalBannerManager) {
    window.promotionalBannerManager.cleanup();
  }
}); 