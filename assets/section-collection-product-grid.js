/**
 * Collection Product Grid Component - Bubbly Theme
 * Handles sorting, filtering, pagination, quick view, and AI Navigation integration
 */

class CollectionProductGrid {
  constructor(element) {
    this.element = element;
    this.collectionHandle = element.dataset.collectionHandle;
    this.productsPerPage = parseInt(element.dataset.productsPerPage) || 24;
    this.infiniteScroll = element.dataset.infiniteScroll === 'true';
    this.animationDelay = parseInt(element.dataset.animationDelay) || 100;
    
    // Elements
    this.productGrid = element.querySelector('[data-product-grid]');
    this.sortSelect = element.querySelector('[data-sort-select]');
    this.viewButtons = element.querySelectorAll('[data-view]');
    this.loadMoreButton = element.querySelector('[data-load-more-button]');
    this.loadingOverlay = element.querySelector('[data-loading-overlay]');
    
    // State
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMoreProducts = true;
    this.currentView = 'grid';
    this.currentSort = 'manual';
    
    // AI Navigation integration
    this.aiNavigation = window.AINavigation || null;
    
    // Performance
    this.intersectionObserver = null;
    this.loadMoreObserver = null;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.setupQuickView();
    
    if (this.infiniteScroll) {
      this.setupInfiniteScroll();
    }
    
    this.initializeAnimations();
    this.trackInitialView();
    
    console.log('Collection Product Grid initialized');
  }
  
