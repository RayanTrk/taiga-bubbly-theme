/**
 * Video Section JavaScript - Taiga Theme Bubbly Style
 * Handles video playback, YouTube/Vimeo integration, and AI Navigation
 * Follows shopirule.mdc specifications
 */

class VideoSectionManager {
  constructor(container) {
    this.container = container;
    this.videoType = container.dataset.videoType;
    this.videoId = container.dataset.videoId;
    this.autoplay = container.dataset.autoplay === 'true';
    this.muted = container.dataset.muted === 'true';
    this.loop = container.dataset.loop === 'true';
    this.isPlaying = false;
    this.player = null;
    this.observer = null;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }

  init() {
    this.setupVideoPlayer();
    this.setupIntersectionObserver();
    this.setupEventListeners();
    this.setupAINavigation();
    this.setupAccessibility();
    this.setupBubbleAnimations();
  }

  setupVideoPlayer() {
    const videoElement = this.container.querySelector('.video-section__video');
    const playButton = this.container.querySelector('.video-section__play-button');
    
    if (!videoElement) return;

    switch (this.videoType) {
      case 'youtube':
        this.setupYouTubePlayer(playButton);
        break;
      case 'vimeo':
        this.setupVimeoPlayer(playButton);
        break;
      case 'self-hosted':
        this.setupSelfHostedPlayer(videoElement, playButton);
        break;
    }
  }

  setupYouTubePlayer(playButton) {
    if (!playButton) return;

    playButton.addEventListener('click', () => {
      this.loadYouTubeAPI().then(() => {
        this.createYouTubePlayer();
      });
    });
  }

