/**
 * Collection Pagination Manager
 * Handles traditional pagination and infinite scroll with Bubbly animations and AI Navigation
 */
class CollectionPaginationManager {
  constructor(container) {
    this.container = container;
    this.paginationType = container.getAttribute('data-pagination-type') || 'traditional';
    this.currentPage = parseInt(container.getAttribute('data-current-page')) || 1;
    this.totalPages = parseInt(container.getAttribute('data-total-pages')) || 1;
    this.perPage = parseInt(container.getAttribute('data-per-page')) || 24;
    
    // Traditional pagination elements
    this.navButtons = container.querySelectorAll('.collection-pagination__button');
    this.pageLinks = container.querySelectorAll('.collection-pagination__page-link');
    
    // Infinite scroll elements
    this.infiniteContainer = container.querySelector('.collection-pagination__infinite');
    this.loadMoreButton = container.querySelector('.collection-pagination__load-more-button');
    this.infiniteStatus = container.querySelector('.collection-pagination__infinite-status');
    this.statusText = container.querySelector('.collection-pagination__status-text');
    this.loadingOverlay = container.querySelector('.collection-pagination__loading-overlay');
    
    this.isLoading = false;
    this.hasMore = true;
    this.threshold = 200;
    this.autoLoad = true;
    this.loadedPages = new Set([this.currentPage]);
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.initializeInfiniteScroll();
    this.initializeAINavigation();
    this.setupAccessibility();
    
    console.log('Collection Pagination initialized:', this.paginationType);
  }
  
