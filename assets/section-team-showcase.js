/**
 * Team Showcase Section - Bubbly Style
 * Handles team member interactions, modal displays, accessibility, and AI Navigation integration
 */

class TeamShowcaseManager {
  constructor(container) {
    this.container = container;
    this.memberCards = container.querySelectorAll('.team-showcase__member');
    this.grid = container.querySelector('.team-showcase__grid');
    
    // Modal elements
    this.modal = null;
    this.modalOverlay = null;
    this.currentMember = null;
    
    // Performance and accessibility settings
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isModalOpen = false;
    this.focusableElements = [];
    this.lastFocusedElement = null;
    
    // AI Navigation integration
    this.aiNavigation = window.AINavigation || null;
    this.interactionData = {
      sectionType: 'team-showcase',
      interactions: [],
      memberViews: [],
      socialClicks: []
    };
    
    this.init();
  }

  init() {
    this.createModal();
    this.setupMemberCards();
    this.setupAccessibility();
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.trackAINavigation();
    
    // Mark as loaded
    this.container.classList.remove('loading');
    
    console.log('TeamShowcase: Initialized with Bubbly style');
  }

  createModal() {
    // Create modal structure
    this.modal = document.createElement('div');
    this.modal.className = 'team-showcase__modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.style.display = 'none';
    
    this.modal.innerHTML = `
      <div class="team-showcase__modal-overlay" aria-hidden="true"></div>
      <div class="team-showcase__modal-content">
        <button class="team-showcase__modal-close" aria-label="Close team member details">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="team-showcase__modal-body">
          <div class="team-showcase__modal-image">
            <img src="" alt="" class="team-showcase__modal-photo">
          </div>
          <div class="team-showcase__modal-info">
            <h3 class="team-showcase__modal-name"></h3>
            <p class="team-showcase__modal-position"></p>
            <div class="team-showcase__modal-bio"></div>
            <div class="team-showcase__modal-social"></div>
          </div>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(this.modal);
    
    // Store references
    this.modalOverlay = this.modal.querySelector('.team-showcase__modal-overlay');
    this.modalContent = this.modal.querySelector('.team-showcase__modal-content');
    this.modalClose = this.modal.querySelector('.team-showcase__modal-close');
    
    // Setup modal event listeners
    this.setupModalEvents();
  }

  setupModalEvents() {
    // Close button
    this.modalClose.addEventListener('click', () => this.closeModal());
    
    // Overlay click
    this.modalOverlay.addEventListener('click', () => this.closeModal());
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        this.closeModal();
      }
    });
    
    // Trap focus in modal
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.isModalOpen) {
        this.trapFocus(e);
      }
    });
  }

  setupMemberCards() {
    this.memberCards.forEach((card, index) => {
      // Add click handler
      card.addEventListener('click', () => {
        this.openMemberModal(card);
      });
      
      // Add keyboard handler
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openMemberModal(card);
        }
      });
      
      // Make cards focusable
      if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
      }
      
      // Add ARIA label
      const name = card.querySelector('.team-showcase__member-name')?.textContent || 'Team member';
      const position = card.querySelector('.team-showcase__member-position')?.textContent || '';
      card.setAttribute('aria-label', `View details for ${name}${position ? ', ' + position : ''}`);
      
      // Setup hover effects (only if not reduced motion)
      if (!this.prefersReducedMotion) {
        this.setupCardHoverEffects(card);
      }
      
      // Setup social links within cards
      this.setupCardSocialLinks(card);
    });
  }

  setupCardHoverEffects(card) {
    const image = card.querySelector('.team-showcase__member-image');
    const overlay = card.querySelector('.team-showcase__member-overlay');
    
    if (!image || !overlay) return;
    
    card.addEventListener('mouseenter', () => {
      if (!this.prefersReducedMotion) {
        image.style.transform = 'scale(1.05)';
        overlay.style.opacity = '1';
      }
    });
    
    card.addEventListener('mouseleave', () => {
      if (!this.prefersReducedMotion) {
        image.style.transform = 'scale(1)';
        overlay.style.opacity = '0';
      }
    });
  }

  setupCardSocialLinks(card) {
    const socialLinks = card.querySelectorAll('.team-showcase__member-social a');
    
    socialLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click
        
        const platform = this.getSocialPlatform(link.href);
        const memberName = card.querySelector('.team-showcase__member-name')?.textContent || 'Unknown';
        
        this.trackInteraction('social_click', {
          platform,
          memberName,
          url: link.href,
          context: 'card'
        });
      });
    });
  }

  openMemberModal(card) {
    this.currentMember = card;
    this.lastFocusedElement = document.activeElement;
    
    // Extract member data
    const memberData = this.extractMemberData(card);
    
    // Populate modal
    this.populateModal(memberData);
    
    // Show modal
    this.showModal();
    
    // Track interaction
    this.trackInteraction('member_modal_open', {
      memberName: memberData.name,
      memberPosition: memberData.position
    });
  }

  extractMemberData(card) {
    const image = card.querySelector('.team-showcase__member-image img');
    const name = card.querySelector('.team-showcase__member-name');
    const position = card.querySelector('.team-showcase__member-position');
    const bio = card.querySelector('.team-showcase__member-bio');
    const socialLinks = card.querySelectorAll('.team-showcase__member-social a');
    
    return {
      image: image ? {
        src: image.src,
        alt: image.alt || name?.textContent || 'Team member'
      } : null,
      name: name?.textContent || 'Team Member',
      position: position?.textContent || '',
      bio: bio?.innerHTML || bio?.textContent || '',
      socialLinks: Array.from(socialLinks).map(link => ({
        url: link.href,
        platform: this.getSocialPlatform(link.href),
        text: link.textContent || link.getAttribute('aria-label') || 'Social link'
      }))
    };
  }

  populateModal(data) {
    // Image
    const modalImage = this.modal.querySelector('.team-showcase__modal-photo');
    if (data.image && modalImage) {
      modalImage.src = data.image.src;
      modalImage.alt = data.image.alt;
    }
    
    // Name
    const modalName = this.modal.querySelector('.team-showcase__modal-name');
    if (modalName) {
      modalName.textContent = data.name;
    }
    
    // Position
    const modalPosition = this.modal.querySelector('.team-showcase__modal-position');
    if (modalPosition) {
      modalPosition.textContent = data.position;
    }
    
    // Bio
    const modalBio = this.modal.querySelector('.team-showcase__modal-bio');
    if (modalBio) {
      modalBio.innerHTML = data.bio;
    }
    
    // Social links
    const modalSocial = this.modal.querySelector('.team-showcase__modal-social');
    if (modalSocial && data.socialLinks.length > 0) {
      modalSocial.innerHTML = data.socialLinks.map(link => `
        <a href="${link.url}" 
           class="team-showcase__modal-social-link" 
           target="_blank" 
           rel="noopener noreferrer"
           aria-label="Visit ${data.name}'s ${link.platform} profile">
          ${this.getSocialIcon(link.platform)}
          <span class="visually-hidden">${link.platform}</span>
        </a>
      `).join('');
      
      // Setup social link tracking
      this.setupModalSocialLinks(data.name);
    }
    
    // Update modal title
    this.modal.setAttribute('aria-labelledby', 'modal-title-' + Date.now());
    modalName.id = this.modal.getAttribute('aria-labelledby');
  }

  setupModalSocialLinks(memberName) {
    const socialLinks = this.modal.querySelectorAll('.team-showcase__modal-social-link');
    
    socialLinks.forEach(link => {
      link.addEventListener('click', () => {
        const platform = this.getSocialPlatform(link.href);
        
        this.trackInteraction('social_click', {
          platform,
          memberName,
          url: link.href,
          context: 'modal'
        });
      });
    });
  }

  showModal() {
    this.modal.style.display = 'flex';
    this.modal.setAttribute('aria-hidden', 'false');
    this.isModalOpen = true;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus management
    this.focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    // Focus first element (close button)
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
    
    // Add animation class if not reduced motion
    if (!this.prefersReducedMotion) {
      requestAnimationFrame(() => {
        this.modal.classList.add('team-showcase__modal--open');
      });
    } else {
      this.modal.classList.add('team-showcase__modal--open');
    }
  }

  closeModal() {
    if (!this.isModalOpen) return;
    
    this.modal.setAttribute('aria-hidden', 'true');
    this.isModalOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }
    
    // Animation
    if (!this.prefersReducedMotion) {
      this.modal.classList.remove('team-showcase__modal--open');
      setTimeout(() => {
        this.modal.style.display = 'none';
      }, 300); // Match CSS transition duration
    } else {
      this.modal.classList.remove('team-showcase__modal--open');
      this.modal.style.display = 'none';
    }
    
    // Track interaction
    if (this.currentMember) {
      const memberName = this.currentMember.querySelector('.team-showcase__member-name')?.textContent || 'Unknown';
      this.trackInteraction('member_modal_close', {
        memberName
      });
    }
    
    this.currentMember = null;
  }

  trapFocus(e) {
    if (this.focusableElements.length === 0) return;
    
    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  getSocialPlatform(url) {
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('github.com')) return 'GitHub';
    if (url.includes('dribbble.com')) return 'Dribbble';
    if (url.includes('behance.net')) return 'Behance';
    if (url.includes('youtube.com')) return 'YouTube';
    return 'Social Media';
  }

  getSocialIcon(platform) {
    const icons = {
      'Facebook': '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
      'Twitter': '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
      'LinkedIn': '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
      'Instagram': '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
      'GitHub': '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.180 1.896-.406 3.482-.406 3.482s-.201 1.725-.804 2.426C15.447 14.98 12 15 12 15s-3.447-.02-4.358-.932c-.603-.701-.804-2.426-.804-2.426s-.226-1.586-.406-3.482C6.251 7.098 6.251 6.914 6.251 6.914s.179-.637.895-.637c.716 0 .895.637.895.637l1.104 2.395s.537-.895 1.855-.895 1.855.895 1.855.895l1.104-2.395s.179-.637.895-.637c.716 0 .895.637.895.637s0 .184-.181 1.246z"/></svg>'
    };
    
    return icons[platform] || '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.180 1.896-.406 3.482-.406 3.482s-.201 1.725-.804 2.426C15.447 14.98 12 15 12 15s-3.447-.02-4.358-.932c-.603-.701-.804-2.426-.804-2.426s-.226-1.586-.406-3.482C6.251 7.098 6.251 6.914 6.251 6.914s.179-.637.895-.637c.716 0 .895.637.895.637s0 .184-.181 1.246z"/></svg>';
  }

  setupAccessibility() {
    // Ensure proper ARIA labels and roles
    this.memberCards.forEach(card => {
      if (!card.getAttribute('role')) {
        card.setAttribute('role', 'button');
      }
    });
    
    // Add keyboard navigation between cards
    this.setupCardKeyboardNavigation();
  }

  setupCardKeyboardNavigation() {
    const cardsArray = Array.from(this.memberCards);
    
    cardsArray.forEach((card, index) => {
      card.addEventListener('keydown', (e) => {
        let targetIndex = -1;
        
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            targetIndex = (index + 1) % cardsArray.length;
            break;
          case 'ArrowLeft':
            e.preventDefault();
            targetIndex = (index - 1 + cardsArray.length) % cardsArray.length;
            break;
          case 'ArrowDown':
            e.preventDefault();
            // Move to next row (assuming 3 cards per row on desktop)
            targetIndex = Math.min(index + 3, cardsArray.length - 1);
            break;
          case 'ArrowUp':
            e.preventDefault();
            // Move to previous row
            targetIndex = Math.max(index - 3, 0);
            break;
          case 'Home':
            e.preventDefault();
            targetIndex = 0;
            break;
          case 'End':
            e.preventDefault();
            targetIndex = cardsArray.length - 1;
            break;
        }
        
        if (targetIndex >= 0 && targetIndex < cardsArray.length) {
          cardsArray[targetIndex].focus();
        }
      });
    });
  }

  setupEventListeners() {
    // Handle reduced motion preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
    });
    
    // Handle resize events
    window.addEventListener('resize', this.debounce(() => {
      if (this.isModalOpen) {
        // Adjust modal positioning if needed
        this.adjustModalPosition();
      }
    }, 250));
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    
    // Observe when team section comes into view
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.trackInteraction('section_view', {
              memberCount: this.memberCards.length
            });
            
            // Trigger entrance animations if not reduced motion
            if (!this.prefersReducedMotion) {
              this.animateCardsEntrance();
            }
          }
        });
      },
      { threshold: 0.2 }
    );
    
    this.sectionObserver.observe(this.container);
  }

  animateCardsEntrance() {
    this.memberCards.forEach((card, index) => {
      if (!card.classList.contains('animated')) {
        setTimeout(() => {
          card.classList.add('team-showcase__member--animate-in');
          card.classList.add('animated');
        }, index * 100); // Stagger animation
      }
    });
  }

  adjustModalPosition() {
    // Ensure modal is properly positioned on resize
    if (this.modalContent) {
      const rect = this.modalContent.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.height > windowHeight * 0.9) {
        this.modalContent.style.maxHeight = windowHeight * 0.9 + 'px';
        this.modalContent.style.overflowY = 'auto';
      }
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

  trackInteraction(type, data = {}) {
    const interaction = {
      type,
      timestamp: Date.now(),
      data,
      section: 'team-showcase'
    };
    
    this.interactionData.interactions.push(interaction);
    
    // Send to AI Navigation if available
    if (this.aiNavigation && typeof this.aiNavigation.trackInteraction === 'function') {
      this.aiNavigation.trackInteraction(interaction);
    }
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'team_showcase_interaction', {
        event_category: 'engagement',
        event_label: type,
        custom_data: data
      });
    }
  }

  trackAINavigation() {
    if (!this.aiNavigation) return;
    
    // Track section initialization
    this.trackInteraction('section_init', {
      sectionType: 'team-showcase',
      memberCount: this.memberCards.length,
      hasModal: true
    });
  }

  // Public method to get interaction data
  getInteractionData() {
    return {
      ...this.interactionData,
      totalInteractions: this.interactionData.interactions.length,
      lastInteraction: this.interactionData.interactions[this.interactionData.interactions.length - 1],
      isModalOpen: this.isModalOpen,
      currentMember: this.currentMember ? {
        name: this.currentMember.querySelector('.team-showcase__member-name')?.textContent,
        position: this.currentMember.querySelector('.team-showcase__member-position')?.textContent
      } : null
    };
  }

  // Cleanup method
  destroy() {
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
    
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
    
    // Restore body scroll if modal was open
    if (this.isModalOpen) {
      document.body.style.overflow = '';
    }
    
    console.log('TeamShowcase: Destroyed');
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const teamSections = document.querySelectorAll('.team-showcase');
  
  teamSections.forEach(section => {
    if (!section.dataset.initialized) {
      new TeamShowcaseManager(section);
      section.dataset.initialized = 'true';
    }
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TeamShowcaseManager;
}

// Global access
window.TeamShowcaseManager = TeamShowcaseManager; 