/**
 * Collection Filters Manager
 * Handles filtering functionality with Bubbly animations and AI Navigation
 */
class CollectionFiltersManager {
  constructor(container) {
    this.container = container;
    this.form = container.querySelector('.collection-filters__form');
    this.mobileToggle = container.querySelector('.collection-filters__mobile-toggle');
    this.toggleButton = container.querySelector('.collection-filters__toggle-button');
    this.toggleCount = container.querySelector('.collection-filters__toggle-count');
    this.panel = container.querySelector('.collection-filters__panel');
    this.overlay = container.querySelector('.collection-filters__overlay');
    this.closeButton = container.querySelector('.collection-filters__panel-close');
    this.clearButton = container.querySelector('.collection-filters__clear-button');
    this.applyButton = container.querySelector('.collection-filters__apply-button');
    this.priceSliders = container.querySelectorAll('.collection-filters__price-slider input[type="range"]');
    this.priceInputs = container.querySelectorAll('.collection-filters__price-field');
    this.groupButtons = container.querySelectorAll('.collection-filters__group-button');
    
    this.isOpen = false;
    this.activeFilters = new Map();
    this.priceRange = { min: 0, max: 1000 };
    this.debounceTimeout = null;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.initializePriceSliders();
    this.loadActiveFilters();
    this.updateFilterCount();
    this.initializeAINavigation();
    
    // Initialize with ARIA attributes
    this.setupAccessibility();
    
    console.log('Collection Filters initialized');
  }
  