  setupEventListeners() {
    // Traditional pagination
    this.navButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleNavigation(e));
    });
    
    this.pageLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handlePageNavigation(e));
    });
    
    // Infinite scroll
    if (this.loadMoreButton) {
      this.loadMoreButton.addEventListener('click', (e) => this.handleLoadMore(e));
    }
    
    // Scroll detection for infinite scroll
    if (this.paginationType === 'infinite' && this.autoLoad) {
      this.setupScrollDetection();
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }
  
  setupAccessibility() {
    // Add ARIA labels to navigation
    this.navButtons.forEach(button => {
      if (button.classList.contains('collection-pagination__button--disabled')) {
        button.setAttribute('aria-disabled', 'true');
        button.setAttribute('tabindex', '-1');
      }
    });
    
    // Set up infinite scroll announcements
    if (this.infiniteStatus) {
      this.infiniteStatus.setAttribute('aria-live', 'polite');
      this.infiniteStatus.setAttribute('aria-atomic', 'true');
    }
  }
  
  initializeInfiniteScroll() {
    if (this.paginationType !== 'infinite') return;
    
    // Get settings from data attributes
    if (this.infiniteContainer) {
      this.threshold = parseInt(this.infiniteContainer.getAttribute('data-threshold')) || 200;
      this.hasMore = !!this.infiniteContainer.getAttribute('data-next-url');
    }
    
    // Update button state
    this.updateInfiniteScrollState();
  }
  
  setupScrollDetection() {
    let ticking = false;
    
    const checkScroll = () => {
      if (this.isLoading || !this.hasMore) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
      
      if (distanceFromBottom <= this.threshold) {
        this.loadNextPage();
      }
      
      ticking = false;
    };
    
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(checkScroll);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  
  handleNavigation(event) {
    event.preventDefault();
    
    const button = event.currentTarget;
    if (button.classList.contains('collection-pagination__button--disabled')) {
      return;
    }
    
    const url = button.getAttribute('href');
    if (url) {
      this.navigateToPage(url);
      
      // Track interaction
      this.trackAINavigation('navigation_click', {
        button_type: button.classList.contains('collection-pagination__button--prev') ? 'previous' : 'next',
        current_page: this.currentPage
      });
    }
  }
  
  handlePageNavigation(event) {
    event.preventDefault();
    
    const link = event.currentTarget;
    if (link.classList.contains('collection-pagination__page-link--current')) {
      return;
    }
    
    const url = link.getAttribute('href');
    if (url) {
      this.navigateToPage(url);
      
      // Track interaction
      const pageNumber = this.getPageNumberFromURL(url);
      this.trackAINavigation('page_click', {
        target_page: pageNumber,
        current_page: this.currentPage
      });
    }
  }
  
  handleLoadMore(event) {
    event.preventDefault();
    
    if (this.isLoading || !this.hasMore) return;
    
    this.loadNextPage();
    
    // Track interaction
    this.trackAINavigation('load_more_click', {
      current_page: this.currentPage,
      loaded_pages: Array.from(this.loadedPages)
    });
  }
  
  async navigateToPage(url) {
    if (this.isLoading) return;
    
    try {
      this.showLoadingState();
      
      const response = await fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load page');
      
      const html = await response.text();
      this.updatePageContent(html, url);
      
      // Update URL
      window.history.pushState({}, '', url);
      
      // Scroll to top of collection
      this.scrollToCollection();
      
    } catch (error) {
      console.error('Error loading page:', error);
      
      // Fallback to page reload
      window.location.href = url;
    } finally {
      this.hideLoadingState();
    }
  }
  
  async loadNextPage() {
    if (this.isLoading || !this.hasMore) return;
    
    const nextPageURL = this.getNextPageURL();
    if (!nextPageURL) {
      this.hasMore = false;
      this.updateInfiniteScrollState();
      return;
    }
    
    try {
      this.isLoading = true;
      this.updateLoadMoreButton(true);
      this.updateStatus('Loading more products...');
      
      const response = await fetch(nextPageURL, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load next page');
      
      const html = await response.text();
      this.appendPageContent(html, nextPageURL);
      
      // Update current page
      this.currentPage++;
      this.loadedPages.add(this.currentPage);
      
      // Update URL without triggering navigation
      const url = new URL(window.location);
      url.searchParams.set('page', this.currentPage);
      window.history.replaceState({}, '', url.toString());
      
      this.updateStatus(`Loaded page ${this.currentPage} of ${this.totalPages}`);
      
      // Clear status after delay
      setTimeout(() => {
        this.updateStatus('');
      }, 3000);
      
    } catch (error) {
      console.error('Error loading next page:', error);
      this.updateStatus('Error loading more products. Please try again.');
      
      setTimeout(() => {
        this.updateStatus('');
      }, 5000);
    } finally {
      this.isLoading = false;
      this.updateLoadMoreButton(false);
      this.updateInfiniteScrollState();
    }
  }
  
  updatePageContent(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Update product grid
    const newGrid = doc.querySelector('.collection-product-grid');
    const currentGrid = document.querySelector('.collection-product-grid');
    
    if (newGrid && currentGrid) {
      currentGrid.innerHTML = newGrid.innerHTML;
      
      // Reinitialize grid functionality
      if (typeof CollectionProductGrid !== 'undefined') {
        new CollectionProductGrid(currentGrid);
      }
    }
    
    // Update pagination
    const newPagination = doc.querySelector('.collection-pagination');
    if (newPagination) {
      this.container.innerHTML = newPagination.innerHTML;
      
      // Reinitialize with new content
      this.reinitialize();
    }
    
    // Update sorting/filtering
    const newSorting = doc.querySelector('.collection-sorting');
    const currentSorting = document.querySelector('.collection-sorting');
    
    if (newSorting && currentSorting) {
      const newResultsCount = newSorting.querySelector('.collection-sorting__results-count');
      const currentResultsCount = currentSorting.querySelector('.collection-sorting__results-count');
      
      if (newResultsCount && currentResultsCount) {
        currentResultsCount.innerHTML = newResultsCount.innerHTML;
      }
    }
  }
  
  appendPageContent(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get new products
    const newProducts = doc.querySelectorAll('.collection-product-grid .product-card');
    const currentGrid = document.querySelector('.collection-product-grid .collection-product-grid__products');
    
    if (newProducts.length > 0 && currentGrid) {
      // Animate new products in
      newProducts.forEach((product, index) => {
        product.style.opacity = '0';
        product.style.transform = 'translateY(2rem)';
        currentGrid.appendChild(product);
        
        // Stagger animation
        setTimeout(() => {
          product.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          product.style.opacity = '1';
          product.style.transform = 'translateY(0)';
        }, index * 100);
      });
      
      // Initialize product functionality
      if (typeof window.initializeProductCards === 'function') {
        window.initializeProductCards(currentGrid);
      }
    }
    
    // Update pagination data
    const newPagination = doc.querySelector('.collection-pagination');
    if (newPagination) {
      const nextURL = newPagination.querySelector('[data-next-url]')?.getAttribute('data-next-url');
      this.hasMore = !!nextURL;
      
      if (this.infiniteContainer) {
        this.infiniteContainer.setAttribute('data-next-url', nextURL || '');
      }
    }
  }
  
  updateLoadMoreButton(loading) {
    if (!this.loadMoreButton) return;
    
    if (loading) {
      this.loadMoreButton.classList.add('loading');
      this.loadMoreButton.setAttribute('aria-busy', 'true');
    } else {
      this.loadMoreButton.classList.remove('loading');
      this.loadMoreButton.removeAttribute('aria-busy');
    }
  }
  
  updateInfiniteScrollState() {
    if (!this.loadMoreButton) return;
    
    if (!this.hasMore) {
      this.loadMoreButton.style.display = 'none';
      this.updateStatus('All products loaded');
    } else {
      this.loadMoreButton.style.display = 'inline-flex';
    }
  }
  
  updateStatus(message) {
    if (this.statusText) {
      this.statusText.textContent = message;
    }
  }
  
  getNextPageURL() {
    if (this.infiniteContainer) {
      return this.infiniteContainer.getAttribute('data-next-url');
    }
    
    // Build next page URL
    const url = new URL(window.location);
    url.searchParams.set('page', this.currentPage + 1);
    return url.toString();
  }
  
  getPageNumberFromURL(url) {
    const urlObj = new URL(url, window.location.origin);
    return parseInt(urlObj.searchParams.get('page')) || 1;
  }
  
  scrollToCollection() {
    const collectionGrid = document.querySelector('.collection-product-grid');
    if (collectionGrid) {
      const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
      const offsetTop = collectionGrid.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }
  
  showLoadingState() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('active');
      this.loadingOverlay.setAttribute('aria-hidden', 'false');
    }
    
    // Disable interactions
    this.container.style.pointerEvents = 'none';
  }
  
  hideLoadingState() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove('active');
      this.loadingOverlay.setAttribute('aria-hidden', 'true');
    }
    
    // Re-enable interactions
    this.container.style.pointerEvents = '';
  }
  
  reinitialize() {
    // Update references to new elements
    this.navButtons = this.container.querySelectorAll('.collection-pagination__button');
    this.pageLinks = this.container.querySelectorAll('.collection-pagination__page-link');
    this.loadMoreButton = this.container.querySelector('.collection-pagination__load-more-button');
    this.infiniteStatus = this.container.querySelector('.collection-pagination__infinite-status');
    this.statusText = this.container.querySelector('.collection-pagination__status-text');
    
    // Update data attributes
    this.currentPage = parseInt(this.container.getAttribute('data-current-page')) || 1;
    this.totalPages = parseInt(this.container.getAttribute('data-total-pages')) || 1;
    
    // Re-setup event listeners
    this.setupEventListeners();
    this.setupAccessibility();
  }
  
  handleKeydown(event) {
    // Handle keyboard navigation for pagination
    if (event.target.classList.contains('collection-pagination__page-link')) {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          this.focusPreviousPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.focusNextPage();
          break;
        case 'Home':
          event.preventDefault();
          this.focusFirstPage();
          break;
        case 'End':
          event.preventDefault();
          this.focusLastPage();
          break;
      }
    }
  }
  
  focusPreviousPage() {
    const currentIndex = Array.from(this.pageLinks).indexOf(document.activeElement);
    if (currentIndex > 0) {
      this.pageLinks[currentIndex - 1].focus();
    }
  }
  
  focusNextPage() {
    const currentIndex = Array.from(this.pageLinks).indexOf(document.activeElement);
    if (currentIndex < this.pageLinks.length - 1) {
      this.pageLinks[currentIndex + 1].focus();
    }
  }
  
  focusFirstPage() {
    if (this.pageLinks.length > 0) {
      this.pageLinks[0].focus();
    }
  }
  
  focusLastPage() {
    if (this.pageLinks.length > 0) {
      this.pageLinks[this.pageLinks.length - 1].focus();
    }
  }
  
  initializeAINavigation() {
    if (typeof window.AINavigation !== 'undefined') {
      this.aiNavigation = new window.AINavigation();
    }
  }
  
  trackAINavigation(action, data = {}) {
    if (this.aiNavigation) {
      this.aiNavigation.track('collection_pagination', action, {
        ...data,
        pagination_type: this.paginationType,
        total_pages: this.totalPages,
        timestamp: Date.now(),
        url: window.location.pathname
      });
    }
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const paginationContainers = document.querySelectorAll('.collection-pagination');
  
  paginationContainers.forEach(container => {
    new CollectionPaginationManager(container);
  });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CollectionPaginationManager;
} else {
  window.CollectionPaginationManager = CollectionPaginationManager;
} 