  setupEventListeners() {
    // Sort functionality
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        this.handleSortChange(e.target.value);
      });
    }
    
    // View toggle
    this.viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleViewChange(button.dataset.view);
      });
    });
    
    // Load more button
    if (this.loadMoreButton) {
      this.loadMoreButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadMoreProducts();
      });
    }
    
    // Product interactions
    this.setupProductInteractions();
    
    // Window events
    window.addEventListener('popstate', (e) => {
      this.handlePopState(e);
    });
  }
  
  setupProductInteractions() {
    // Quick view buttons
    this.element.addEventListener('click', (e) => {
      const quickViewBtn = e.target.closest('[data-quick-view]');
      if (quickViewBtn) {
        e.preventDefault();
        this.handleQuickView(quickViewBtn.dataset.productUrl);
      }
      
      // Quick add buttons
      const quickAddBtn = e.target.closest('[data-quick-add]');
      if (quickAddBtn) {
        e.preventDefault();
        this.handleQuickAdd(quickAddBtn);
      }
      
      // Wishlist buttons
      const wishlistBtn = e.target.closest('[data-wishlist]');
      if (wishlistBtn) {
        e.preventDefault();
        this.handleWishlist(wishlistBtn);
      }
    });
    
    // Product card hover tracking
    this.element.addEventListener('mouseenter', (e) => {
      const productCard = e.target.closest('.product-card');
      if (productCard) {
        this.trackProductHover(productCard);
      }
    }, true);
  }
  
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const productCard = entry.target.closest('.product-card');
          if (productCard) {
            this.trackProductView(productCard);
          }
          
          // Trigger animation
          entry.target.classList.add('aos-animate');
        }
      });
    }, options);
    
    // Observe product cards
    this.observeProductCards();
  }
  
  observeProductCards() {
    const productItems = this.productGrid?.querySelectorAll('.product-grid__item') || [];
    productItems.forEach(item => {
      this.intersectionObserver.observe(item);
    });
  }
  
  setupInfiniteScroll() {
    if (!this.loadMoreButton) return;
    
    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0
    };
    
    this.loadMoreObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading && this.hasMoreProducts) {
          this.loadMoreProducts();
        }
      });
    }, options);
    
    this.loadMoreObserver.observe(this.loadMoreButton);
  }
  
  setupQuickView() {
    this.quickViewModal = document.getElementById('QuickViewModal');
    if (!this.quickViewModal) return;
    
    // Close modal events
    const closeButtons = this.quickViewModal.querySelectorAll('[data-quick-view-close]');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeQuickView();
      });
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.quickViewModal.classList.contains('active')) {
        this.closeQuickView();
      }
    });
  }
  
  handleSortChange(sortValue) {
    this.currentSort = sortValue;
    this.showLoading();
    
    const url = new URL(window.location);
    url.searchParams.set('sort_by', sortValue);
    
    this.trackAIEvent('collection_sorted', {
      sort_by: sortValue,
      collection: this.collectionHandle
    });
    
    this.updateURL(url.toString());
    this.reloadProducts();
  }
  
  handleViewChange(view) {
    this.currentView = view;
    
    // Update button states
    this.viewButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Update grid class
    if (this.productGrid) {
      this.productGrid.classList.toggle('product-grid--list', view === 'list');
    }
    
    this.trackAIEvent('collection_view_changed', {
      view: view,
      collection: this.collectionHandle
    });
  }
  
  async loadMoreProducts() {
    if (this.isLoading || !this.hasMoreProducts) return;
    
    this.isLoading = true;
    this.currentPage++;
    
    if (this.loadMoreButton) {
      this.loadMoreButton.setAttribute('data-loading', '');
    }
    
    try {
      const url = new URL(window.location);
      url.searchParams.set('page', this.currentPage);
      
      const response = await fetch(url.toString());
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const newProducts = doc.querySelectorAll('.product-grid__item');
      const newPagination = doc.querySelector('.collection-load-more');
      
      if (newProducts.length > 0) {
        this.appendProducts(newProducts);
        this.trackAIEvent('collection_load_more', {
          page: this.currentPage,
          products_loaded: newProducts.length,
          collection: this.collectionHandle
        });
      } else {
        this.hasMoreProducts = false;
        if (this.loadMoreButton) {
          this.loadMoreButton.style.display = 'none';
        }
      }
      
      // Update pagination state
      if (!newPagination?.querySelector('[data-load-more-button]')) {
        this.hasMoreProducts = false;
        if (this.loadMoreButton) {
          this.loadMoreButton.style.display = 'none';
        }
      }
      
    } catch (error) {
      console.error('Failed to load more products:', error);
      this.trackAIEvent('collection_load_more_error', {
        error: error.message,
        page: this.currentPage,
        collection: this.collectionHandle
      });
    } finally {
      this.isLoading = false;
      if (this.loadMoreButton) {
        this.loadMoreButton.removeAttribute('data-loading');
      }
    }
  }
  
  appendProducts(newProducts) {
    const fragment = document.createDocumentFragment();
    
    newProducts.forEach((product, index) => {
      const clonedProduct = product.cloneNode(true);
      
      // Add animation delay
      const delay = (this.productGrid.children.length + index) * this.animationDelay;
      clonedProduct.style.animationDelay = `${delay}ms`;
      
      // Reset animation state
      clonedProduct.classList.remove('aos-animate');
      
      fragment.appendChild(clonedProduct);
    });
    
    this.productGrid.appendChild(fragment);
    
    // Re-observe new products
    this.observeProductCards();
    
    // Initialize new product interactions
    this.initializeNewProducts();
  }
  
  initializeNewProducts() {
    // Initialize any new components (quick add, wishlist, etc.)
    const newProducts = this.productGrid.querySelectorAll('.product-grid__item:not([data-initialized])');
    
    newProducts.forEach(product => {
      product.setAttribute('data-initialized', '');
      
      // Initialize product card animations
      if (window.theme && window.theme.initializeProductCard) {
        window.theme.initializeProductCard(product);
      }
    });
  }
  
  async handleQuickView(productUrl) {
    if (!this.quickViewModal || !productUrl) return;
    
    this.showLoading();
    
    try {
      const response = await fetch(`${productUrl}?view=quick-view`);
      const html = await response.text();
      
      const contentContainer = this.quickViewModal.querySelector('[data-quick-view-content]');
      if (contentContainer) {
        contentContainer.innerHTML = html;
      }
      
      this.openQuickView();
      
      this.trackAIEvent('product_quick_view', {
        product_url: productUrl,
        collection: this.collectionHandle
      });
      
    } catch (error) {
      console.error('Failed to load quick view:', error);
    } finally {
      this.hideLoading();
    }
  }
  
  openQuickView() {
    if (!this.quickViewModal) return;
    
    this.quickViewModal.classList.add('active');
    document.body.classList.add('modal-open');
    
    // Focus management
    const firstFocusable = this.quickViewModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }
  
  closeQuickView() {
    if (!this.quickViewModal) return;
    
    this.quickViewModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    
    // Clear content after animation
    setTimeout(() => {
      const contentContainer = this.quickViewModal.querySelector('[data-quick-view-content]');
      if (contentContainer) {
        contentContainer.innerHTML = '';
      }
    }, 300);
  }
  
  async handleQuickAdd(button) {
    const productId = button.dataset.productId;
    const variantId = button.dataset.variantId;
    
    if (!variantId) return;
    
    button.setAttribute('data-loading', '');
    
    try {
      const formData = new FormData();
      formData.append('id', variantId);
      formData.append('quantity', '1');
      
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update cart
        if (window.theme && window.theme.updateCart) {
          window.theme.updateCart();
        }
        
        // Show success feedback
        this.showQuickAddSuccess(button);
        
        this.trackAIEvent('product_quick_add', {
          product_id: productId,
          variant_id: variantId,
          collection: this.collectionHandle
        });
        
      } else {
        throw new Error('Failed to add product to cart');
      }
      
    } catch (error) {
      console.error('Quick add failed:', error);
      this.showQuickAddError(button);
    } finally {
      button.removeAttribute('data-loading');
    }
  }
  
  showQuickAddSuccess(button) {
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.classList.add('success');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('success');
    }, 2000);
  }
  
  showQuickAddError(button) {
    const originalText = button.textContent;
    button.textContent = 'Error';
    button.classList.add('error');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('error');
    }, 2000);
  }
  
  handleWishlist(button) {
    const productId = button.dataset.productId;
    const isAdded = button.classList.contains('added');
    
    // Toggle wishlist state
    button.classList.toggle('added');
    
    // Update button text/icon
    const text = button.querySelector('.wishlist-text');
    if (text) {
      text.textContent = isAdded ? 'Add to Wishlist' : 'Added to Wishlist';
    }
    
    this.trackAIEvent('product_wishlist_toggle', {
      product_id: productId,
      action: isAdded ? 'remove' : 'add',
      collection: this.collectionHandle
    });
    
    // Integrate with wishlist system
    if (window.wishlist && window.wishlist.toggle) {
      window.wishlist.toggle(productId);
    }
  }
  
  async reloadProducts() {
    try {
      const response = await fetch(window.location.toString());
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const newGrid = doc.querySelector('[data-product-grid]');
      const newToolbar = doc.querySelector('.collection-toolbar');
      
      if (newGrid && this.productGrid) {
        this.productGrid.innerHTML = newGrid.innerHTML;
        this.observeProductCards();
        this.initializeAnimations();
      }
      
      if (newToolbar) {
        const currentToolbar = this.element.querySelector('.collection-toolbar');
        if (currentToolbar) {
          // Update count
          const newCount = newToolbar.querySelector('.collection-toolbar__count-text');
          const currentCount = currentToolbar.querySelector('.collection-toolbar__count-text');
          if (newCount && currentCount) {
            currentCount.textContent = newCount.textContent;
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to reload products:', error);
    } finally {
      this.hideLoading();
    }
  }
  
  initializeAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    const productItems = this.productGrid?.querySelectorAll('.product-grid__item') || [];
    productItems.forEach((item, index) => {
      item.style.animationDelay = `${index * this.animationDelay}ms`;
    });
  }
  
  showLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('active');
    }
  }
  
  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove('active');
    }
  }
  
  updateURL(url) {
    if (window.history && window.history.pushState) {
      window.history.pushState({}, '', url);
    }
  }
  
  handlePopState(event) {
    // Handle browser back/forward navigation
    this.showLoading();
    this.reloadProducts();
  }
  
  // Analytics and tracking
  trackInitialView() {
    const productCount = this.productGrid?.children.length || 0;
    
    this.trackAIEvent('collection_viewed', {
      collection: this.collectionHandle,
      product_count: productCount,
      view: this.currentView,
      sort: this.currentSort,
      page: this.currentPage
    });
  }
  
  trackProductView(productCard) {
    const productId = productCard.dataset.productId;
    const productTitle = productCard.querySelector('.product-card__title')?.textContent.trim();
    const productPrice = productCard.querySelector('.product-card__price')?.textContent.trim();
    
    if (productId) {
      this.trackAIEvent('product_viewed_in_collection', {
        product_id: productId,
        product_title: productTitle,
        product_price: productPrice,
        collection: this.collectionHandle,
        position: Array.from(this.productGrid.children).indexOf(productCard) + 1
      });
    }
  }
  
  trackProductHover(productCard) {
    const productId = productCard.dataset.productId;
    
    if (productId && !productCard.dataset.hoverTracked) {
      productCard.dataset.hoverTracked = 'true';
      
      this.trackAIEvent('product_hovered_in_collection', {
        product_id: productId,
        collection: this.collectionHandle,
        position: Array.from(this.productGrid.children).indexOf(productCard) + 1
      });
    }
  }
  
  trackAIEvent(eventName, data = {}) {
    if (this.aiNavigation && typeof this.aiNavigation.trackEvent === 'function') {
      this.aiNavigation.trackEvent(eventName, {
        ...data,
        component: 'collection_product_grid',
        timestamp: Date.now(),
        page_type: 'collection',
        url: window.location.href
      });
    }
    
    // Fallback to dataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        component: 'collection_product_grid',
        ...data
      });
    }
  }
  
  // Cleanup
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.loadMoreObserver) {
      this.loadMoreObserver.disconnect();
    }
    
    // Remove event listeners
    window.removeEventListener('popstate', this.handlePopState);
  }
}

// Initialize collection product grids
document.addEventListener('DOMContentLoaded', () => {
  const collectionGrids = document.querySelectorAll('[data-collection-grid]');
  
  collectionGrids.forEach(grid => {
    try {
      new CollectionProductGrid(grid);
    } catch (error) {
      console.error('Failed to initialize collection product grid:', error);
    }
  });
});

// Handle dynamic content loading
if (window.theme) {
  window.theme.initializeCollectionGrid = (element) => {
    if (element && element.hasAttribute('data-collection-grid')) {
      new CollectionProductGrid(element);
    }
  };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CollectionProductGrid;
} 