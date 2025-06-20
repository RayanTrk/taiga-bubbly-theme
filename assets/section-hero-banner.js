/**
 * Hero Banner Section Manager - Taiga Theme Bubbly Style
 * Handles video playback, animations, AI navigation tracking and performance optimizations
 * Following shopirule.mdc guidelines
 */

class HeroBannerManager {
  constructor() {
    this.sections = document.querySelectorAll('[data-hero-banner]');
    this.isInitialized = false;
    this.animationFrameId = null;
    this.resizeTimeout = null;
    this.observers = {
      intersection: null,
      resize: null
    };

    this.settings = {
      videoSettings: {
        autoplay: true,
        muted: true,
        loop: true,
        preload: 'metadata'
      },
      animationSettings: {
        duration: 800,
        delay: 200,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      performanceSettings: {
        enableVideoOptimization: true,
        enableLazyLoading: true,
        maxConcurrentVideos: 1
      }
    };

    this.init();
  }

  init() {
    if (this.isInitialized || this.sections.length === 0) return;

    this.bindEvents();
    this.initializeVideoHandlers();
    this.initializeAnimations();
    this.initializeIntersectionObserver();
    this.initializeAINavigation();
    this.optimizePerformance();

    this.isInitialized = true;

    // Track initialization
    this.trackAIEvent('hero_banner_initialized', {
      sections_count: this.sections.length,
      timestamp: Date.now()
    });
  }

  bindEvents() {
    // Scroll indicator clicks
    document.addEventListener('click', this.handleScrollClick.bind(this));
    
    // Video control events
    document.addEventListener('click', this.handleVideoControls.bind(this));
    
    // Resize handling with debouncing
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', this.handleMotionPreferenceChange.bind(this));
  }

  initializeVideoHandlers() {
    this.sections.forEach(section => {
      const video = section.querySelector('[data-hero-video]');
      if (!video) return;

      this.setupVideoElement(video, section);
    });
  }

  setupVideoElement(video, section) {
    // Apply video settings
    Object.keys(this.settings.videoSettings).forEach(setting => {
      if (setting !== 'preload') {
        video[setting] = this.settings.videoSettings[setting];
      } else {
        video.setAttribute('preload', this.settings.videoSettings[setting]);
      }
    });

    // Video event listeners
    video.addEventListener('loadeddata', () => {
      section.setAttribute('data-loaded', 'true');
      section.removeAttribute('data-loading');
      this.trackAIEvent('hero_video_loaded', {
        section_id: section.dataset.sectionId || 'unknown',
        video_duration: video.duration,
        timestamp: Date.now()
      });
    });

    video.addEventListener('error', () => {
      this.handleVideoError(video, section);
    });

    video.addEventListener('play', () => {
      this.trackAIEvent('hero_video_played', {
        section_id: section.dataset.sectionId || 'unknown',
        timestamp: Date.now()
      });
    });

    // Optimize video loading
    if (this.settings.performanceSettings.enableVideoOptimization) {
      this.optimizeVideoLoading(video);
    }
  }

  optimizeVideoLoading(video) {
    // Intersection observer for lazy video loading
    if (this.settings.performanceSettings.enableLazyLoading) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const video = entry.target;
            if (video.readyState < 2) {
              video.load();
            }
            videoObserver.unobserve(video);
          }
        });
      }, { threshold: 0.25 });

      videoObserver.observe(video);
    }

    // Preload optimization based on connection
    if ('connection' in navigator) {
      const connection = navigator.connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        video.preload = 'none';
        video.poster = video.poster || '';
      }
    }
  }

  handleVideoError(video, section) {
    console.warn('Hero video failed to load, falling back to poster image');
    
    // Hide video and show poster
    video.style.display = 'none';
    
    // Set background image as fallback
    const poster = video.getAttribute('poster');
    if (poster) {
      section.style.backgroundImage = `url(${poster})`;
    }

    this.trackAIEvent('hero_video_error', {
      section_id: section.dataset.sectionId || 'unknown',
      error_type: 'load_failed',
      timestamp: Date.now()
    });
  }

  initializeAnimations() {
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: this.settings.animationSettings.duration,
        delay: this.settings.animationSettings.delay,
        easing: this.settings.animationSettings.easing,
        once: true,
        mirror: false,
        anchorPlacement: 'top-bottom',
        disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      });
    }

    // Custom bubble animations
    this.initializeBubbleAnimations();
  }

  initializeBubbleAnimations() {
    const bubbleContainers = document.querySelectorAll('.hero-banner__bubbles');
    
    bubbleContainers.forEach(container => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        container.style.display = 'none';
        return;
      }

      // Randomize bubble animation delays for more natural effect
      const bubbles = container.querySelectorAll('.bubble');
      bubbles.forEach(bubble => {
        const randomDelay = Math.random() * 20;
        bubble.style.animationDelay = `-${randomDelay}s`;
      });
    });
  }

  initializeIntersectionObserver() {
    this.observers.intersection = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleSectionInView(entry.target);
        } else {
          this.handleSectionOutOfView(entry.target);
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '50px'
    });

    this.sections.forEach(section => {
      this.observers.intersection.observe(section);
    });
  }

  handleSectionInView(section) {
    const video = section.querySelector('[data-hero-video]');
    
    if (video) {
      // Play video when in view
      video.play().catch(() => {
        // Auto-play failed, user interaction required
        this.addPlayButton(video, section);
      });
    }

    // Track section view
    this.trackAIEvent('hero_section_in_view', {
      section_id: section.dataset.sectionId || 'unknown',
      timestamp: Date.now()
    });
  }

  handleSectionOutOfView(section) {
    const video = section.querySelector('[data-hero-video]');
    
    if (video && !video.paused) {
      // Pause video when out of view to save resources
      video.pause();
    }
  }

  addPlayButton(video, section) {
    if (section.querySelector('.hero-banner__play-button')) return;

    const playButton = document.createElement('button');
    playButton.className = 'hero-banner__play-button';
    playButton.innerHTML = `
      <span class="hero-banner__play-icon">▶</span>
      <span class="sr-only">Play video</span>
    `;
    playButton.setAttribute('aria-label', 'Play background video');

    playButton.addEventListener('click', () => {
      video.play();
      playButton.remove();
    });

    section.appendChild(playButton);
  }

  handleScrollClick(event) {
    const scrollButton = event.target.closest('[data-scroll-down]');
    if (!scrollButton) return;

    event.preventDefault();

    const section = scrollButton.closest('[data-hero-banner]');
    const nextSection = section.nextElementSibling;

    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      this.trackAIEvent('hero_scroll_interaction', {
        section_id: section.dataset.sectionId || 'unknown',
        target_section: nextSection.tagName.toLowerCase(),
        timestamp: Date.now()
      });
    }
  }

  handleVideoControls(event) {
    const videoControl = event.target.closest('[data-video-control]');
    if (!videoControl) return;

    const section = videoControl.closest('[data-hero-banner]');
    const video = section.querySelector('[data-hero-video]');
    
    if (!video) return;

    const action = videoControl.dataset.videoControl;

    switch (action) {
      case 'play':
        video.play();
        break;
      case 'pause':
        video.pause();
        break;
      case 'mute':
        video.muted = !video.muted;
        break;
    }

    this.trackAIEvent('hero_video_control', {
      section_id: section.dataset.sectionId || 'unknown',
      action: action,
      timestamp: Date.now()
    });
  }

  handleResize() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      this.optimizeForViewport();
    }, 250);
  }

  optimizeForViewport() {
    this.sections.forEach(section => {
      const video = section.querySelector('[data-hero-video]');
      if (!video) return;

      // Adjust video quality based on viewport size
      if (window.innerWidth < 768) {
        video.style.objectPosition = 'center';
      }
    });
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Pause all videos when page is hidden
      this.sections.forEach(section => {
        const video = section.querySelector('[data-hero-video]');
        if (video && !video.paused) {
          video.pause();
          video.dataset.wasPaused = 'false';
        }
      });
    } else {
      // Resume videos when page becomes visible
      this.sections.forEach(section => {
        const video = section.querySelector('[data-hero-video]');
        if (video && video.dataset.wasPaused === 'false') {
          video.play();
          delete video.dataset.wasPaused;
        }
      });
    }
  }

  handleMotionPreferenceChange(mediaQuery) {
    const shouldReduceMotion = mediaQuery.matches;
    
    if (shouldReduceMotion) {
      // Disable animations
      document.querySelectorAll('.bubble').forEach(bubble => {
        bubble.style.animation = 'none';
        bubble.style.opacity = '0.3';
      });

      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    } else {
      // Re-enable animations
      this.initializeBubbleAnimations();
      
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    }
  }

  initializeAINavigation() {
    // Enhanced AI tracking for hero sections
    this.sections.forEach(section => {
      // Track CTA button interactions with enhanced data
      const ctaButtons = section.querySelectorAll('[data-hero-cta]');
      ctaButtons.forEach((button, index) => {
        this.addEnhancedButtonTracking(button, section, index);
      });

      // Track time spent viewing hero
      this.addViewTimeTracking(section);
    });
  }

  addEnhancedButtonTracking(button, section, index) {
    let hoverStartTime = null;

    button.addEventListener('mouseenter', () => {
      hoverStartTime = Date.now();
    });

    button.addEventListener('mouseleave', () => {
      if (hoverStartTime) {
        const hoverDuration = Date.now() - hoverStartTime;
        this.trackAIEvent('hero_cta_hover', {
          section_id: section.dataset.sectionId || 'unknown',
          button_index: index,
          hover_duration: hoverDuration,
          timestamp: Date.now()
        });
        hoverStartTime = null;
      }
    });

    button.addEventListener('click', () => {
      this.trackAIEvent('hero_cta_click', {
        section_id: section.dataset.sectionId || 'unknown',
        button_index: index,
        button_text: button.textContent.trim(),
        button_url: button.getAttribute('href'),
        viewport_width: window.innerWidth,
        timestamp: Date.now()
      });
    });
  }

  addViewTimeTracking(section) {
    let viewStartTime = null;
    let totalViewTime = 0;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !viewStartTime) {
          viewStartTime = Date.now();
        } else if (!entry.isIntersecting && viewStartTime) {
          totalViewTime += Date.now() - viewStartTime;
          viewStartTime = null;

          this.trackAIEvent('hero_view_time', {
            section_id: section.dataset.sectionId || 'unknown',
            view_duration: totalViewTime,
            timestamp: Date.now()
          });
        }
      });
    }, { threshold: 0.7 });

    observer.observe(section);
  }

  trackAIEvent(eventName, data) {
    if (typeof window.aiNavigation !== 'undefined') {
      window.aiNavigation.trackEvent(eventName, data);
    }
  }

  optimizePerformance() {
    // Implement performance optimizations
    this.sections.forEach(section => {
      // Add performance hints
      section.style.contain = 'layout';
      
      // Optimize background images
      const backgroundImage = window.getComputedStyle(section).backgroundImage;
      if (backgroundImage && backgroundImage !== 'none') {
        section.style.willChange = 'transform';
      }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  cleanup() {
    // Cancel animation frames
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Clear timeouts
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Disconnect observers
    Object.values(this.observers).forEach(observer => {
      if (observer) {
        observer.disconnect();
      }
    });

    // Pause all videos
    this.sections.forEach(section => {
      const video = section.querySelector('[data-hero-video]');
      if (video) {
        video.pause();
      }
    });
  }

  // Public method to refresh the hero banner
  refresh() {
    this.cleanup();
    this.isInitialized = false;
    this.init();
  }

  // Public method to update settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.refresh();
  }
}

// Initialize hero banner manager
document.addEventListener('DOMContentLoaded', () => {
  window.heroBannerManager = new HeroBannerManager();
});

// Theme editor support
document.addEventListener('shopify:section:load', () => {
  if (window.heroBannerManager) {
    window.heroBannerManager.refresh();
  }
});

document.addEventListener('shopify:section:unload', () => {
  if (window.heroBannerManager) {
    window.heroBannerManager.cleanup();
  }
}); 