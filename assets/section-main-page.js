/**
 * Main Page Section - Bubbly Style
 * Handles table of contents, social sharing, accessibility, and AI Navigation integration
 */

class MainPageManager {
  constructor(container) {
    this.container = container;
    this.toc = container.querySelector('.main-page__toc');
    this.content = container.querySelector('.main-page__content');
    this.shareButtons = container.querySelectorAll('.main-page__share-button');
    
    // Performance and accessibility settings
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isIntersecting = false;
    this.activeHeading = null;
    this.headings = [];
    this.tocLinks = [];
    
    // AI Navigation integration
    this.aiNavigation = window.AINavigation || null;
    this.interactionData = {
      sectionType: 'main-page',
      interactions: [],
      readingProgress: 0,
      timeSpent: 0
    };
    
    this.init();
  }

  init() {
    this.generateTableOfContents();
    this.setupScrollSpy();
    this.setupSocialSharing();
    this.setupAccessibility();
    this.setupEventListeners();
    this.setupReadingProgress();
    this.trackAINavigation();
    
    // Mark as loaded
    this.container.classList.remove('loading');
    
    console.log('MainPage: Initialized with Bubbly style');
  }

  generateTableOfContents() {
    if (!this.toc || !this.content) return;
    
    // Find all headings in content
    this.headings = Array.from(this.content.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    if (this.headings.length === 0) {
      this.toc.style.display = 'none';
      return;
    }
    
    // Generate TOC structure
    const tocList = this.toc.querySelector('.main-page__toc-list');
    if (!tocList) return;
    
    // Clear existing TOC
    tocList.innerHTML = '';
    
    this.headings.forEach((heading, index) => {
      // Create unique ID if not exists
      if (!heading.id) {
        heading.id = `heading-${index + 1}`;
      }
      
      // Create TOC item
      const tocItem = document.createElement('li');
      tocItem.className = 'main-page__toc-item';
      
      const tocLink = document.createElement('a');
      tocLink.className = 'main-page__toc-link';
      tocLink.href = `#${heading.id}`;
      tocLink.textContent = heading.textContent;
      tocLink.setAttribute('data-heading-id', heading.id);
      
      // Add level class for styling
      const level = parseInt(heading.tagName.charAt(1));
      tocLink.setAttribute('data-level', level);
      
      tocItem.appendChild(tocLink);
      tocList.appendChild(tocItem);
      
      this.tocLinks.push(tocLink);
    });
    
    // Setup smooth scrolling for TOC links
    this.setupSmoothScrolling();
  }

  setupSmoothScrolling() {
    this.tocLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('data-heading-id');
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          this.smoothScrollTo(targetElement);
          this.trackInteraction('toc_click', {
            targetId,
            headingText: targetElement.textContent,
            level: targetElement.tagName
          });
        }
      });
    });
  }

  smoothScrollTo(element) {
    const headerOffset = 100; // Account for fixed header
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    if (this.prefersReducedMotion) {
      window.scrollTo(0, offsetPosition);
    } else {
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  setupScrollSpy() {
    if (!('IntersectionObserver' in window) || this.headings.length === 0) return;
    
    // Create intersection observer for headings
    this.headingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.setActiveHeading(entry.target.id);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-100px 0px -50% 0px'
      }
    );
    
    // Observe all headings
    this.headings.forEach(heading => {
      this.headingObserver.observe(heading);
    });
  }

  setActiveHeading(headingId) {
    if (this.activeHeading === headingId) return;
    
    // Remove active class from all TOC links
    this.tocLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to current TOC link
    const activeLink = this.tocLinks.find(link => 
      link.getAttribute('data-heading-id') === headingId
    );
    
    if (activeLink) {
      activeLink.classList.add('active');
      this.activeHeading = headingId;
      
      // Track heading view
      this.trackInteraction('heading_view', {
        headingId,
        headingText: document.getElementById(headingId)?.textContent
      });
    }
  }

  setupSocialSharing() {
    this.shareButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        const platform = button.dataset.platform;
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const text = encodeURIComponent(this.getPageDescription());
        
        let shareUrl = '';
        
        switch (platform) {
          case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
          case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
          case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
          case 'pinterest':
            shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`;
            break;
          case 'email':
            shareUrl = `mailto:?subject=${title}&body=${text}%20${url}`;
            break;
          default:
            return;
        }
        
        if (platform === 'email') {
          window.location.href = shareUrl;
        } else {
          this.openShareWindow(shareUrl, platform);
        }
        
        this.trackInteraction('social_share', {
          platform,
          url: window.location.href,
          title: document.title
        });
      });
    });
  }

  openShareWindow(url, platform) {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      url,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  }

  getPageDescription() {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      return metaDescription.getAttribute('content');
    }
    
    // Fallback to first paragraph
    const firstParagraph = this.content?.querySelector('p');
    if (firstParagraph) {
      return firstParagraph.textContent.substring(0, 160) + '...';
    }
    
    return document.title;
  }

  setupAccessibility() {
    // Ensure proper ARIA labels for TOC
    if (this.toc) {
      const tocTitle = this.toc.querySelector('.main-page__toc-title');
      if (tocTitle) {
        const tocId = 'toc-' + Date.now();
        tocTitle.id = tocId;
        
        const tocList = this.toc.querySelector('.main-page__toc-list');
        if (tocList) {
          tocList.setAttribute('aria-labelledby', tocId);
          tocList.setAttribute('role', 'navigation');
        }
      }
    }
    
    // Setup keyboard navigation for TOC
    this.setupTOCKeyboardNavigation();
    
    // Setup keyboard navigation for share buttons
    this.setupShareKeyboardNavigation();
    
    // Ensure content has proper heading hierarchy
    this.validateHeadingHierarchy();
  }

  setupTOCKeyboardNavigation() {
    this.tocLinks.forEach((link, index) => {
      link.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            const nextLink = this.tocLinks[index + 1];
            if (nextLink) nextLink.focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            const prevLink = this.tocLinks[index - 1];
            if (prevLink) prevLink.focus();
            break;
          case 'Home':
            e.preventDefault();
            this.tocLinks[0].focus();
            break;
          case 'End':
            e.preventDefault();
            this.tocLinks[this.tocLinks.length - 1].focus();
            break;
        }
      });
    });
  }

  setupShareKeyboardNavigation() {
    const shareButtonsArray = Array.from(this.shareButtons);
    
    shareButtonsArray.forEach((button, index) => {
      button.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            const nextButton = shareButtonsArray[index + 1] || shareButtonsArray[0];
            nextButton.focus();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            const prevButton = shareButtonsArray[index - 1] || shareButtonsArray[shareButtonsArray.length - 1];
            prevButton.focus();
            break;
        }
      });
    });
  }

  validateHeadingHierarchy() {
    if (!this.content) return;
    
    const headings = this.content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      
      if (currentLevel - previousLevel > 1) {
        console.warn(`Heading hierarchy issue: ${heading.tagName} follows h${previousLevel}`, heading);
      }
      
      previousLevel = currentLevel;
    });
  }

  setupReadingProgress() {
    if (!this.content) return;
    
    this.progressObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const progress = this.calculateReadingProgress();
            this.interactionData.readingProgress = progress;
            
            // Track progress milestones
            if (progress >= 25 && !this.milestones?.quarter) {
              this.trackInteraction('reading_progress', { milestone: '25%' });
              this.milestones = { ...this.milestones, quarter: true };
            }
            if (progress >= 50 && !this.milestones?.half) {
              this.trackInteraction('reading_progress', { milestone: '50%' });
              this.milestones = { ...this.milestones, half: true };
            }
            if (progress >= 75 && !this.milestones?.threeQuarter) {
              this.trackInteraction('reading_progress', { milestone: '75%' });
              this.milestones = { ...this.milestones, threeQuarter: true };
            }
            if (progress >= 100 && !this.milestones?.complete) {
              this.trackInteraction('reading_progress', { milestone: '100%' });
              this.milestones = { ...this.milestones, complete: true };
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    
    this.progressObserver.observe(this.content);
    this.milestones = {};
  }

  calculateReadingProgress() {
    if (!this.content) return 0;
    
    const contentRect = this.content.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const contentHeight = contentRect.height;
    const contentTop = contentRect.top;
    
    if (contentTop > windowHeight) return 0;
    if (contentTop + contentHeight < 0) return 100;
    
    const visibleHeight = Math.min(windowHeight - Math.max(contentTop, 0), contentHeight);
    const scrolledHeight = Math.max(0, -contentTop);
    
    return Math.min(100, Math.max(0, (scrolledHeight / contentHeight) * 100));
  }

  setupEventListeners() {
    // Track content interactions
    if (this.content) {
      this.content.addEventListener('click', (e) => {
        if (e.target.matches('a')) {
          this.trackInteraction('content_link_click', {
            url: e.target.href,
            text: e.target.textContent.trim(),
            isExternal: e.target.hostname !== window.location.hostname
          });
        }
      });
    }
    
    // Handle reduced motion preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
    });
    
    // Track time spent
    this.startTime = Date.now();
    this.setupTimeTracking();
  }

  setupTimeTracking() {
    // Track time spent on page
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.interactionData.timeSpent = Date.now() - this.startTime;
      }
    }, 5000); // Update every 5 seconds
    
    // Track when user leaves
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.trackInteraction('page_blur', {
          timeSpent: Date.now() - this.startTime,
          readingProgress: this.interactionData.readingProgress
        });
      }
    });
  }

  trackInteraction(type, data = {}) {
    const interaction = {
      type,
      timestamp: Date.now(),
      data,
      section: 'main-page'
    };
    
    this.interactionData.interactions.push(interaction);
    
    // Send to AI Navigation if available
    if (this.aiNavigation && typeof this.aiNavigation.trackInteraction === 'function') {
      this.aiNavigation.trackInteraction(interaction);
    }
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'main_page_interaction', {
        event_category: 'engagement',
        event_label: type,
        custom_data: data
      });
    }
  }

  trackAINavigation() {
    if (!this.aiNavigation) return;
    
    // Track section view
    this.trackInteraction('section_view', {
      sectionType: 'main-page',
      hasTableOfContents: !!this.toc,
      headingCount: this.headings.length,
      hasSocialSharing: this.shareButtons.length > 0
    });
  }

  // Public method to get interaction data
  getInteractionData() {
    return {
      ...this.interactionData,
      totalInteractions: this.interactionData.interactions.length,
      lastInteraction: this.interactionData.interactions[this.interactionData.interactions.length - 1],
      currentProgress: this.calculateReadingProgress()
    };
  }

  // Cleanup method
  destroy() {
    if (this.headingObserver) {
      this.headingObserver.disconnect();
    }
    
    if (this.progressObserver) {
      this.progressObserver.disconnect();
    }
    
    console.log('MainPage: Destroyed');
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const mainPages = document.querySelectorAll('.main-page');
  
  mainPages.forEach(page => {
    if (!page.dataset.initialized) {
      new MainPageManager(page);
      page.dataset.initialized = 'true';
    }
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainPageManager;
}

// Global access
window.MainPageManager = MainPageManager; 