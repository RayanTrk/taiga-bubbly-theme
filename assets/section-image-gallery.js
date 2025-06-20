/**
 * Image Gallery Section JavaScript - Taiga Theme Bubbly Style
 * Handles lightbox functionality, navigation, and AI Navigation integration
 * Follows shopirule.mdc specifications
 */

class ImageGalleryManager {
  constructor(container) {
    this.container = container;
    this.sectionId = container.dataset.sectionId;
    this.enableLightbox = container.dataset.enableLightbox === 'true';
    this.images = [];
    this.currentImageIndex = 0;
    this.lightbox = null;
    this.observer = null;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }

  init() {
    this.setupImages();
    this.setupIntersectionObserver();
    this.setupEventListeners();
    this.setupAINavigation();
    this.setupAccessibility();
    this.setupBubbleAnimations();
    
    if (this.enableLightbox) {
      this.setupLightbox();
    }
  }

  setupImages() {
    const imageButtons = this.container.querySelectorAll('.image-gallery__image-button');
    
    this.images = Array.from(imageButtons).map((button, index) => ({
      element: button,
      src: button.dataset.imageSrc,
      alt: button.dataset.imageAlt,
      index: index
    }));
  }

  setupLightbox() {
    if (!this.enableLightbox) return;

    this.lightbox = this.container.querySelector('.image-gallery__lightbox');
    if (!this.lightbox) return;

    const closeButton = this.lightbox.querySelector('.image-gallery__lightbox-close');
    const overlay = this.lightbox.querySelector('.image-gallery__lightbox-overlay');
    const prevButton = this.lightbox.querySelector('.image-gallery__lightbox-prev');
    const nextButton = this.lightbox.querySelector('.image-gallery__lightbox-next');

    // Close lightbox events
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeLightbox());
    }
    
    if (overlay) {
      overlay.addEventListener('click', () => this.closeLightbox());
    }

    // Navigation events
    if (prevButton) {
      prevButton.addEventListener('click', () => this.showPreviousImage());
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', () => this.showNextImage());
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('is-open')) return;
      
      switch (e.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowLeft':
          this.showPreviousImage();
          break;
        case 'ArrowRight':
          this.showNextImage();
          break;
      }
    });

    // Prevent body scroll when lightbox is open
    this.lightbox.addEventListener('transitionend', () => {
      if (this.lightbox.classList.contains('is-open')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleGalleryInView();
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -10% 0px'
    });

    this.observer.observe(this.container);
  }

  handleGalleryInView() {
    // Trigger AI Navigation learning
    this.trackAINavigation('gallery_viewed');
    
    // Animate items if not already animated
    const items = this.container.querySelectorAll('.image-gallery__item');
    items.forEach((item, index) => {
      if (!item.style.animationDelay && !this.isReducedMotion) {
        item.style.animationDelay = `${index * 0.1}s`;
      }
    });
  }

  setupEventListeners() {
    // Image click events for lightbox
    this.images.forEach((image, index) => {
      image.element.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.enableLightbox) {
          this.openLightbox(index);
        }
      });

      // Track image interactions
      image.element.addEventListener('click', () => {
        this.trackImageInteraction('image_click', index);
      });
    });

    // Handle resize for responsive behavior
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));

    // Handle preload on hover
    this.images.forEach(image => {
      image.element.addEventListener('mouseenter', () => {
        this.preloadImage(image.src);
      });
    });
  }

  openLightbox(index) {
    if (!this.lightbox || !this.images[index]) return;

    this.currentImageIndex = index;
    const image = this.images[index];
    
    // Update lightbox image
    const lightboxImage = this.lightbox.querySelector('.image-gallery__lightbox-image');
    if (lightboxImage) {
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
    }

    // Show lightbox
    this.lightbox.classList.add('is-open');
    this.lightbox.setAttribute('aria-hidden', 'false');
    
    // Focus management
    const closeButton = this.lightbox.querySelector('.image-gallery__lightbox-close');
    if (closeButton) {
      closeButton.focus();
    }

    // Update navigation button states
    this.updateNavigationButtons();
    
    // Track lightbox open
    this.trackImageInteraction('lightbox_open', index);
  }

  closeLightbox() {
    if (!this.lightbox) return;

    this.lightbox.classList.remove('is-open');
    this.lightbox.setAttribute('aria-hidden', 'true');
    
    // Return focus to the image that opened the lightbox
    const originalImage = this.images[this.currentImageIndex];
    if (originalImage && originalImage.element) {
      originalImage.element.focus();
    }
    
    // Track lightbox close
    this.trackImageInteraction('lightbox_close', this.currentImageIndex);
  }

  showPreviousImage() {
    if (this.images.length <= 1) return;
    
    this.currentImageIndex = this.currentImageIndex === 0 
      ? this.images.length - 1 
      : this.currentImageIndex - 1;
    
    this.updateLightboxImage();
    this.trackImageInteraction('lightbox_previous', this.currentImageIndex);
  }

  showNextImage() {
    if (this.images.length <= 1) return;
    
    this.currentImageIndex = this.currentImageIndex === this.images.length - 1 
      ? 0 
      : this.currentImageIndex + 1;
    
    this.updateLightboxImage();
    this.trackImageInteraction('lightbox_next', this.currentImageIndex);
  }

  updateLightboxImage() {
    if (!this.lightbox || !this.images[this.currentImageIndex]) return;

    const lightboxImage = this.lightbox.querySelector('.image-gallery__lightbox-image');
    const image = this.images[this.currentImageIndex];
    
    if (lightboxImage) {
      // Add loading state
      lightboxImage.style.opacity = '0.5';
      
      // Preload new image
      const newImage = new Image();
      newImage.onload = () => {
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxImage.style.opacity = '1';
      };
      newImage.src = image.src;
    }

    this.updateNavigationButtons();
  }

  updateNavigationButtons() {
    if (!this.lightbox) return;

    const prevButton = this.lightbox.querySelector('.image-gallery__lightbox-prev');
    const nextButton = this.lightbox.querySelector('.image-gallery__lightbox-next');
    
    if (this.images.length <= 1) {
      if (prevButton) prevButton.style.display = 'none';
      if (nextButton) nextButton.style.display = 'none';
    } else {
      if (prevButton) prevButton.style.display = 'flex';
      if (nextButton) nextButton.style.display = 'flex';
    }
  }

  preloadImage(src) {
    if (!src) return;
    
    const image = new Image();
    image.src = src;
  }

  setupAINavigation() {
    // Initialize AI Navigation tracking for gallery interactions
    if (typeof window.AINavigation !== 'undefined') {
      window.AINavigation.trackElement(this.container, {
        type: 'image_gallery',
        sectionId: this.sectionId,
        imageCount: this.images.length,
        hasLightbox: this.enableLightbox
      });
    }
  }

  setupAccessibility() {
    // Ensure proper ARIA labels and roles
    const images = this.container.querySelectorAll('.image-gallery__image');
    const buttons = this.container.querySelectorAll('.image-gallery__image-button');
    
    images.forEach((img, index) => {
      if (!img.getAttribute('alt')) {
        img.setAttribute('alt', `Gallery image ${index + 1}`);
      }
    });
    
    buttons.forEach((button, index) => {
      if (!button.getAttribute('aria-label')) {
        button.setAttribute('aria-label', `View image ${index + 1} in lightbox`);
      }
    });

    // Handle focus management for buttons
    buttons.forEach(button => {
      button.addEventListener('focus', () => {
        button.style.outline = '2px solid var(--color-accent)';
        button.style.outlineOffset = '4px';
      });
      
      button.addEventListener('blur', () => {
        button.style.outline = '';
        button.style.outlineOffset = '';
      });
    });
  }

  setupBubbleAnimations() {
    if (this.isReducedMotion) return;

    const bubbles = this.container.querySelectorAll('.image-gallery__bubble');
    
    bubbles.forEach((bubble, index) => {
      // Add random movement variation
      const randomDelay = Math.random() * 8;
      const randomDuration = 25 + Math.random() * 10;
      
      bubble.style.animationDelay = `-${randomDelay}s`;
      bubble.style.animationDuration = `${randomDuration}s`;
      
      // Add mouse interaction
      bubble.addEventListener('mouseenter', () => {
        if (!this.isReducedMotion) {
          bubble.style.transform = 'scale(1.2)';
          bubble.style.opacity = '0.6';
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

  trackImageInteraction(action, imageIndex) {
    // Track image interactions for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'image_gallery_interaction', {
        gallery_action: action,
        image_index: imageIndex,
        total_images: this.images.length,
        section_id: this.sectionId
      });
    }

    // Track for AI Navigation
    this.trackAINavigation(`gallery_${action}`, {
      imageIndex: imageIndex,
      totalImages: this.images.length
    });
  }

  trackAINavigation(event, data = {}) {
    if (typeof window.AINavigation !== 'undefined') {
      window.AINavigation.track(event, {
        section: 'image_gallery',
        sectionId: this.sectionId,
        ...data
      });
    }
  }

  handleResize() {
    // Handle responsive behavior
    const isMobile = window.innerWidth <= 750;
    const bubbles = this.container.querySelectorAll('.image-gallery__bubble');
    
    if (isMobile) {
      bubbles.forEach(bubble => {
        bubble.style.display = 'none';
      });
    } else {
      bubbles.forEach(bubble => {
        bubble.style.display = '';
      });
    }

    // Update lightbox positioning if open
    if (this.lightbox && this.lightbox.classList.contains('is-open')) {
      this.updateLightboxImage();
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
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeydown);
    
    // Close lightbox if open
    if (this.lightbox && this.lightbox.classList.contains('is-open')) {
      this.closeLightbox();
    }
  }
}

// Initialize image galleries when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const imageGalleries = document.querySelectorAll('.image-gallery');
  
  imageGalleries.forEach(gallery => {
    new ImageGalleryManager(gallery);
  });
});

// Handle dynamic section loading (for theme editor)
document.addEventListener('shopify:section:load', (event) => {
  const imageGallery = event.target.querySelector('.image-gallery');
  if (imageGallery) {
    new ImageGalleryManager(imageGallery);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageGalleryManager;
} 