/**
 * Search Header Manager - Bubbly Style Implementation
 * Follows shopirule.mdc specifications for search functionality
 * 
 * Features:
 * - Live search with AJAX
 * - Search suggestions and autocomplete
 * - Keyboard navigation
 * - AI Navigation integration
 * - Performance optimizations
 * - WCAG 2.1 AA accessibility
 * - Touch-friendly interactions
 */

class SearchHeaderManager {
  constructor() {
    this.searchForm = document.querySelector('[data-search-form]');
    this.searchInput = document.querySelector('[data-search-input]');
    this.searchButton = document.querySelector('[data-search-button]');
    this.searchSuggestions = document.querySelector('[data-search-suggestions]');
    this.searchResults = document.querySelector('[data-search-results]');
    this.searchStats = document.querySelector('[data-search-stats]');
    this.clearButton = document.querySelector('[data-search-clear]');
    this.filterToggle = document.querySelector('[data-filter-toggle]');
    this.viewToggle = document.querySelector('[data-view-toggle]');
    
    // Configuration
    this.config = {
      minSearchLength: 2,
      searchDelay: 300,
      maxSuggestions: 8,
      enableLiveSearch: true,
      enableAnalytics: true,
      enableAI: true
    };
    
    // State management
    this.state = {
      isSearching: false,
      currentQuery: '',
      searchResults: [],
      suggestions: [],
      selectedSuggestion: -1,
      viewMode: localStorage.getItem('search-view-mode') || 'grid'
    };
    
    // Timers and requests
    this.searchTimeout = null;
    this.currentRequest = null;
    
    this.init();
  }
  
  init() {
    if (!this.searchForm || !this.searchInput) return;
    
    this.setupEventListeners();
    this.setupKeyboardNavigation();
    this.setupAccessibility();
    this.setupBubbleAnimations();
    this.initializeViewMode();
    this.loadSearchHistory();
    
    // AI Navigation integration
    if (this.config.enableAI && window.AINavigation) {
      window.AINavigation.trackComponent('search-header', {
        component: 'SearchHeaderManager',
        version: '1.0.0',
        features: ['live-search', 'suggestions', 'keyboard-nav']
      });
    }
    
    console.log('SearchHeaderManager initialized with Bubbly style');
  }
  
  setupEventListeners() {
    // Search input events
    this.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
    this.searchInput.addEventListener('focus', this.handleSearchFocus.bind(this));
    this.searchInput.addEventListener('blur', this.handleSearchBlur.bind(this));
    
    // Form submission
    this.searchForm.addEventListener('submit', this.handleSearchSubmit.bind(this));
    
    // Clear button
    if (this.clearButton) {
      this.clearButton.addEventListener('click', this.clearSearch.bind(this));
    }
    
    // Filter toggle
    if (this.filterToggle) {
      this.filterToggle.addEventListener('click', this.toggleFilters.bind(this));
    }
    
    // View toggle
    if (this.viewToggle) {
      this.viewToggle.addEventListener('click', this.toggleView.bind(this));
    }
    
    // Suggestion clicks
    if (this.searchSuggestions) {
      this.searchSuggestions.addEventListener('click', this.handleSuggestionClick.bind(this));
    }
    
    // Outside clicks to close suggestions
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    
    // Window resize for responsive adjustments
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
  }
  
