/**
 * Collection Showcase Manager - Taiga Theme Bubbly Style
 * Handles product filtering, sorting, infinite loading, and AI navigation tracking
 * Following shopirule.mdc guidelines for performance and user experience
 */

class CollectionShowcaseManager {
  constructor() {
    this.sections = document.querySelectorAll('[data-collection-showcase]');
    this.isInitialized = false;
    this.loadingStates = new Map();
    this.currentFilters = new Map();
    this.currentSort = new Map();
    this.loadedProducts = new Map();
    
    this.settings = {
      debounceDelay: 300,
      loadMoreDelay: 500,
      animationDuration: 400,
      intersectionThreshold: 0.1,
      maxRetries: 3,
      cacheExpiry: 300000 // 5 minutes
    };

    this.cache = new Map();
    this.observers = new Map();
    this.abortControllers = new Map();

    this.init();
  }

  init() {
    if (this.isInitialized || this.sections.length === 0) return;

    this.sections.forEach(section => {
      this.initializeSection(section);
    });

    this.bindGlobalEvents();
    this.initializeIntersectionObserver();
    this.initializeAINavigation();

    this.isInitialized = true;

    // Track initialization
    this.trackAIEvent('collection_showcase_initialized', {
      sections_count: this.sections.length,
      timestamp: Date.now()
    });
  }

  initializeSection(section) {
    const sectionId = this.getSectionId(section);
    const collectionHandle = section.getAttribute('data-collection-handle');
    const productsLimit = parseInt(section.getAttribute('data-products-limit')) || 8;
    const productsPerRow = parseInt(section.getAttribute('data-products-per-row')) || 4;

    // Initialize section state
    this.loadingStates.set(sectionId, false);
    this.currentFilters.set(sectionId, new Map());
    this.currentSort.set(sectionId, 'manual');
    this.loadedProducts.set(sectionId, productsLimit);

    // Initialize components
    this.initializeFilters(section);
    this.initializeSorting(section);
    this.initializeLoadMore(section);
    this.initializeQuickBuy(section);
    this.initializeProductCards(section);

    // Track section initialization
    this.trackAIEvent('collection_section_initialized', {
      section_id: sectionId,
      collection_handle: collectionHandle,
      products_limit: productsLimit,
      products_per_row: productsPerRow,
      timestamp: Date.now()
    });
  }

  initializeFilters(section) {
    const filtersToggle = section.querySelector('[data-filters-toggle]');
    const filtersPanel = section.querySelector('[data-filters-panel]');
    
    if (!filtersToggle || !filtersPanel) return;

    const sectionId = this.getSectionId(section);
    const collectionHandle = section.getAttribute('data-collection-handle');

    // Load filters dynamically
    this.loadFilters(collectionHandle, filtersPanel);

    // Toggle filters panel
    filtersToggle.addEventListener('click', () => {
      const isExpanded = filtersToggle.getAttribute('aria-expanded') === 'true';
      
      filtersToggle.setAttribute('aria-expanded', !isExpanded);
      filtersPanel.setAttribute('aria-expanded', !isExpanded);

      // Track filter toggle
      this.trackAIEvent('collection_filters_toggled', {
        section_id: sectionId,
        expanded: !isExpanded,
        timestamp: Date.now()
      });
    });

    // Handle filter changes
    filtersPanel.addEventListener('change', (event) => {
      if (event.target.matches('[data-filter-option]')) {
        this.handleFilterChange(section, event.target);
      }
    });

    // Close filters when clicking outside
    document.addEventListener('click', (event) => {
      if (!filtersToggle.contains(event.target) && !filtersPanel.contains(event.target)) {
        filtersToggle.setAttribute('aria-expanded', 'false');
        filtersPanel.setAttribute('aria-expanded', 'false');
      }
    });
  }