  loadYouTubeAPI() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      window.onYouTubeIframeAPIReady = resolve;
      
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
      }
    });
  }

  createYouTubePlayer() {
    const videoWrapper = this.container.querySelector('.video-section__video-wrapper');
    const playButton = this.container.querySelector('.video-section__play-button');
    
    if (playButton) playButton.style.display = 'none';
    
    const playerDiv = document.createElement('div');
    playerDiv.id = `youtube-player-${this.container.dataset.sectionId}`;
    videoWrapper.appendChild(playerDiv);

    this.player = new YT.Player(playerDiv.id, {
      videoId: this.videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 1,
        mute: this.muted ? 1 : 0,
        loop: this.loop ? 1 : 0,
        playlist: this.loop ? this.videoId : '',
        rel: 0,
        showinfo: 0,
        modestbranding: 1,
        playsinline: 1
      },
      events: {
        onReady: (event) => {
          event.target.playVideo();
          this.isPlaying = true;
          this.trackVideoInteraction('youtube', 'play');
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.ENDED) {
            this.trackVideoInteraction('youtube', 'ended');
          }
        }
      }
    });
  }

  setupVimeoPlayer(playButton) {
    if (!playButton) return;

    playButton.addEventListener('click', () => {
      this.loadVimeoAPI().then(() => {
        this.createVimeoPlayer();
      });
    });
  }

  loadVimeoAPI() {
    return new Promise((resolve) => {
      if (window.Vimeo && window.Vimeo.Player) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  createVimeoPlayer() {
    const videoWrapper = this.container.querySelector('.video-section__video-wrapper');
    const playButton = this.container.querySelector('.video-section__play-button');
    
    if (playButton) playButton.style.display = 'none';
    
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${this.videoId}?autoplay=1&muted=${this.muted ? 1 : 0}&loop=${this.loop ? 1 : 0}`;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    
    videoWrapper.appendChild(iframe);
    
    this.player = new Vimeo.Player(iframe);
    this.player.on('play', () => {
      this.isPlaying = true;
      this.trackVideoInteraction('vimeo', 'play');
    });
    
    this.player.on('ended', () => {
      this.trackVideoInteraction('vimeo', 'ended');
    });
  }

  setupSelfHostedPlayer(videoElement, playButton) {
    if (!videoElement) return;

    // Auto-setup for self-hosted videos
    videoElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.trackVideoInteraction('self-hosted', 'play');
    });

    videoElement.addEventListener('ended', () => {
      this.trackVideoInteraction('self-hosted', 'ended');
    });

    videoElement.addEventListener('loadstart', () => {
      videoElement.classList.add('video-section__video--loading');
    });

    videoElement.addEventListener('canplay', () => {
      videoElement.classList.remove('video-section__video--loading');
    });

    // Handle play button for self-hosted videos if present
    if (playButton) {
      playButton.addEventListener('click', () => {
        if (videoElement.paused) {
          videoElement.play();
          playButton.style.display = 'none';
        }
      });
    }
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleVideoInView();
        } else {
          this.handleVideoOutOfView();
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px -10% 0px'
    });

    this.observer.observe(this.container);
  }

  handleVideoInView() {
    // Trigger AI Navigation learning
    this.trackAINavigation('video_viewed');
    
    // Auto-play if enabled and not already playing
    if (this.autoplay && !this.isPlaying && this.videoType === 'self-hosted') {
      const video = this.container.querySelector('video');
      if (video && video.paused) {
        video.play().catch(() => {
          // Autoplay failed, show play button
          const playButton = this.container.querySelector('.video-section__play-button');
          if (playButton) playButton.style.display = 'flex';
        });
      }
    }
  }

  handleVideoOutOfView() {
    // Pause video when out of view for performance
    if (this.isPlaying && this.videoType === 'self-hosted') {
      const video = this.container.querySelector('video');
      if (video && !video.paused) {
        video.pause();
      }
    }
  }

  setupEventListeners() {
    // Handle overlay interactions
    const overlay = this.container.querySelector('.video-section__overlay');
    const overlayButton = this.container.querySelector('.video-section__overlay-button');
    
    if (overlayButton) {
      overlayButton.addEventListener('click', (e) => {
        this.trackVideoInteraction('overlay', 'button_click');
      });
    }

    // Handle keyboard navigation
    const playButton = this.container.querySelector('.video-section__play-button');
    if (playButton) {
      playButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playButton.click();
        }
      });
    }

    // Handle resize for responsive behavior
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));
  }

  setupAINavigation() {
    // Initialize AI Navigation tracking for video interactions
    if (typeof window.AINavigation !== 'undefined') {
      window.AINavigation.trackElement(this.container, {
        type: 'video_section',
        videoType: this.videoType,
        sectionId: this.container.dataset.sectionId,
        hasOverlay: this.container.classList.contains('video-section--overlay')
      });
    }
  }

  setupAccessibility() {
    // Ensure proper ARIA labels and roles
    const video = this.container.querySelector('video, .video-section__video');
    const playButton = this.container.querySelector('.video-section__play-button');
    
    if (video && !video.getAttribute('aria-label')) {
      video.setAttribute('aria-label', 'Video content');
    }
    
    if (playButton && !playButton.getAttribute('aria-label')) {
      playButton.setAttribute('aria-label', 'Play video');
    }

    // Handle focus management
    if (playButton) {
      playButton.addEventListener('focus', () => {
        playButton.style.outline = '2px solid var(--color-accent)';
        playButton.style.outlineOffset = '4px';
      });
      
      playButton.addEventListener('blur', () => {
        playButton.style.outline = '';
        playButton.style.outlineOffset = '';
      });
    }
  }

  setupBubbleAnimations() {
    if (this.isReducedMotion) return;

    const bubbles = this.container.querySelectorAll('.video-section__bubble');
    
    bubbles.forEach((bubble, index) => {
      // Add random movement variation
      const randomDelay = Math.random() * 5;
      const randomDuration = 20 + Math.random() * 10;
      
      bubble.style.animationDelay = `-${randomDelay}s`;
      bubble.style.animationDuration = `${randomDuration}s`;
      
      // Add mouse interaction
      bubble.addEventListener('mouseenter', () => {
        if (!this.isReducedMotion) {
          bubble.style.transform = 'scale(1.1)';
          bubble.style.opacity = '0.8';
        }
      });
      
      bubble.addEventListener('mouseleave', () => {
        if (!this.isReducedMotion) {
          bubble.style.transform = '';
          bubble.style.opacity = '';
        }
      });
    });
  }

  trackVideoInteraction(type, action) {
    // Track video interactions for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'video_interaction', {
        video_type: type,
        video_action: action,
        video_id: this.videoId,
        section_id: this.container.dataset.sectionId
      });
    }

    // Track for AI Navigation
    this.trackAINavigation(`video_${action}`, {
      videoType: type,
      videoId: this.videoId
    });
  }

  trackAINavigation(event, data = {}) {
    if (typeof window.AINavigation !== 'undefined') {
      window.AINavigation.track(event, {
        section: 'video',
        sectionId: this.container.dataset.sectionId,
        ...data
      });
    }
  }

  handleResize() {
    // Handle responsive behavior
    const isMobile = window.innerWidth <= 750;
    const bubbles = this.container.querySelectorAll('.video-section__bubble');
    
    if (isMobile) {
      bubbles.forEach(bubble => {
        bubble.style.display = 'none';
      });
    } else {
      bubbles.forEach(bubble => {
        bubble.style.display = '';
      });
    }
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  destroy() {
    // Cleanup
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
    }
  }
}

// Initialize video sections when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const videoSections = document.querySelectorAll('.video-section');
  
  videoSections.forEach(section => {
    new VideoSectionManager(section);
  });
});

// Handle dynamic section loading (for theme editor)
document.addEventListener('shopify:section:load', (event) => {
  const videoSection = event.target.querySelector('.video-section');
  if (videoSection) {
    new VideoSectionManager(videoSection);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoSectionManager;
} 