  setupKeyboardNavigation() {
    this.searchInput.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.navigateSuggestions(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.navigateSuggestions(-1);
          break;
        case 'Enter':
          if (this.state.selectedSuggestion >= 0) {
            e.preventDefault();
            this.selectSuggestion(this.state.selectedSuggestion);
          }
          break;
        case 'Escape':
          this.hideSuggestions();
          this.searchInput.blur();
          break;
        case 'Tab':
          this.hideSuggestions();
          break;
      }
    });
  }
  
  setupAccessibility() {
    // ARIA attributes
    this.searchInput.setAttribute('aria-expanded', 'false');
    this.searchInput.setAttribute('aria-haspopup', 'listbox');
    this.searchInput.setAttribute('aria-autocomplete', 'list');
    
    if (this.searchSuggestions) {
      this.searchSuggestions.setAttribute('role', 'listbox');
      this.searchSuggestions.setAttribute('aria-label', 'Suggestions de recherche');
    }
    
    // Screen reader announcements
    this.createAriaLiveRegion();
  }
  
  createAriaLiveRegion() {
    this.ariaLiveRegion = document.createElement('div');
    this.ariaLiveRegion.setAttribute('aria-live', 'polite');
    this.ariaLiveRegion.setAttribute('aria-atomic', 'true');
    this.ariaLiveRegion.className = 'sr-only';
    document.body.appendChild(this.ariaLiveRegion);
  }
  
  announceToScreenReader(message) {
    if (this.ariaLiveRegion) {
      this.ariaLiveRegion.textContent = message;
      setTimeout(() => {
        this.ariaLiveRegion.textContent = '';
      }, 1000);
    }
  }
  
  setupBubbleAnimations() {
    // Create floating bubbles for Bubbly style
    const bubbleContainer = document.querySelector('.search-header__bubbles');
    if (!bubbleContainer) return;
    
    const bubbleCount = 8;
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'search-header__bubble';
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.animationDelay = `${Math.random() * 4}s`;
      bubble.style.animationDuration = `${4 + Math.random() * 2}s`;
      bubbleContainer.appendChild(bubble);
    }
  }
  
  initializeViewMode() {
    if (this.viewToggle) {
      const buttons = this.viewToggle.querySelectorAll('button');
      buttons.forEach(button => {
        button.classList.toggle('active', button.dataset.view === this.state.viewMode);
      });
    }
  }
  
  loadSearchHistory() {
    try {
      const history = JSON.parse(localStorage.getItem('search-history') || '[]');
      this.searchHistory = history.slice(0, 5); // Keep last 5 searches
    } catch (error) {
      this.searchHistory = [];
    }
  }
  
  saveSearchHistory(query) {
    if (!query || query.length < 2) return;
    
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(item => item !== query);
    // Add to beginning
    this.searchHistory.unshift(query);
    // Keep only last 5
    this.searchHistory = this.searchHistory.slice(0, 5);
    
    try {
      localStorage.setItem('search-history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.warn('Could not save search history:', error);
    }
  }
  
  handleSearchInput(e) {
    const query = e.target.value.trim();
    this.state.currentQuery = query;
    
    // Show/hide clear button
    if (this.clearButton) {
      this.clearButton.style.display = query ? 'flex' : 'none';
    }
    
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    if (query.length >= this.config.minSearchLength) {
      // Debounce search
      this.searchTimeout = setTimeout(() => {
        this.performLiveSearch(query);
      }, this.config.searchDelay);
    } else {
      this.hideSuggestions();
    }
    
    // Track interaction
    if (this.config.enableAI && window.AINavigation) {
      window.AINavigation.trackInteraction('search-input', {
        query: query,
        length: query.length,
        timestamp: Date.now()
      });
    }
  }
  
  handleSearchFocus() {
    this.searchInput.parentElement.classList.add('focused');
    
    // Show recent searches if no query
    if (!this.state.currentQuery && this.searchHistory.length > 0) {
      this.showRecentSearches();
    }
  }
  
  handleSearchBlur() {
    // Delay to allow for suggestion clicks
    setTimeout(() => {
      this.searchInput.parentElement.classList.remove('focused');
    }, 200);
  }
  
  handleSearchSubmit(e) {
    e.preventDefault();
    
    const query = this.searchInput.value.trim();
    if (!query) return;
    
    // Save to history
    this.saveSearchHistory(query);
    
    // Hide suggestions
    this.hideSuggestions();
    
    // Track search
    if (this.config.enableAnalytics) {
      this.trackSearch(query, 'form-submit');
    }
    
    // Perform search (redirect or AJAX)
    this.executeSearch(query);
  }
  
  performLiveSearch(query) {
    if (this.state.isSearching) {
      if (this.currentRequest) {
        this.currentRequest.abort();
      }
    }
    
    this.state.isSearching = true;
    this.showLoadingState();
    
    // Create search URL
    const searchUrl = `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product,article,collection&resources[limit]=8`;
    
    // Abort previous request
    if (this.currentRequest) {
      this.currentRequest.abort();
    }
    
    this.currentRequest = fetch(searchUrl)
      .then(response => response.json())
      .then(data => {
        this.state.isSearching = false;
        this.hideLoadingState();
        this.displaySuggestions(data, query);
      })
      .catch(error => {
        this.state.isSearching = false;
        this.hideLoadingState();
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
        }
      });
  }
  
  showRecentSearches() {
    if (!this.searchHistory.length) return;
    
    const suggestions = this.searchHistory.map(query => ({
      type: 'recent',
      title: query,
      url: `/search?q=${encodeURIComponent(query)}`
    }));
    
    this.displaySuggestionsList(suggestions, 'Recherches récentes');
  }
  
  displaySuggestions(data, query) {
    if (!data || !this.searchSuggestions) return;
    
    const suggestions = [];
    
    // Add products
    if (data.resources && data.resources.results && data.resources.results.products) {
      data.resources.results.products.forEach(product => {
        suggestions.push({
          type: 'product',
          title: product.title,
          price: product.price,
          image: product.featured_image,
          url: product.url
        });
      });
    }
    
    // Add collections
    if (data.resources && data.resources.results && data.resources.results.collections) {
      data.resources.results.collections.forEach(collection => {
        suggestions.push({
          type: 'collection',
          title: collection.title,
          url: collection.url
        });
      });
    }
    
    // Add articles
    if (data.resources && data.resources.results && data.resources.results.articles) {
      data.resources.results.articles.forEach(article => {
        suggestions.push({
          type: 'article',
          title: article.title,
          url: article.url
        });
      });
    }
    
    this.displaySuggestionsList(suggestions, `Résultats pour "${query}"`);
    
    // Announce to screen readers
    this.announceToScreenReader(`${suggestions.length} suggestions trouvées pour ${query}`);
  }
  
  displaySuggestionsList(suggestions, title) {
    if (!this.searchSuggestions) return;
    
    let html = `<div class="search-suggestions__title">${title}</div>`;
    
    suggestions.forEach((suggestion, index) => {
      html += this.renderSuggestion(suggestion, index);
    });
    
    // Add "View all results" link if it's a search
    if (title.includes('Résultats pour')) {
      html += `
        <div class="search-suggestions__footer">
          <a href="/search?q=${encodeURIComponent(this.state.currentQuery)}" class="search-suggestions__view-all">
            Voir tous les résultats
            <svg class="icon icon-arrow-right" aria-hidden="true">
              <use href="#icon-arrow-right"></use>
            </svg>
          </a>
        </div>
      `;
    }
    
    this.searchSuggestions.innerHTML = html;
    this.showSuggestions();
    this.state.suggestions = suggestions;
    this.state.selectedSuggestion = -1;
  }
  
  renderSuggestion(suggestion, index) {
    const baseClass = 'search-suggestions__item';
    let html = `<div class="${baseClass}" data-suggestion-index="${index}" role="option">`;
    
    switch (suggestion.type) {
      case 'product':
        html += `
          <div class="${baseClass}__image">
            ${suggestion.image ? `<img src="${suggestion.image}" alt="${suggestion.title}" loading="lazy">` : ''}
          </div>
          <div class="${baseClass}__content">
            <div class="${baseClass}__title">${this.highlightQuery(suggestion.title)}</div>
            ${suggestion.price ? `<div class="${baseClass}__price">${suggestion.price}</div>` : ''}
          </div>
          <div class="${baseClass}__type">Produit</div>
        `;
        break;
      case 'collection':
        html += `
          <div class="${baseClass}__content">
            <div class="${baseClass}__title">${this.highlightQuery(suggestion.title)}</div>
          </div>
          <div class="${baseClass}__type">Collection</div>
        `;
        break;
      case 'article':
        html += `
          <div class="${baseClass}__content">
            <div class="${baseClass}__title">${this.highlightQuery(suggestion.title)}</div>
          </div>
          <div class="${baseClass}__type">Article</div>
        `;
        break;
      case 'recent':
        html += `
          <div class="${baseClass}__content">
            <div class="${baseClass}__title">${suggestion.title}</div>
          </div>
          <div class="${baseClass}__type">Récent</div>
        `;
        break;
    }
    
    html += '</div>';
    return html;
  }
  
  highlightQuery(text) {
    if (!this.state.currentQuery) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(this.state.currentQuery)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  showSuggestions() {
    if (!this.searchSuggestions) return;
    
    this.searchSuggestions.classList.add('visible');
    this.searchInput.setAttribute('aria-expanded', 'true');
  }
  
  hideSuggestions() {
    if (!this.searchSuggestions) return;
    
    this.searchSuggestions.classList.remove('visible');
    this.searchInput.setAttribute('aria-expanded', 'false');
    this.state.selectedSuggestion = -1;
  }
  
  showLoadingState() {
    if (this.searchButton) {
      this.searchButton.classList.add('loading');
      this.searchButton.setAttribute('aria-label', 'Recherche en cours...');
    }
  }
  
  hideLoadingState() {
    if (this.searchButton) {
      this.searchButton.classList.remove('loading');
      this.searchButton.setAttribute('aria-label', 'Rechercher');
    }
  }
  
  navigateSuggestions(direction) {
    if (!this.state.suggestions.length) return;
    
    const maxIndex = this.state.suggestions.length - 1;
    let newIndex = this.state.selectedSuggestion + direction;
    
    if (newIndex < -1) newIndex = maxIndex;
    if (newIndex > maxIndex) newIndex = -1;
    
    this.state.selectedSuggestion = newIndex;
    this.updateSuggestionSelection();
  }
  
  updateSuggestionSelection() {
    const items = this.searchSuggestions.querySelectorAll('[data-suggestion-index]');
    
    items.forEach((item, index) => {
      const isSelected = index === this.state.selectedSuggestion;
      item.classList.toggle('selected', isSelected);
      item.setAttribute('aria-selected', isSelected);
      
      if (isSelected) {
        item.scrollIntoView({ block: 'nearest' });
        this.searchInput.setAttribute('aria-activedescendant', `suggestion-${index}`);
      }
    });
    
    if (this.state.selectedSuggestion === -1) {
      this.searchInput.removeAttribute('aria-activedescendant');
    }
  }
  
  selectSuggestion(index) {
    const suggestion = this.state.suggestions[index];
    if (!suggestion) return;
    
    // Track selection
    if (this.config.enableAnalytics) {
      this.trackSearch(suggestion.title, 'suggestion-click', suggestion.type);
    }
    
    // Navigate to suggestion
    window.location.href = suggestion.url;
  }
  
  handleSuggestionClick(e) {
    const item = e.target.closest('[data-suggestion-index]');
    if (!item) return;
    
    const index = parseInt(item.dataset.suggestionIndex);
    this.selectSuggestion(index);
  }
  
  handleOutsideClick(e) {
    if (!this.searchForm.contains(e.target)) {
      this.hideSuggestions();
    }
  }
  
  clearSearch() {
    this.searchInput.value = '';
    this.state.currentQuery = '';
    this.hideSuggestions();
    this.searchInput.focus();
    
    if (this.clearButton) {
      this.clearButton.style.display = 'none';
    }
    
    // Track clear action
    if (this.config.enableAI && window.AINavigation) {
      window.AINavigation.trackInteraction('search-clear', {
        timestamp: Date.now()
      });
    }
  }
  
  toggleFilters() {
    const filtersPanel = document.querySelector('[data-search-filters]');
    if (!filtersPanel) return;
    
    const isOpen = filtersPanel.classList.contains('open');
    filtersPanel.classList.toggle('open', !isOpen);
    
    // Update button state
    this.filterToggle.classList.toggle('active', !isOpen);
    this.filterToggle.setAttribute('aria-expanded', !isOpen);
    
    // Announce to screen readers
    this.announceToScreenReader(isOpen ? 'Filtres fermés' : 'Filtres ouverts');
  }
  
  toggleView() {
    const buttons = this.viewToggle.querySelectorAll('button');
    const activeButton = this.viewToggle.querySelector('.active');
    
    if (!activeButton) return;
    
    const currentView = activeButton.dataset.view;
    const newView = currentView === 'grid' ? 'list' : 'grid';
    
    // Update button states
    buttons.forEach(button => {
      button.classList.toggle('active', button.dataset.view === newView);
    });
    
    // Update state and save
    this.state.viewMode = newView;
    localStorage.setItem('search-view-mode', newView);
    
    // Update results display
    const resultsContainer = document.querySelector('[data-search-results]');
    if (resultsContainer) {
      resultsContainer.className = resultsContainer.className.replace(/view-\w+/, `view-${newView}`);
    }
    
    // Track view change
    if (this.config.enableAI && window.AINavigation) {
      window.AINavigation.trackInteraction('search-view-toggle', {
        view: newView,
        timestamp: Date.now()
      });
    }
  }
  
  executeSearch(query) {
    // Redirect to search results page
    const searchUrl = `/search?q=${encodeURIComponent(query)}`;
    window.location.href = searchUrl;
  }
  
  trackSearch(query, method, type = null) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', {
        search_term: query,
        method: method,
        content_type: type
      });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Search', {
        search_string: query,
        content_category: type
      });
    }
    
    // AI Navigation
    if (this.config.enableAI && window.AINavigation) {
      window.AINavigation.trackInteraction('search-execute', {
        query: query,
        method: method,
        type: type,
        timestamp: Date.now()
      });
    }
  }
  
  handleResize() {
    // Adjust suggestions positioning on mobile
    if (window.innerWidth <= 750 && this.searchSuggestions) {
      this.searchSuggestions.style.width = '100vw';
      this.searchSuggestions.style.left = '0';
    } else if (this.searchSuggestions) {
      this.searchSuggestions.style.width = '';
      this.searchSuggestions.style.left = '';
    }
  }
  
  // Utility function for debouncing
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
  
  // Public methods for external control
  focusSearch() {
    if (this.searchInput) {
      this.searchInput.focus();
    }
  }
  
  setQuery(query) {
    if (this.searchInput) {
      this.searchInput.value = query;
      this.state.currentQuery = query;
      this.handleSearchInput({ target: this.searchInput });
    }
  }
  
  // Cleanup method
  destroy() {
    // Clear timers
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Abort pending requests
    if (this.currentRequest) {
      this.currentRequest.abort();
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('click', this.handleOutsideClick);
    
    // Remove ARIA live region
    if (this.ariaLiveRegion && this.ariaLiveRegion.parentNode) {
      this.ariaLiveRegion.parentNode.removeChild(this.ariaLiveRegion);
    }
    
    console.log('SearchHeaderManager destroyed');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const searchHeader = document.querySelector('.search-header');
  if (searchHeader) {
    window.searchHeaderManager = new SearchHeaderManager();
  }
});

// Global search functions for external access
window.SearchHeader = {
  focus: () => {
    const manager = window.searchHeaderManager;
    if (manager) manager.focusSearch();
  },
  
  setQuery: (query) => {
    const manager = window.searchHeaderManager;
    if (manager) manager.setQuery(query);
  }
}; 