  async loadFilters(collectionHandle, filtersPanel) {
    try {
      filtersPanel.innerHTML = '<div class="filters-loading">' + 
        '<div class="spinner"></div>' +
        'Loading filters...' +
        '</div>';

      // Simulate API call to get filters
      // In a real implementation, this would fetch from Shopify's Filter API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const filtersHTML = this.generateFiltersHTML();
      filtersPanel.innerHTML = filtersHTML;

    } catch (error) {
      console.error('Failed to load filters:', error);
      filtersPanel.innerHTML = '<div class="filters-error">Failed to load filters. Please try again.</div>';
    }
  }

  generateFiltersHTML() {
    // Generate mock filters HTML
    return `
      <div class="filter-group">
        <h4 class="filter-group__title">Price</h4>
        <div class="filter-options">
          <label class="filter-option">
            <input type="checkbox" data-filter-option data-filter-type="price" value="0-25">
            <span>Under $25</span>
          </label>
          <label class="filter-option">
            <input type="checkbox" data-filter-option data-filter-type="price" value="25-50">
            <span>$25 - $50</span>
          </label>
          <label class="filter-option">
            <input type="checkbox" data-filter-option data-filter-type="price" value="50-100">
            <span>$50 - $100</span>
          </label>
          <label class="filter-option">
            <input type="checkbox" data-filter-option data-filter-type="price" value="100+">
            <span>$100+</span>
          </label>
        </div>
      </div>
      <div class="filter-group">
        <h4 class="filter-group__title">Size</h4>
        <div class="filter-options">
          <label class="filter-option">
            <input type="checkbox" data-filter-option data-filter-type="size" value="XS">
            <span>XS</span>
          </label>
          <label class="filter-option">
            <input type="checkbox" data-filter-option data-filter-type="size" value="S">
            <span>S</span>
          </label>
          <label class="filter-option">
            <input type="checkbox" data-filter-option data-filter-type="size" value="M">
            <span>M</span>
          </label>
          <label class="filter-option">
            <input type="checkbox" data-filter-option data-filter-type="size" value="L">
            <span>L</span>
          </label>
          <label class="filter-option">
            <input type="checkbox" data-filter-option data-filter-type="size" value="XL">
            <span>XL</span>
          </label>
        </div>
      </div>
      <div class="filter-group">
        <h4 class="filter-group__title">Color</h4>
        <div class="filter-options filter-options--color">
          <label class="filter-option filter-option--color">
            <input type="checkbox" data-filter-option data-filter-type="color" value="red">
            <span class="color-swatch" style="background-color: #ff0000;" aria-label="Red"></span>
          </label>
          <label class="filter-option filter-option--color">
            <input type="checkbox" data-filter-option data-filter-type="color" value="blue">
            <span class="color-swatch" style="background-color: #0000ff;" aria-label="Blue"></span>
          </label>
          <label class="filter-option filter-option--color">
            <input type="checkbox" data-filter-option data-filter-type="color" value="green">
            <span class="color-swatch" style="background-color: #00ff00;" aria-label="Green"></span>
          </label>
          <label class="filter-option filter-option--color">
            <input type="checkbox" data-filter-option data-filter-type="color" value="black">
            <span class="color-swatch" style="background-color: #000000;" aria-label="Black"></span>
          </label>
          <label class="filter-option filter-option--color">
            <input type="checkbox" data-filter-option data-filter-type="color" value="white">
            <span class="color-swatch" style="background-color: #ffffff;" aria-label="White"></span>
          </label>
        </div>
      </div>
    `;
  }

  initializeSorting(section) {
    const sortSelect = section.querySelector('[data-sorting-select]');
    if (!sortSelect) return;

    const sectionId = this.getSectionId(section);

    sortSelect.addEventListener('change', (event) => {
      const newSort = event.target.value;
      this.currentSort.set(sectionId, newSort);
      
      this.trackAIEvent('collection_sort_changed', {
        section_id: sectionId,
        sort_type: newSort,
        timestamp: Date.now()
      });

      this.applyFiltersAndSort(section);
    });
  }

