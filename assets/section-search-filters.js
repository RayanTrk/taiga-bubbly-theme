/**
 * Search Filters Manager - Bubbly Style Implementation
 * Follows shopirule.mdc specifications for advanced filtering
 * 
 * Features:
 * - Dynamic filter management
 * - AJAX filtering without page reload
 * - Price range slider
 * - Active filters display
 * - Mobile responsive behavior
 * - AI Navigation integration
 * - WCAG 2.1 AA accessibility
 * - Performance optimizations
 */

class SearchFiltersManager {
  constructor() {
    this.filtersContainer = document.querySelector('[data-search-filters]');
    this.filtersForm = document.querySelector('[data-filters-form]');
    this.filtersToggle = document.querySelector('[data-filters-toggle]');
    this.filtersContent = document.querySelector('[data-filters-content]');
    this.clearFiltersBtn = document.querySelector('[data-clear-filters]');
    this.applyFiltersBtn = document.querySelector('[data-apply-filters]');
    this.activeFiltersContainer = document.querySelector('[data-active-filters]');
    this.activeFiltersList = document.querySelector('[data-active-filters-list]');
    this.filterCount = document.querySelector('[data-filter-count]');
    this.loadingOverlay = document.querySelector('[data-filters-loading]');
    
    // Price range elements
    this.priceMinInput = document.querySelector('[data-price-min]');
    this.priceMaxInput = document.querySelector('[data-price-max]');
    this.priceSlider = document.querySelector('[data-price-slider]');
    this.sliderRange = document.querySelector('[data-slider-range]');
    this.sliderThumbMin = document.querySelector('[data-slider-thumb-min]');
    this.sliderThumbMax = document.querySelector('[data-slider-thumb-max]');
    
    // Configuration
    this.config = {
      enableAjax: true,
      enableAnalytics: true,
      enableAI: true,
      debounceDelay: 300,
      animationDuration: 300
    };
    
    // State management
    this.state = {
      isCollapsed: window.innerWidth <= 750,
      activeFilters: new Map(),
      isLoading: false,
      priceRange: {
        min: 0,
        max: 1000,
        currentMin: 0,
        currentMax: 1000
      }
    };
    
    // Timers
    this.debounceTimer = null;
    this.currentRequest = null;
    
    this.init();
  }
  
  init() {
    if (!this.filtersContainer) return;
    
    this.setupEventListeners();
    this.setupPriceSlider();
    this.setupAccessibility();
    this.setupBubbleAnimations();
    this.loadFiltersFromURL();
    this.updateActiveFilters();
    this.updateMobileState();
    
    // AI Navigation integration
    if (this.config.enableAI && window.AINavigation) {
      window.AINavigation.trackComponent('search-filters', {
        component: 'SearchFiltersManager',
        version: '1.0.0',
        features: ['ajax-filtering', 'price-slider', 'mobile-responsive']
      });
    }
    
    console.log('SearchFiltersManager initialized with Bubbly style');
  }
  
  setupEventListeners() {
    // Toggle filters on mobile
    if (this.filtersToggle) {
      this.filtersToggle.addEventListener('click', this.toggleFilters.bind(this));
    }
    
    // Clear all filters
    if (this.clearFiltersBtn) {
      this.clearFiltersBtn.addEventListener('click', this.clearAllFilters.bind(this));
    }
    
    // Apply filters
    if (this.applyFiltersBtn) {
      this.applyFiltersBtn.addEventListener('click', this.applyFilters.bind(this));
    }
    
    // Form submission
    if (this.filtersForm) {
      this.filtersForm.addEventListener('submit', this.handleFormSubmit.bind(this));
      this.filtersForm.addEventListener('change', this.handleFilterChange.bind(this));
    }
    
    // Price inputs
    if (this.priceMinInput) {
      this.priceMinInput.addEventListener('input', this.handlePriceInputChange.bind(this));
    }
    if (this.priceMaxInput) {
      this.priceMaxInput.addEventListener('input', this.handlePriceInputChange.bind(this));
    }
    
    // Window resize
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    
    // Outside clicks to close on mobile
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }
  
