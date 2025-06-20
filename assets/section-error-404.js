/**
 * Error 404 Page - Bubbly Theme JavaScript
 * Handles search functionality and interactive elements
 */

class Error404Manager {
  constructor() {
    this.searchForm = document.querySelector('.search-form');
    this.searchInput = document.querySelector('.search-input');
    this.searchButton = document.querySelector('.search-button');
    this.linkCards = document.querySelectorAll('.link-card');
    this.categoryCards = document.querySelectorAll('.category-card');
    this.contactMethods = document.querySelectorAll('.contact-method');
    this.bubbles = document.querySelectorAll('.bubble');
    
    this.searchDebounceTimer = null;
    this.searchSuggestions = [];
    
    this.init();
  }
  
  init() {
    this.setupSearchFunctionality();
    this.setupInteractiveElements();
    this.setupBubbleAnimations();
    this.setupKeyboardNavigation();
    this.setupAnalytics();
    this.setupAccessibility();
  }
  
  setupSearchFunctionality() {
    if (!this.searchForm || !this.searchInput) return;
    
    // Real-time search suggestions
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(() => {
        this.handleSearchInput(e.target.value);
      }, 300);
    });
    
    // Form submission
    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSearchSubmit();
    });
    
    // Search button click
    if (this.searchButton) {
      this.searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSearchSubmit();
      });
    }
    
    // Focus management
    this.searchInput.addEventListener('focus', () => {
      this.searchInput.parentElement.classList.add('focused');
    });
    
    this.searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        this.searchInput.parentElement.classList.remove('focused');
      }, 100);
    });
  }
  
  handleSearchInput(query) {
    if (query.length < 2) {
      this.hideSuggestions();
      return;
    }
    
    // Track search input
    this.trackEvent('search_input', {
      query: query,
      query_length: query.length
    });
    
    // Here you would typically fetch suggestions from Shopify
    // For now, we'll simulate with common search terms
    const commonTerms = [
      'dresses', 'shirts', 'pants', 'shoes', 'accessories',
      'sale', 'new arrivals', 'summer collection', 'winter wear'
    ];
    
    const suggestions = commonTerms.filter(term => 
      term.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    this.showSuggestions(suggestions);
  }
  
  showSuggestions(suggestions) {
    // Remove existing suggestions
    this.hideSuggestions();
    
    if (suggestions.length === 0) return;
    
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    suggestionsContainer.setAttribute('role', 'listbox');
    suggestionsContainer.setAttribute('aria-label', 'Search suggestions');
    
    suggestions.forEach((suggestion, index) => {
      const suggestionItem = document.createElement('div');
      suggestionItem.className = 'search-suggestion';
      suggestionItem.setAttribute('role', 'option');
      suggestionItem.setAttribute('aria-selected', 'false');
      suggestionItem.textContent = suggestion;
      
      suggestionItem.addEventListener('click', () => {
        this.selectSuggestion(suggestion);
      });
      
      suggestionItem.addEventListener('mouseenter', () => {
        this.highlightSuggestion(index);
      });
      
      suggestionsContainer.appendChild(suggestionItem);
    });
    
    this.searchInput.parentElement.appendChild(suggestionsContainer);
    this.searchSuggestions = suggestions;
  }
  
  hideSuggestions() {
    const existingSuggestions = document.querySelector('.search-suggestions');
    if (existingSuggestions) {
      existingSuggestions.remove();
    }
    this.searchSuggestions = [];
  }
  
  selectSuggestion(suggestion) {
    this.searchInput.value = suggestion;
    this.hideSuggestions();
    this.handleSearchSubmit();
  }
  
  highlightSuggestion(index) {
    const suggestions = document.querySelectorAll('.search-suggestion');
    suggestions.forEach((suggestion, i) => {
      suggestion.classList.toggle('highlighted', i === index);
      suggestion.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }
  
  handleSearchSubmit() {
    const query = this.searchInput.value.trim();
    if (!query) return;
    
    // Add loading state
    this.searchButton.classList.add('loading');
    
    // Track search submission
    this.trackEvent('search_submit', {
      query: query,
      source: '404_page'
    });
    
    // Redirect to search results
    const searchUrl = `/search?q=${encodeURIComponent(query)}`;
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      window.location.href = searchUrl;
    }, 500);
  }
  
  setupInteractiveElements() {
    // Link cards hover effects
    this.linkCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.animateCard(card, 'enter');
      });
      
      card.addEventListener('mouseleave', () => {
        this.animateCard(card, 'leave');
      });
      
      card.addEventListener('click', (e) => {
        this.trackEvent('quick_link_click', {
          link_text: card.querySelector('.link-text')?.textContent,
          link_url: card.href
        });
      });
    });
    
    // Category cards
    this.categoryCards.forEach(card => {
      card.addEventListener('click', (e) => {
        this.trackEvent('category_click', {
          category_name: card.querySelector('.category-title')?.textContent,
          category_url: card.href
        });
      });
    });
    
    // Contact methods
    this.contactMethods.forEach(method => {
      method.addEventListener('click', (e) => {
        this.trackEvent('contact_click', {
          contact_type: method.href.includes('mailto:') ? 'email' : 'phone',
          contact_value: method.querySelector('.contact-text')?.textContent
        });
      });
    });
  }
  
  animateCard(card, direction) {
    const icon = card.querySelector('.link-icon, .contact-icon');
    if (!icon) return;
    
    if (direction === 'enter') {
      icon.style.transform = 'scale(1.1) rotate(5deg)';
    } else {
      icon.style.transform = 'scale(1) rotate(0deg)';
    }
  }
  
  setupBubbleAnimations() {
    // Enhanced bubble animations based on user interaction
    this.bubbles.forEach((bubble, index) => {
      const delay = index * 0.5;
      const duration = 6 + (index % 3);
      
      bubble.style.animationDelay = `${delay}s`;
      bubble.style.animationDuration = `${duration}s`;
      
      // Add random movement on hover
      bubble.addEventListener('mouseenter', () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          bubble.style.transform += ' scale(1.2)';
        }
      });
      
      bubble.addEventListener('mouseleave', () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          bubble.style.transform = bubble.style.transform.replace(' scale(1.2)', '');
        }
      });
    });
  }
  
  setupKeyboardNavigation() {
    // Enhanced keyboard navigation for search suggestions
    this.searchInput.addEventListener('keydown', (e) => {
      const suggestions = document.querySelectorAll('.search-suggestion');
      const highlighted = document.querySelector('.search-suggestion.highlighted');
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (suggestions.length === 0) return;
          
          const nextIndex = highlighted ? 
            Array.from(suggestions).indexOf(highlighted) + 1 : 0;
          
          if (nextIndex < suggestions.length) {
            this.highlightSuggestion(nextIndex);
          } else {
            this.highlightSuggestion(0);
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (suggestions.length === 0) return;
          
          const prevIndex = highlighted ? 
            Array.from(suggestions).indexOf(highlighted) - 1 : suggestions.length - 1;
          
          if (prevIndex >= 0) {
            this.highlightSuggestion(prevIndex);
          } else {
            this.highlightSuggestion(suggestions.length - 1);
          }
          break;
          
        case 'Enter':
          if (highlighted) {
            e.preventDefault();
            this.selectSuggestion(highlighted.textContent);
          }
          break;
          
        case 'Escape':
          this.hideSuggestions();
          this.searchInput.blur();
          break;
      }
    });
  }
  
  setupAnalytics() {
    // Track page view
    this.trackEvent('404_page_view', {
      referrer: document.referrer,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
    
    // Track time spent on page
    this.startTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
      const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
      this.trackEvent('404_page_time', {
        time_spent_seconds: timeSpent
      });
    });
  }
  
  setupAccessibility() {
    // Announce dynamic content changes to screen readers
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    document.body.appendChild(this.announcer);
    
    // High contrast mode support
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.body.classList.add('high-contrast');
    }
    
    // Reduced motion support
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');
    }
  }
  
  announce(message) {
    this.announcer.textContent = message;
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 1000);
  }
  
  trackEvent(eventName, properties = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: '404_page',
        ...properties
      });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('trackCustom', eventName, properties);
    }
    
    // Shopify Analytics
    if (typeof ShopifyAnalytics !== 'undefined') {
      ShopifyAnalytics.lib.track(eventName, properties);
    }
    
    // Console log for debugging
    if (window.Shopify && window.Shopify.designMode) {
      console.log('404 Page Event:', eventName, properties);
    }
  }
  
  // Utility methods
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
}

// CSS for search suggestions (injected dynamically)
const suggestionsCSS = `
  .search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e0e6ed;
    border-top: none;
    border-radius: 0 0 25px 25px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .search-suggestion {
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border-bottom: 1px solid #f5f5f5;
  }
  
  .search-suggestion:last-child {
    border-bottom: none;
  }
  
  .search-suggestion:hover,
  .search-suggestion.highlighted {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    color: #667eea;
  }
  
  .search-input-wrapper {
    position: relative;
  }
  
  .search-input-wrapper.focused .search-input {
    border-radius: 25px 25px 0 0;
  }
  
  .search-button.loading {
    pointer-events: none;
  }
  
  .search-button.loading svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = suggestionsCSS;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Error404Manager();
  });
} else {
  new Error404Manager();
}

// Export for potential external use
window.Error404Manager = Error404Manager; 