  initializeLoadMore(section) {
    const loadMoreBtn = section.querySelector('[data-load-more-btn]');
    if (!loadMoreBtn) return;

    const sectionId = this.getSectionId(section);

    loadMoreBtn.addEventListener('click', () => {
      this.loadMoreProducts(section);
    });

    // Track load more button visibility
    this.observeLoadMoreButton(section);
  }

  initializeQuickBuy(section) {
    const quickBuyButtons = section.querySelectorAll('[data-quick-buy-btn]');
    
    quickBuyButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const productId = button.getAttribute('data-product-id');
        this.openQuickBuy(section, productId);
      });
    });
  }

  initializeProductCards(section) {
    const productCards = section.querySelectorAll('[data-product-card]');
    
    productCards.forEach(card => {
      this.addProductCardInteractions(card);
    });
  }

  addProductCardInteractions(card) {
    let hoverTimeout;
    const productId = card.getAttribute('data-product-id');

    // Enhanced hover effects
    card.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      card.style.transform = 'translateY(-8px)';
      
      // Preload additional product data on hover
      hoverTimeout = setTimeout(() => {
        this.preloadProductData(productId);
      }, 500);
    });

    card.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      card.style.transform = '';
    });

    // Track product card interactions
    card.addEventListener('click', (event) => {
      if (!event.target.closest('[data-quick-buy-btn]')) {
        this.trackAIEvent('product_card_clicked', {
          product_id: productId,
          click_type: 'product_view',
          timestamp: Date.now()
        });
      }
    });
  }

  handleFilterChange(section, filterOption) {
    const sectionId = this.getSectionId(section);
    const filterType = filterOption.getAttribute('data-filter-type');
    const filterValue = filterOption.value;
    const isChecked = filterOption.checked;

    // Update current filters
    const sectionFilters = this.currentFilters.get(sectionId);
    if (!sectionFilters.has(filterType)) {
      sectionFilters.set(filterType, new Set());
    }

    const typeFilters = sectionFilters.get(filterType);
    if (isChecked) {
      typeFilters.add(filterValue);
    } else {
      typeFilters.delete(filterValue);
    }

    // Track filter change
    this.trackAIEvent('collection_filter_changed', {
      section_id: sectionId,
      filter_type: filterType,
      filter_value: filterValue,
      checked: isChecked,
      timestamp: Date.now()
    });

    // Apply filters with debounce
    this.debounceFilterApplication(section);
  }

  debounceFilterApplication(section) {
    const sectionId = this.getSectionId(section);
    
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.filterTimeout = setTimeout(() => {
      this.applyFiltersAndSort(section);
    }, this.settings.debounceDelay);
  }

  async applyFiltersAndSort(section) {
    if (this.loadingStates.get(this.getSectionId(section))) return;

    const sectionId = this.getSectionId(section);
    const collectionHandle = section.getAttribute('data-collection-handle');
    const productsContainer = section.querySelector('[data-products-container]');
    const loadingContainer = section.querySelector('[data-products-loading]');

    // Set loading state
    this.setLoadingState(section, true);
    
    try {
      // Show loading skeleton
      loadingContainer.style.display = 'block';
      productsContainer.style.opacity = '0.5';

      // Build query parameters
      const queryParams = this.buildQueryParams(sectionId);
      
      // Fetch filtered products
      const response = await this.fetchFilteredProducts(collectionHandle, queryParams);
      
      // Update products grid
      await this.updateProductsGrid(section, response.products);
      
      // Update load more button
      this.updateLoadMoreButton(section, response);

      // Track successful filter application
      this.trackAIEvent('collection_filters_applied', {
        section_id: sectionId,
        filters: Object.fromEntries(this.currentFilters.get(sectionId)),
        sort: this.currentSort.get(sectionId),
        results_count: response.products.length,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Failed to apply filters:', error);
      this.showErrorMessage(section, 'Failed to load products. Please try again.');
      
      // Track error
      this.trackAIEvent('collection_filter_error', {
        section_id: sectionId,
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      // Hide loading skeleton
      loadingContainer.style.display = 'none';
      productsContainer.style.opacity = '1';
      
      this.setLoadingState(section, false);
    }
  }

  buildQueryParams(sectionId) {
    const filters = this.currentFilters.get(sectionId);
    const sort = this.currentSort.get(sectionId);
    const params = new URLSearchParams();

    // Add sort parameter
    if (sort && sort !== 'manual') {
      params.append('sort', sort);
    }

    // Add filter parameters
    filters.forEach((values, type) => {
      if (values.size > 0) {
        params.append(`filter_${type}`, Array.from(values).join(','));
      }
    });

    return params;
  }

  async fetchFilteredProducts(collectionHandle, queryParams) {
    // Simulate API call to Shopify collection with filters
    // In a real implementation, this would use Shopify's AJAX API
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    return {
      products: [
        // Mock product data would be here
      ],
      total_count: 24,
      has_more: true
    };
  }

  async updateProductsGrid(section, products) {
    const productsContainer = section.querySelector('[data-products-container]');
    
    // Animate out existing products
    const existingCards = productsContainer.querySelectorAll('[data-product-card]');
    existingCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
      }, index * 50);
    });

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 400));

    // Update products HTML
    productsContainer.innerHTML = this.generateProductsHTML(products);

    // Animate in new products
    const newCards = productsContainer.querySelectorAll('[data-product-card]');
    newCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        
        // Initialize interactions for new cards
        this.addProductCardInteractions(card);
      }, index * 100);
    });
  }

  generateProductsHTML(products) {
    // Generate mock products HTML
    // In a real implementation, this would render actual product data
    return `
      <div class="product-card-wrapper" data-product-card data-product-id="1">
        <div class="product-card">
          <div class="product-card__image-wrapper">
            <img src="https://via.placeholder.com/300x400" alt="Product" class="product-card__image">
          </div>
          <div class="product-card__content">
            <h3 class="product-card__title">Sample Product</h3>
            <div class="product-card__price">$29.99</div>
            <button class="product-card__quick-buy" data-quick-buy-btn data-product-id="1">
              Quick Buy
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async loadMoreProducts(section) {
    if (this.loadingStates.get(this.getSectionId(section))) return;

    const sectionId = this.getSectionId(section);
    const collectionHandle = section.getAttribute('data-collection-handle');
    const loadMoreBtn = section.querySelector('[data-load-more-btn]');
    const productsContainer = section.querySelector('[data-products-container]');
    
    const currentlyLoaded = this.loadedProducts.get(sectionId);
    const loadMoreAmount = 8; // Load 8 more products

    // Set loading state
    this.setLoadingState(section, true);
    loadMoreBtn.setAttribute('data-loading', 'true');
    loadMoreBtn.disabled = true;

    try {
      // Fetch more products
      const response = await this.fetchMoreProducts(collectionHandle, currentlyLoaded, loadMoreAmount);
      
      // Append new products
      const newProductsHTML = this.generateProductsHTML(response.products);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newProductsHTML;
      
      // Animate in new products
      const newCards = tempDiv.querySelectorAll('[data-product-card]');
      newCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        productsContainer.appendChild(card);
        
        setTimeout(() => {
          card.style.transition = 'all 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
          
          // Initialize interactions
          this.addProductCardInteractions(card);
        }, index * 100);
      });

      // Update loaded count
      this.loadedProducts.set(sectionId, currentlyLoaded + response.products.length);
      
      // Update load more button
      this.updateLoadMoreButton(section, response);

      // Track successful load more
      this.trackAIEvent('collection_load_more_success', {
        section_id: sectionId,
        products_loaded: response.products.length,
        total_loaded: currentlyLoaded + response.products.length,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Failed to load more products:', error);
      this.showErrorMessage(section, 'Failed to load more products. Please try again.');
      
      // Track error
      this.trackAIEvent('collection_load_more_error', {
        section_id: sectionId,
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      this.setLoadingState(section, false);
      loadMoreBtn.setAttribute('data-loading', 'false');
      loadMoreBtn.disabled = false;
    }
  }

  async fetchMoreProducts(collectionHandle, offset, limit) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    return {
      products: [
        // Mock product data
      ],
      has_more: false
    };
  }

  updateLoadMoreButton(section, response) {
    const loadMoreBtn = section.querySelector('[data-load-more-btn]');
    if (!loadMoreBtn) return;

    if (!response.has_more) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
  }

  observeLoadMoreButton(section) {
    const loadMoreBtn = section.querySelector('[data-load-more-btn]');
    if (!loadMoreBtn) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.trackAIEvent('load_more_button_visible', {
            section_id: this.getSectionId(section),
            timestamp: Date.now()
          });
        }
      });
    }, { threshold: this.settings.intersectionThreshold });

    observer.observe(loadMoreBtn);
  }

  openQuickBuy(section, productId) {
    const quickBuyModal = section.querySelector(`#quick-buy-modal-${this.getSectionId(section)}`);
    if (!quickBuyModal) return;

    // Initialize quick buy with product data
    if (typeof window.QuickBuy !== 'undefined') {
      window.QuickBuy.openModal(productId);
    }

    // Track quick buy open
    this.trackAIEvent('quick_buy_opened', {
      section_id: this.getSectionId(section),
      product_id: productId,
      timestamp: Date.now()
    });
  }

  preloadProductData(productId) {
    // Preload product data for faster quick buy experience
    const cacheKey = `product_${productId}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.settings.cacheExpiry) {
        return cached.data;
      }
    }

    // Simulate preload
    const productData = { id: productId, preloaded: true };
    this.cache.set(cacheKey, {
      data: productData,
      timestamp: Date.now()
    });
  }

  setLoadingState(section, isLoading) {
    const sectionId = this.getSectionId(section);
    this.loadingStates.set(sectionId, isLoading);
    
    if (isLoading) {
      section.setAttribute('data-loading', 'true');
    } else {
      section.removeAttribute('data-loading');
    }
  }

  showErrorMessage(section, message) {
    const errorContainer = section.querySelector('[data-error-message]') || 
                          this.createErrorContainer(section);
    
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    setTimeout(() => {
      errorContainer.style.display = 'none';
    }, 5000);
  }

  createErrorContainer(section) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'collection-error-message';
    errorContainer.setAttribute('data-error-message', '');
    errorContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      z-index: 9999;
      display: none;
    `;
    
    section.appendChild(errorContainer);
    return errorContainer;
  }

  getSectionId(section) {
    return section.className.match(/collection-showcase-(\w+)/)?.[1] || 'default';
  }

  bindGlobalEvents() {
    // Handle theme editor updates
    document.addEventListener('shopify:section:load', (event) => {
      const section = event.target.querySelector('[data-collection-showcase]');
      if (section) {
        this.initializeSection(section);
      }
    });

    document.addEventListener('shopify:section:unload', (event) => {
      const section = event.target.querySelector('[data-collection-showcase]');
      if (section) {
        this.cleanupSection(section);
      }
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause any ongoing operations
        this.abortControllers.forEach(controller => controller.abort());
      }
    });
  }

  initializeIntersectionObserver() {
    // Observe section visibility for performance tracking
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const section = entry.target;
        const sectionId = this.getSectionId(section);
        
        if (entry.isIntersecting) {
          this.trackAIEvent('collection_section_visible', {
            section_id: sectionId,
            timestamp: Date.now()
          });
        }
      });
    }, { threshold: this.settings.intersectionThreshold });

    this.sections.forEach(section => {
      observer.observe(section);
    });
  }

  initializeAINavigation() {
    // Enhanced AI tracking for collection showcase
    this.sections.forEach(section => {
      this.addScrollDepthTracking(section);
      this.addTimeSpentTracking(section);
    });
  }

  addScrollDepthTracking(section) {
    const sectionId = this.getSectionId(section);
    let maxScrollDepth = 0;
    let hasTracked25 = false;
    let hasTracked50 = false;
    let hasTracked75 = false;
    let hasTracked100 = false;

    const trackScrollDepth = () => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      if (rect.top < viewportHeight && rect.bottom > 0) {
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const scrollDepth = Math.min(100, (visibleHeight / sectionHeight) * 100);
        
        if (scrollDepth > maxScrollDepth) {
          maxScrollDepth = scrollDepth;
          
          if (!hasTracked25 && scrollDepth >= 25) {
            hasTracked25 = true;
            this.trackAIEvent('collection_scroll_depth_25', { section_id: sectionId, timestamp: Date.now() });
          }
          if (!hasTracked50 && scrollDepth >= 50) {
            hasTracked50 = true;
            this.trackAIEvent('collection_scroll_depth_50', { section_id: sectionId, timestamp: Date.now() });
          }
          if (!hasTracked75 && scrollDepth >= 75) {
            hasTracked75 = true;
            this.trackAIEvent('collection_scroll_depth_75', { section_id: sectionId, timestamp: Date.now() });
          }
          if (!hasTracked100 && scrollDepth >= 100) {
            hasTracked100 = true;
            this.trackAIEvent('collection_scroll_depth_100', { section_id: sectionId, timestamp: Date.now() });
          }
        }
      }
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });
  }

  addTimeSpentTracking(section) {
    const sectionId = this.getSectionId(section);
    let startTime = null;
    let totalTime = 0;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !startTime) {
          startTime = Date.now();
        } else if (!entry.isIntersecting && startTime) {
          totalTime += Date.now() - startTime;
          startTime = null;
          
          this.trackAIEvent('collection_time_spent', {
            section_id: sectionId,
            time_spent: totalTime,
            timestamp: Date.now()
          });
        }
      });
    }, { threshold: 0.5 });

    observer.observe(section);
  }

  trackAIEvent(eventName, data) {
    if (typeof window.aiNavigation !== 'undefined') {
      window.aiNavigation.trackEvent(eventName, data);
    }
  }

  cleanupSection(section) {
    const sectionId = this.getSectionId(section);
    
    // Clear timeouts
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    // Clear observers
    if (this.observers.has(sectionId)) {
      this.observers.get(sectionId).disconnect();
      this.observers.delete(sectionId);
    }

    // Clear abort controllers
    if (this.abortControllers.has(sectionId)) {
      this.abortControllers.get(sectionId).abort();
      this.abortControllers.delete(sectionId);
    }

    // Clear state
    this.loadingStates.delete(sectionId);
    this.currentFilters.delete(sectionId);
    this.currentSort.delete(sectionId);
    this.loadedProducts.delete(sectionId);
  }

  // Public API methods
  refresh() {
    this.sections.forEach(section => {
      this.applyFiltersAndSort(section);
    });
  }

  clearFilters(sectionId) {
    this.currentFilters.set(sectionId, new Map());
    const section = document.querySelector(`[class*="collection-showcase-${sectionId}"]`);
    if (section) {
      // Clear all filter checkboxes
      const checkboxes = section.querySelectorAll('[data-filter-option]');
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
      
      this.applyFiltersAndSort(section);
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }
}

// Initialize collection showcase manager
document.addEventListener('DOMContentLoaded', () => {
  window.collectionShowcaseManager = new CollectionShowcaseManager();
});

// AOS (Animate On Scroll) integration
if (typeof AOS !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
      duration: 400,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100
    });
  });
} 