  setupPriceSlider() {
    if (!this.priceSlider || !this.sliderThumbMin || !this.sliderThumbMax) return;
    
    // Initialize slider state
    this.updateSliderPosition();
    
    // Mouse events for slider thumbs
    this.sliderThumbMin.addEventListener('mousedown', (e) => this.startSliderDrag(e, 'min'));
    this.sliderThumbMax.addEventListener('mousedown', (e) => this.startSliderDrag(e, 'max'));
    
    // Touch events for mobile
    this.sliderThumbMin.addEventListener('touchstart', (e) => this.startSliderDrag(e, 'min'), { passive: false });
    this.sliderThumbMax.addEventListener('touchstart', (e) => this.startSliderDrag(e, 'max'), { passive: false });
    
    // Click on track to move nearest thumb
    this.priceSlider.addEventListener('click', this.handleSliderTrackClick.bind(this));
  }
  
  setupAccessibility() {
    // ARIA attributes for filter groups
    const filterGroups = this.filtersContainer.querySelectorAll('.search-filters__group');
    filterGroups.forEach((group, index) => {
      const title = group.querySelector('.search-filters__group-title');
      const content = group.querySelector('.search-filters__options, .search-filters__colors, .search-filters__price-range');
      
      if (title && content) {
        const id = `filter-group-${index}`;
        title.id = `${id}-title`;
        content.setAttribute('aria-labelledby', `${id}-title`);
      }
    });
    
    // ARIA live region for filter updates
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
    // Enhanced bubble animations for interaction
    const bubbles = this.filtersContainer.querySelectorAll('.search-filters__bubble');
    
    bubbles.forEach((bubble, index) => {
      // Add hover effect
      bubble.addEventListener('mouseenter', () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          bubble.style.animationPlayState = 'paused';
          bubble.style.transform = 'scale(1.2)';
        }
      });
      
      bubble.addEventListener('mouseleave', () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          bubble.style.animationPlayState = 'running';
          bubble.style.transform = '';
        }
      });
    });
  }
  
  loadFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Load price range
    const priceMin = urlParams.get('price_min');
    const priceMax = urlParams.get('price_max');
    
    if (priceMin) {
      this.state.priceRange.currentMin = parseFloat(priceMin);
      if (this.priceMinInput) this.priceMinInput.value = priceMin;
    }
    
    if (priceMax) {
      this.state.priceRange.currentMax = parseFloat(priceMax);
      if (this.priceMaxInput) this.priceMaxInput.value = priceMax;
    }
    
    // Load other filters
    const filterInputs = this.filtersForm.querySelectorAll('input[type="checkbox"]');
    filterInputs.forEach(input => {
      const paramName = input.name.replace('[]', '');
      const paramValues = urlParams.getAll(paramName);
      
      if (paramValues.includes(input.value)) {
        input.checked = true;
        this.state.activeFilters.set(`${paramName}-${input.value}`, {
          type: paramName,
          value: input.value,
          label: this.getFilterLabel(input)
        });
      }
    });
    
    this.updateSliderPosition();
  }
  
  getFilterLabel(input) {
    const option = input.closest('.search-filters__option, .search-filters__color-option');
    if (option) {
      const textElement = option.querySelector('.search-filters__option-text, .search-filters__color-name');
      return textElement ? textElement.textContent.trim() : input.value;
    }
    return input.value;
  }
  
  toggleFilters() {
    if (!this.filtersContent || !this.filtersToggle) return;
    
    const isExpanded = this.filtersToggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;
    
    this.filtersToggle.setAttribute('aria-expanded', newState);
    this.filtersContent.style.display = newState ? 'block' : 'none';
    
    // Update button text
    const buttonText = newState ? 'Masquer les filtres' : 'Afficher les filtres';
    const textNode = Array.from(this.filtersToggle.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    if (textNode) {
      textNode.textContent = buttonText;
    }
    
    // Announce to screen readers
    this.announceToScreenReader(newState ? 'Filtres ouverts' : 'Filtres fermés');
    
    // Track interaction
    if (this.config.enableAI && window.AINavigation) {
      window.AINavigation.trackInteraction('filters-toggle', {
        expanded: newState,
        timestamp: Date.now()
      });
    }
  }
  
  handleFilterChange(e) {
    const input = e.target;
    
    if (input.type === 'checkbox') {
      const filterKey = `${input.name.replace('[]', '')}-${input.value}`;
      
      if (input.checked) {
        this.state.activeFilters.set(filterKey, {
          type: input.name.replace('[]', ''),
          value: input.value,
          label: this.getFilterLabel(input)
        });
      } else {
        this.state.activeFilters.delete(filterKey);
      }
      
      this.updateActiveFilters();
      this.updateFilterCount();
      
      // Auto-apply if AJAX is enabled
      if (this.config.enableAjax) {
        this.debounceApplyFilters();
      }
    }
  }
  
  handlePriceInputChange(e) {
    const input = e.target;
    const value = parseFloat(input.value) || 0;
    
    if (input === this.priceMinInput) {
      this.state.priceRange.currentMin = Math.min(value, this.state.priceRange.currentMax);
    } else if (input === this.priceMaxInput) {
      this.state.priceRange.currentMax = Math.max(value, this.state.priceRange.currentMin);
    }
    
    this.updateSliderPosition();
    this.updateFilterCount();
    
    // Auto-apply if AJAX is enabled
    if (this.config.enableAjax) {
      this.debounceApplyFilters();
    }
  }
  
  startSliderDrag(e, thumb) {
    e.preventDefault();
    
    const slider = this.priceSlider;
    const sliderRect = slider.getBoundingClientRect();
    const sliderWidth = sliderRect.width;
    
    const moveHandler = (moveEvent) => {
      const clientX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
      const position = (clientX - sliderRect.left) / sliderWidth;
      const clampedPosition = Math.max(0, Math.min(1, position));
      
      const range = this.state.priceRange.max - this.state.priceRange.min;
      const value = this.state.priceRange.min + (range * clampedPosition);
      
      if (thumb === 'min') {
        this.state.priceRange.currentMin = Math.min(value, this.state.priceRange.currentMax);
        if (this.priceMinInput) this.priceMinInput.value = Math.round(this.state.priceRange.currentMin);
      } else {
        this.state.priceRange.currentMax = Math.max(value, this.state.priceRange.currentMin);
        if (this.priceMaxInput) this.priceMaxInput.value = Math.round(this.state.priceRange.currentMax);
      }
      
      this.updateSliderPosition();
    };
    
    const endHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', endHandler);
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('touchend', endHandler);
      
      this.updateFilterCount();
      
      if (this.config.enableAjax) {
        this.debounceApplyFilters();
      }
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endHandler);
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', endHandler);
  }
  
  handleSliderTrackClick(e) {
    if (e.target === this.sliderThumbMin || e.target === this.sliderThumbMax) return;
    
    const sliderRect = this.priceSlider.getBoundingClientRect();
    const position = (e.clientX - sliderRect.left) / sliderRect.width;
    const range = this.state.priceRange.max - this.state.priceRange.min;
    const value = this.state.priceRange.min + (range * position);
    
    // Move the nearest thumb
    const distanceToMin = Math.abs(value - this.state.priceRange.currentMin);
    const distanceToMax = Math.abs(value - this.state.priceRange.currentMax);
    
    if (distanceToMin < distanceToMax) {
      this.state.priceRange.currentMin = Math.min(value, this.state.priceRange.currentMax);
      if (this.priceMinInput) this.priceMinInput.value = Math.round(this.state.priceRange.currentMin);
    } else {
      this.state.priceRange.currentMax = Math.max(value, this.state.priceRange.currentMin);
      if (this.priceMaxInput) this.priceMaxInput.value = Math.round(this.state.priceRange.currentMax);
    }
    
    this.updateSliderPosition();
    this.updateFilterCount();
    
    if (this.config.enableAjax) {
      this.debounceApplyFilters();
    }
  }
  
  updateSliderPosition() {
    if (!this.sliderRange || !this.sliderThumbMin || !this.sliderThumbMax) return;
    
    const range = this.state.priceRange.max - this.state.priceRange.min;
    const minPercent = ((this.state.priceRange.currentMin - this.state.priceRange.min) / range) * 100;
    const maxPercent = ((this.state.priceRange.currentMax - this.state.priceRange.min) / range) * 100;
    
    this.sliderRange.style.left = `${minPercent}%`;
    this.sliderRange.style.right = `${100 - maxPercent}%`;
    
    this.sliderThumbMin.style.left = `${minPercent}%`;
    this.sliderThumbMax.style.left = `${maxPercent}%`;
  }
  
  updateActiveFilters() {
    if (!this.activeFiltersContainer || !this.activeFiltersList) return;
    
    const hasActiveFilters = this.state.activeFilters.size > 0 || 
                            this.state.priceRange.currentMin > this.state.priceRange.min ||
                            this.state.priceRange.currentMax < this.state.priceRange.max;
    
    this.activeFiltersContainer.style.display = hasActiveFilters ? 'block' : 'none';
    
    let html = '';
    
    // Add price filter if active
    if (this.state.priceRange.currentMin > this.state.priceRange.min ||
        this.state.priceRange.currentMax < this.state.priceRange.max) {
      html += this.renderActiveFilter('price', 
        `${this.state.priceRange.currentMin}€ - ${this.state.priceRange.currentMax}€`,
        () => this.clearPriceFilter()
      );
    }
    
    // Add other active filters
    this.state.activeFilters.forEach((filter, key) => {
      html += this.renderActiveFilter(key, filter.label, () => this.removeActiveFilter(key));
    });
    
    this.activeFiltersList.innerHTML = html;
    
    // Add click handlers to remove buttons
    this.activeFiltersList.querySelectorAll('[data-remove-filter]').forEach(button => {
      button.addEventListener('click', (e) => {
        const filterKey = e.target.dataset.removeFilter;
        if (filterKey === 'price') {
          this.clearPriceFilter();
        } else {
          this.removeActiveFilter(filterKey);
        }
      });
    });
  }
  
  renderActiveFilter(key, label, removeHandler) {
    return `
      <div class="search-filters__active-tag">
        ${label}
        <button 
          type="button" 
          data-remove-filter="${key}"
          aria-label="Supprimer le filtre ${label}"
        >
          ×
        </button>
      </div>
    `;
  }
  
  removeActiveFilter(key) {
    // Remove from state
    this.state.activeFilters.delete(key);
    
    // Uncheck corresponding input
    const [type, value] = key.split('-');
    const input = this.filtersForm.querySelector(`input[name="${type}[]"][value="${value}"], input[name="${type}"][value="${value}"]`);
    if (input) {
      input.checked = false;
    }
    
    this.updateActiveFilters();
    this.updateFilterCount();
    
    if (this.config.enableAjax) {
      this.debounceApplyFilters();
    }
    
    // Announce to screen readers
    const filter = this.state.activeFilters.get(key);
    if (filter) {
      this.announceToScreenReader(`Filtre ${filter.label} supprimé`);
    }
  }
  
  clearPriceFilter() {
    this.state.priceRange.currentMin = this.state.priceRange.min;
    this.state.priceRange.currentMax = this.state.priceRange.max;
    
    if (this.priceMinInput) this.priceMinInput.value = '';
    if (this.priceMaxInput) this.priceMaxInput.value = '';
    
    this.updateSliderPosition();
    this.updateActiveFilters();
    this.updateFilterCount();
    
    if (this.config.enableAjax) {
      this.debounceApplyFilters();
    }
    
    this.announceToScreenReader('Filtre de prix supprimé');
  }
  
  clearAllFilters() {
    // Clear state
    this.state.activeFilters.clear();
    this.state.priceRange.currentMin = this.state.priceRange.min;
    this.state.priceRange.currentMax = this.state.priceRange.max;
    
    // Clear form inputs
    const inputs = this.filtersForm.querySelectorAll('input[type="checkbox"]');
    inputs.forEach(input => input.checked = false);
    
    if (this.priceMinInput) this.priceMinInput.value = '';
    if (this.priceMaxInput) this.priceMaxInput.value = '';
    
    // Update UI
    this.updateSliderPosition();
    this.updateActiveFilters();
    this.updateFilterCount();
    
    // Apply changes
    if (this.config.enableAjax) {
      this.applyFilters();
    }
    
    // Announce to screen readers
    this.announceToScreenReader('Tous les filtres ont été supprimés');
    
    // Track interaction
    if (this.config.enableAI && window.AINavigation) {
      window.AINavigation.trackInteraction('filters-clear-all', {
        timestamp: Date.now()
      });
    }
  }
  
  updateFilterCount() {
    if (!this.filterCount) return;
    
    let count = this.state.activeFilters.size;
    
    // Add price filter to count if active
    if (this.state.priceRange.currentMin > this.state.priceRange.min ||
        this.state.priceRange.currentMax < this.state.priceRange.max) {
      count++;
    }
    
    this.filterCount.textContent = count > 0 ? `(${count})` : '';
    this.filterCount.style.display = count > 0 ? 'inline' : 'none';
  }
  
  debounceApplyFilters() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.applyFilters();
    }, this.config.debounceDelay);
  }
  
  handleFormSubmit(e) {
    e.preventDefault();
    this.applyFilters();
  }
  
  applyFilters() {
    if (this.config.enableAjax) {
      this.applyFiltersAjax();
    } else {
      this.applyFiltersRedirect();
    }
  }
  
  applyFiltersAjax() {
    // Show loading state
    this.showLoading();
    
    // Build query parameters
    const params = new URLSearchParams();
    
    // Add search query if exists
    const searchQuery = new URLSearchParams(window.location.search).get('q');
    if (searchQuery) {
      params.append('q', searchQuery);
    }
    
    // Add price range
    if (this.state.priceRange.currentMin > this.state.priceRange.min) {
      params.append('price_min', this.state.priceRange.currentMin);
    }
    if (this.state.priceRange.currentMax < this.state.priceRange.max) {
      params.append('price_max', this.state.priceRange.currentMax);
    }
    
    // Add other filters
    this.state.activeFilters.forEach(filter => {
      params.append(filter.type, filter.value);
    });
    
    // Make AJAX request
    const url = `/search?${params.toString()}`;
    
    // Abort previous request
    if (this.currentRequest) {
      this.currentRequest.abort();
    }
    
    this.currentRequest = fetch(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.text())
    .then(html => {
      // Update results container
      const resultsContainer = document.querySelector('[data-search-results]');
      if (resultsContainer) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newResults = doc.querySelector('[data-search-results]');
        
        if (newResults) {
          resultsContainer.innerHTML = newResults.innerHTML;
        }
      }
      
      // Update URL without page reload
      window.history.pushState(null, '', url);
      
      this.hideLoading();
      
      // Track successful filter application
      this.trackFilterApplication(params);
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Filter application error:', error);
        this.hideLoading();
        // Fallback to redirect
        this.applyFiltersRedirect();
      }
    });
  }
  
  applyFiltersRedirect() {
    const params = new URLSearchParams();
    
    // Add search query if exists
    const searchQuery = new URLSearchParams(window.location.search).get('q');
    if (searchQuery) {
      params.append('q', searchQuery);
    }
    
    // Add price range
    if (this.state.priceRange.currentMin > this.state.priceRange.min) {
      params.append('price_min', this.state.priceRange.currentMin);
    }
    if (this.state.priceRange.currentMax < this.state.priceRange.max) {
      params.append('price_max', this.state.priceRange.currentMax);
    }
    
    // Add other filters
    this.state.activeFilters.forEach(filter => {
      params.append(filter.type, filter.value);
    });
    
    // Redirect to filtered URL
    window.location.href = `/search?${params.toString()}`;
  }
  
  showLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = 'flex';
    }
    
    if (this.applyFiltersBtn) {
      this.applyFiltersBtn.disabled = true;
      this.applyFiltersBtn.classList.add('loading');
    }
    
    this.state.isLoading = true;
  }
  
  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = 'none';
    }
    
    if (this.applyFiltersBtn) {
      this.applyFiltersBtn.disabled = false;
      this.applyFiltersBtn.classList.remove('loading');
    }
    
    this.state.isLoading = false;
  }
  
  trackFilterApplication(params) {
    const filterData = {
      filters: Array.from(this.state.activeFilters.values()),
      priceRange: {
        min: this.state.priceRange.currentMin,
        max: this.state.priceRange.currentMax
      },
      timestamp: Date.now()
    };
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'filter_apply', {
        filter_count: this.state.activeFilters.size,
        has_price_filter: this.state.priceRange.currentMin > this.state.priceRange.min || 
                          this.state.priceRange.currentMax < this.state.priceRange.max
      });
    }
    
    // AI Navigation
    if (this.config.enableAI && window.AINavigation) {
      window.AINavigation.trackInteraction('filters-apply', filterData);
    }
  }
  
  handleOutsideClick(e) {
    if (this.state.isCollapsed && 
        this.filtersContent && 
        this.filtersToggle &&
        this.filtersToggle.getAttribute('aria-expanded') === 'true' &&
        !this.filtersContainer.contains(e.target)) {
      this.toggleFilters();
    }
  }
  
  handleResize() {
    this.updateMobileState();
  }
  
  updateMobileState() {
    const isMobile = window.innerWidth <= 750;
    
    if (isMobile !== this.state.isCollapsed) {
      this.state.isCollapsed = isMobile;
      
      if (this.filtersContent && this.filtersToggle) {
        if (isMobile) {
          // Mobile: hide content by default
          this.filtersContent.style.display = 'none';
          this.filtersToggle.setAttribute('aria-expanded', 'false');
          this.filtersToggle.style.display = 'flex';
        } else {
          // Desktop: show content always
          this.filtersContent.style.display = 'block';
          this.filtersToggle.style.display = 'none';
        }
      }
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
  getActiveFilters() {
    return {
      filters: Array.from(this.state.activeFilters.values()),
      priceRange: {
        min: this.state.priceRange.currentMin,
        max: this.state.priceRange.currentMax
      }
    };
  }
  
  setFilter(type, value, apply = true) {
    const input = this.filtersForm.querySelector(`input[name="${type}[]"][value="${value}"], input[name="${type}"][value="${value}"]`);
    if (input) {
      input.checked = true;
      this.handleFilterChange({ target: input });
      
      if (apply && this.config.enableAjax) {
        this.debounceApplyFilters();
      }
    }
  }
  
  setPriceRange(min, max, apply = true) {
    this.state.priceRange.currentMin = Math.max(min, this.state.priceRange.min);
    this.state.priceRange.currentMax = Math.min(max, this.state.priceRange.max);
    
    if (this.priceMinInput) this.priceMinInput.value = this.state.priceRange.currentMin;
    if (this.priceMaxInput) this.priceMaxInput.value = this.state.priceRange.currentMax;
    
    this.updateSliderPosition();
    this.updateActiveFilters();
    this.updateFilterCount();
    
    if (apply && this.config.enableAjax) {
      this.debounceApplyFilters();
    }
  }
  
  // Cleanup method
  destroy() {
    // Clear timers
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
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
    
    console.log('SearchFiltersManager destroyed');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const searchFilters = document.querySelector('[data-search-filters]');
  if (searchFilters) {
    window.searchFiltersManager = new SearchFiltersManager();
  }
});

// Global filters functions for external access
window.SearchFilters = {
  getActiveFilters: () => {
    const manager = window.searchFiltersManager;
    return manager ? manager.getActiveFilters() : null;
  },
  
  setFilter: (type, value, apply = true) => {
    const manager = window.searchFiltersManager;
    if (manager) manager.setFilter(type, value, apply);
  },
  
  setPriceRange: (min, max, apply = true) => {
    const manager = window.searchFiltersManager;
    if (manager) manager.setPriceRange(min, max, apply);
  },
  
  clearAll: () => {
    const manager = window.searchFiltersManager;
    if (manager) manager.clearAllFilters();
  }
}; 