  setupEventListeners() {
    // Mobile toggle
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => this.togglePanel());
    }
    
    // Close button and overlay
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.closePanel());
    }
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closePanel());
    }
    
    // Group toggles
    this.groupButtons.forEach(button => {
      button.addEventListener('click', (e) => this.toggleGroup(e.target));
    });
    
    // Form submission
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
      this.form.addEventListener('change', (e) => this.handleFilterChange(e));
    }
    
    // Price sliders
    this.priceSliders.forEach(slider => {
      slider.addEventListener('input', () => this.handlePriceSliderChange());
      slider.addEventListener('change', () => this.debouncedApplyFilters());
    });
    
    // Price inputs
    this.priceInputs.forEach(input => {
      input.addEventListener('input', () => this.handlePriceInputChange());
      input.addEventListener('blur', () => this.debouncedApplyFilters());
    });
    
    // Action buttons
    if (this.clearButton) {
      this.clearButton.addEventListener('click', () => this.clearAllFilters());
    }
    if (this.applyButton) {
      this.applyButton.addEventListener('click', () => this.applyFilters());
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Resize handling
    window.addEventListener('resize', () => this.handleResize());
  }
  
  setupAccessibility() {
    // Set initial ARIA states
    this.groupButtons.forEach(button => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const content = button.nextElementSibling;
      if (content) {
        content.style.maxHeight = isExpanded ? content.scrollHeight + 'px' : '0';
      }
    });
    
    // Add role attributes
    if (this.panel) {
      this.panel.setAttribute('role', 'dialog');
      this.panel.setAttribute('aria-label', 'Filter products');
    }
    
    // Focus management
    this.setupFocusManagement();
  }
  
  setupFocusManagement() {
    // Store focusable elements
    this.focusableElements = this.panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (this.focusableElements.length > 0) {
      this.firstFocusableElement = this.focusableElements[0];
      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
    }
  }
  
  initializePriceSliders() {
    const minSlider = this.container.querySelector('.collection-filters__price-slider-min');
    const maxSlider = this.container.querySelector('.collection-filters__price-slider-max');
    const minInput = this.container.querySelector('.collection-filters__price-field[name="price_min"]');
    const maxInput = this.container.querySelector('.collection-filters__price-field[name="price_max"]');
    const rangeFill = this.container.querySelector('.collection-filters__price-range-fill');
    
    if (!minSlider || !maxSlider) return;
    
    // Get price range from data attributes or defaults
    this.priceRange.min = parseInt(minSlider.min) || 0;
    this.priceRange.max = parseInt(maxSlider.max) || 1000;
    
    // Initialize values
    const currentMin = parseInt(minSlider.value) || this.priceRange.min;
    const currentMax = parseInt(maxSlider.value) || this.priceRange.max;
    
    if (minInput) minInput.value = currentMin;
    if (maxInput) maxInput.value = currentMax;
    
    this.updatePriceSliderFill();
  }
  
  handlePriceSliderChange() {
    const minSlider = this.container.querySelector('.collection-filters__price-slider-min');
    const maxSlider = this.container.querySelector('.collection-filters__price-slider-max');
    const minInput = this.container.querySelector('.collection-filters__price-field[name="price_min"]');
    const maxInput = this.container.querySelector('.collection-filters__price-field[name="price_max"]');
    
    if (!minSlider || !maxSlider) return;
    
    let minValue = parseInt(minSlider.value);
    let maxValue = parseInt(maxSlider.value);
    
    // Ensure min doesn't exceed max
    if (minValue >= maxValue) {
      minValue = maxValue - 1;
      minSlider.value = minValue;
    }
    
    // Update inputs
    if (minInput) minInput.value = minValue;
    if (maxInput) maxInput.value = maxValue;
    
    this.updatePriceSliderFill();
  }
  
  handlePriceInputChange() {
    const minSlider = this.container.querySelector('.collection-filters__price-slider-min');
    const maxSlider = this.container.querySelector('.collection-filters__price-slider-max');
    const minInput = this.container.querySelector('.collection-filters__price-field[name="price_min"]');
    const maxInput = this.container.querySelector('.collection-filters__price-field[name="price_max"]');
    
    if (!minSlider || !maxSlider || !minInput || !maxInput) return;
    
    let minValue = parseInt(minInput.value) || this.priceRange.min;
    let maxValue = parseInt(maxInput.value) || this.priceRange.max;
    
    // Clamp values to range
    minValue = Math.max(this.priceRange.min, Math.min(minValue, this.priceRange.max));
    maxValue = Math.max(this.priceRange.min, Math.min(maxValue, this.priceRange.max));
    
    // Ensure min doesn't exceed max
    if (minValue >= maxValue) {
      minValue = maxValue - 1;
    }
    
    // Update sliders
    minSlider.value = minValue;
    maxSlider.value = maxValue;
    
    // Update inputs if clamped
    minInput.value = minValue;
    maxInput.value = maxValue;
    
    this.updatePriceSliderFill();
  }
  
  updatePriceSliderFill() {
    const minSlider = this.container.querySelector('.collection-filters__price-slider-min');
    const maxSlider = this.container.querySelector('.collection-filters__price-slider-max');
    const rangeFill = this.container.querySelector('.collection-filters__price-range-fill');
    
    if (!minSlider || !maxSlider || !rangeFill) return;
    
    const minValue = parseInt(minSlider.value);
    const maxValue = parseInt(maxSlider.value);
    const range = this.priceRange.max - this.priceRange.min;
    
    const leftPercent = ((minValue - this.priceRange.min) / range) * 100;
    const rightPercent = ((maxValue - this.priceRange.min) / range) * 100;
    
    rangeFill.style.left = leftPercent + '%';
    rangeFill.style.width = (rightPercent - leftPercent) + '%';
  }
  
  toggleGroup(button) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const content = button.nextElementSibling;
    
    if (!content) return;
    
    // Toggle ARIA state
    button.setAttribute('aria-expanded', !isExpanded);
    
    // Animate content
    if (isExpanded) {
      content.style.maxHeight = '0';
    } else {
      content.style.maxHeight = content.scrollHeight + 'px';
    }
    
    // Track interaction for AI Navigation
    this.trackAINavigation('filter_group_toggle', {
      group: button.textContent.trim(),
      expanded: !isExpanded
    });
  }
  
  togglePanel() {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }
  
  openPanel() {
    this.isOpen = true;
    
    if (this.panel) {
      this.panel.classList.add('active');
    }
    if (this.overlay) {
      this.overlay.classList.add('active');
    }
    
    // Prevent body scroll on mobile
    if (window.innerWidth <= 990) {
      document.body.style.overflow = 'hidden';
    }
    
    // Focus management
    setTimeout(() => {
      if (this.firstFocusableElement) {
        this.firstFocusableElement.focus();
      }
    }, 100);
    
    // Track interaction
    this.trackAINavigation('filter_panel_open', {
      method: 'mobile_toggle'
    });
  }
  
  closePanel() {
    this.isOpen = false;
    
    if (this.panel) {
      this.panel.classList.remove('active');
    }
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to toggle button
    if (this.toggleButton) {
      this.toggleButton.focus();
    }
    
    // Track interaction
    this.trackAINavigation('filter_panel_close', {});
  }
  
  handleFilterChange(event) {
    const input = event.target;
    const filterType = input.name;
    const filterValue = input.value;
    
    if (input.type === 'checkbox') {
      this.handleCheckboxFilter(filterType, filterValue, input.checked);
    } else if (input.type === 'radio') {
      this.handleRadioFilter(filterType, filterValue);
    } else {
      this.handleInputFilter(filterType, filterValue);
    }
    
    this.updateFilterCount();
    this.debouncedApplyFilters();
  }
  
  handleCheckboxFilter(type, value, checked) {
    if (!this.activeFilters.has(type)) {
      this.activeFilters.set(type, new Set());
    }
    
    const filterSet = this.activeFilters.get(type);
    
    if (checked) {
      filterSet.add(value);
    } else {
      filterSet.delete(value);
    }
    
    if (filterSet.size === 0) {
      this.activeFilters.delete(type);
    }
  }
  
  handleRadioFilter(type, value) {
    this.activeFilters.set(type, new Set([value]));
  }
  
  handleInputFilter(type, value) {
    if (value) {
      this.activeFilters.set(type, new Set([value]));
    } else {
      this.activeFilters.delete(type);
    }
  }
  
  updateFilterCount() {
    let count = 0;
    
    this.activeFilters.forEach((values, key) => {
      if (key === 'price_min' || key === 'price_max') {
        // Count price filter as 1 if either min or max is set
        if (!count || !this.activeFilters.has(key === 'price_min' ? 'price_max' : 'price_min')) {
          count++;
        }
      } else {
        count += values.size;
      }
    });
    
    if (this.toggleCount) {
      this.toggleCount.textContent = count > 0 ? count : '';
    }
  }
  
  debouncedApplyFilters() {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }
  
  applyFilters() {
    const formData = new FormData(this.form);
    const params = new URLSearchParams();
    
    // Build query parameters
    for (const [key, value] of formData.entries()) {
      if (value) {
        params.append(key, value);
      }
    }
    
    // Handle multiple values for same key (checkboxes)
    this.activeFilters.forEach((values, key) => {
      if (values.size > 1) {
        params.delete(key);
        values.forEach(value => {
          params.append(key, value);
        });
      }
    });
    
    // Update URL and reload collection
    const url = new URL(window.location);
    url.search = params.toString();
    
    // Track filter application
    this.trackAINavigation('filters_applied', {
      filters: Object.fromEntries(this.activeFilters),
      filter_count: this.activeFilters.size
    });
    
    // Apply filters via AJAX or page reload
    this.loadFilteredResults(url.toString());
  }
  
  async loadFilteredResults(url) {
    try {
      // Show loading state
      this.showLoadingState();
      
      const response = await fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load filtered results');
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Update product grid
      const newGrid = doc.querySelector('.collection-product-grid');
      const currentGrid = document.querySelector('.collection-product-grid');
      
      if (newGrid && currentGrid) {
        currentGrid.innerHTML = newGrid.innerHTML;
      }
      
      // Update URL without page reload
      window.history.pushState({}, '', url);
      
      // Hide loading state
      this.hideLoadingState();
      
      // Close mobile panel after applying filters
      if (window.innerWidth <= 990) {
        this.closePanel();
      }
      
    } catch (error) {
      console.error('Error loading filtered results:', error);
      this.hideLoadingState();
      
      // Fallback to page reload
      window.location.href = url;
    }
  }
  
  showLoadingState() {
    const grid = document.querySelector('.collection-product-grid');
    if (grid) {
      grid.classList.add('loading');
    }
  }
  
  hideLoadingState() {
    const grid = document.querySelector('.collection-product-grid');
    if (grid) {
      grid.classList.remove('loading');
    }
  }
  
  clearAllFilters() {
    // Reset form
    if (this.form) {
      this.form.reset();
    }
    
    // Clear active filters
    this.activeFilters.clear();
    
    // Reset price sliders
    const minSlider = this.container.querySelector('.collection-filters__price-slider-min');
    const maxSlider = this.container.querySelector('.collection-filters__price-slider-max');
    
    if (minSlider && maxSlider) {
      minSlider.value = this.priceRange.min;
      maxSlider.value = this.priceRange.max;
      this.updatePriceSliderFill();
    }
    
    // Update count
    this.updateFilterCount();
    
    // Apply empty filters
    this.applyFilters();
    
    // Track interaction
    this.trackAINavigation('filters_cleared', {});
  }
  
  loadActiveFilters() {
    // Load filters from URL parameters
    const params = new URLSearchParams(window.location.search);
    
    params.forEach((value, key) => {
      const input = this.form.querySelector(`[name="${key}"][value="${value}"]`);
      if (input) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = true;
        } else {
          input.value = value;
        }
        
        // Update active filters
        this.handleFilterChange({ target: input });
      }
    });
  }
  
  handleFormSubmit(event) {
    event.preventDefault();
    this.applyFilters();
  }
  
  handleKeydown(event) {
    if (!this.isOpen) return;
    
    switch (event.key) {
      case 'Escape':
        this.closePanel();
        break;
        
      case 'Tab':
        this.handleTabKey(event);
        break;
    }
  }
  
  handleTabKey(event) {
    if (!this.focusableElements.length) return;
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement.focus();
      }
    }
  }
  
  handleResize() {
    if (window.innerWidth > 990 && this.isOpen) {
      this.closePanel();
    }
  }
  
  initializeAINavigation() {
    if (typeof window.AINavigation !== 'undefined') {
      this.aiNavigation = new window.AINavigation();
    }
  }
  
  trackAINavigation(action, data = {}) {
    if (this.aiNavigation) {
      this.aiNavigation.track('collection_filters', action, {
        ...data,
        timestamp: Date.now(),
        url: window.location.pathname
      });
    }
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const filterContainers = document.querySelectorAll('.collection-filters');
  
  filterContainers.forEach(container => {
    new CollectionFiltersManager(container);
  });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CollectionFiltersManager;
} else {
  window.CollectionFiltersManager = CollectionFiltersManager;
} 