/**
 * Collection Sorting Manager
 * Handles sorting functionality with Bubbly animations and AI Navigation
 */
class CollectionSortingManager {
  constructor(container) {
    this.container = container;
    this.sortDropdown = container.querySelector('.collection-sorting__sort-dropdown');
    this.sortButton = container.querySelector('.collection-sorting__sort-button');
    this.sortOptions = container.querySelector('.collection-sorting__sort-options');
    this.sortOptionButtons = container.querySelectorAll('.collection-sorting__sort-option');
    this.currentSortText = container.querySelector('.collection-sorting__sort-current');
    
    this.perPageDropdown = container.querySelector('.collection-sorting__per-page-dropdown');
    this.perPageButton = container.querySelector('.collection-sorting__per-page-button');
    this.perPageOptions = container.querySelector('.collection-sorting__per-page-options');
    this.perPageOptionButtons = container.querySelectorAll('.collection-sorting__per-page-option');
    this.currentPerPageText = container.querySelector('.collection-sorting__per-page-current');
    
    this.viewToggle = container.querySelector('.collection-sorting__view-toggle');
    this.viewButtons = container.querySelectorAll('.collection-sorting__view-button');
    
    this.currentSort = this.getCurrentSortFromURL();
    this.currentPerPage = this.getCurrentPerPageFromURL();
    this.currentView = this.getCurrentViewFromStorage();
    this.isLoading = false;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.initializeView();
    this.initializeAINavigation();
    this.setupAccessibility();
    
    console.log('Collection Sorting initialized');
  }
  
  setupEventListeners() {
    // Sort dropdown
    if (this.sortButton) {
      this.sortButton.addEventListener('click', (e) => this.toggleSortDropdown(e));
    }
    
    this.sortOptionButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleSortSelection(e));
    });
    
    // Per page dropdown
    if (this.perPageButton) {
      this.perPageButton.addEventListener('click', (e) => this.togglePerPageDropdown(e));
    }
    
    this.perPageOptionButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handlePerPageSelection(e));
    });
    
    // View toggle
    this.viewButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleViewToggle(e));
    });
    
    // Global click handler for closing dropdowns
    document.addEventListener('click', (e) => this.handleDocumentClick(e));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Resize handling
    window.addEventListener('resize', () => this.handleResize());
  }
  
  setupAccessibility() {
    // Set initial ARIA states
    if (this.sortButton) {
      this.sortButton.setAttribute('aria-expanded', 'false');
    }
    if (this.perPageButton) {
      this.perPageButton.setAttribute('aria-expanded', 'false');
    }
    
    // Add keyboard navigation support
    this.sortOptionButtons.forEach((button, index) => {
      button.setAttribute('tabindex', '-1');
      button.addEventListener('keydown', (e) => this.handleOptionKeydown(e, this.sortOptionButtons, index));
    });
    
    this.perPageOptionButtons.forEach((button, index) => {
      button.setAttribute('tabindex', '-1');
      button.addEventListener('keydown', (e) => this.handleOptionKeydown(e, this.perPageOptionButtons, index));
    });
  }
  
  initializeView() {
    // Set current view
    this.setView(this.currentView);
    
    // Update current sort display
    this.updateCurrentSortDisplay();
    
    // Update current per page display
    this.updateCurrentPerPageDisplay();
  }
  
  getCurrentSortFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('sort_by') || 'manual';
  }
  
  getCurrentPerPageFromURL() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('per_page')) || 24;
  }
  
  getCurrentViewFromStorage() {
    return localStorage.getItem('collection_view') || 'grid';
  }
  
  toggleSortDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const isExpanded = this.sortButton.getAttribute('aria-expanded') === 'true';
    
    // Close per page dropdown if open
    this.closePerPageDropdown();
    
    if (isExpanded) {
      this.closeSortDropdown();
    } else {
      this.openSortDropdown();
    }
  }
  
  openSortDropdown() {
    this.sortButton.setAttribute('aria-expanded', 'true');
    this.sortOptions.style.display = 'block';
    
    // Focus first option
    setTimeout(() => {
      const firstOption = this.sortOptions.querySelector('.collection-sorting__sort-option');
      if (firstOption) {
        firstOption.focus();
        firstOption.setAttribute('tabindex', '0');
      }
    }, 100);
    
    // Track interaction
    this.trackAINavigation('sort_dropdown_open', {});
  }
  
  closeSortDropdown() {
    this.sortButton.setAttribute('aria-expanded', 'false');
    
    // Reset tabindex
    this.sortOptionButtons.forEach(button => {
      button.setAttribute('tabindex', '-1');
    });
    
    // Return focus to button
    this.sortButton.focus();
  }
  
  togglePerPageDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const isExpanded = this.perPageButton.getAttribute('aria-expanded') === 'true';
    
    // Close sort dropdown if open
    this.closeSortDropdown();
    
    if (isExpanded) {
      this.closePerPageDropdown();
    } else {
      this.openPerPageDropdown();
    }
  }
  
  openPerPageDropdown() {
    this.perPageButton.setAttribute('aria-expanded', 'true');
    this.perPageOptions.style.display = 'block';
    
    // Focus first option
    setTimeout(() => {
      const firstOption = this.perPageOptions.querySelector('.collection-sorting__per-page-option');
      if (firstOption) {
        firstOption.focus();
        firstOption.setAttribute('tabindex', '0');
      }
    }, 100);
    
    // Track interaction
    this.trackAINavigation('per_page_dropdown_open', {});
  }
  
  closePerPageDropdown() {
    this.perPageButton.setAttribute('aria-expanded', 'false');
    
    // Reset tabindex
    this.perPageOptionButtons.forEach(button => {
      button.setAttribute('tabindex', '-1');
    });
    
    // Return focus to button
    this.perPageButton.focus();
  }
  
  handleSortSelection(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const sortValue = button.getAttribute('data-sort-value');
    const sortText = button.querySelector('.collection-sorting__option-text').textContent;
    
    if (sortValue === this.currentSort) {
      this.closeSortDropdown();
      return;
    }
    
    // Update current sort
    this.currentSort = sortValue;
    
    // Update display
    if (this.currentSortText) {
      this.currentSortText.textContent = sortText;
    }
    
    // Update selected state
    this.sortOptionButtons.forEach(btn => {
      const isSelected = btn.getAttribute('data-sort-value') === sortValue;
      btn.setAttribute('aria-selected', isSelected);
      if (isSelected) {
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.removeAttribute('aria-current');
      }
    });
    
    // Close dropdown
    this.closeSortDropdown();
    
    // Apply sort
    this.applySorting(sortValue);
    
    // Track interaction
    this.trackAINavigation('sort_changed', {
      sort_value: sortValue,
      sort_text: sortText
    });
  }
  
  handlePerPageSelection(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const perPageValue = parseInt(button.getAttribute('data-per-page-value'));
    const perPageText = button.querySelector('.collection-sorting__option-text').textContent;
    
    if (perPageValue === this.currentPerPage) {
      this.closePerPageDropdown();
      return;
    }
    
    // Update current per page
    this.currentPerPage = perPageValue;
    
    // Update display
    if (this.currentPerPageText) {
      this.currentPerPageText.textContent = perPageText;
    }
    
    // Update selected state
    this.perPageOptionButtons.forEach(btn => {
      const isSelected = parseInt(btn.getAttribute('data-per-page-value')) === perPageValue;
      btn.setAttribute('aria-selected', isSelected);
      if (isSelected) {
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.removeAttribute('aria-current');
      }
    });
    
    // Close dropdown
    this.closePerPageDropdown();
    
    // Apply per page
    this.applyPerPage(perPageValue);
    
    // Track interaction
    this.trackAINavigation('per_page_changed', {
      per_page_value: perPageValue
    });
  }
  
  handleViewToggle(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const viewType = button.getAttribute('data-view');
    
    if (viewType === this.currentView) return;
    
    this.setView(viewType);
    
    // Store preference
    localStorage.setItem('collection_view', viewType);
    
    // Track interaction
    this.trackAINavigation('view_changed', {
      view_type: viewType
    });
  }
  
  setView(viewType) {
    this.currentView = viewType;
    
    // Update button states
    this.viewButtons.forEach(button => {
      const isActive = button.getAttribute('data-view') === viewType;
      button.setAttribute('aria-pressed', isActive);
    });
    
    // Update collection grid
    const collectionGrid = document.querySelector('.collection-product-grid');
    if (collectionGrid) {
      collectionGrid.classList.remove('collection-product-grid--grid', 'collection-product-grid--list');
      collectionGrid.classList.add(`collection-product-grid--${viewType}`);
    }
  }
  
  applySorting(sortValue) {
    if (this.isLoading) return;
    
    this.showLoadingState();
    
    const url = this.buildURL({ sort_by: sortValue });
    this.loadCollection(url);
  }
  
  applyPerPage(perPageValue) {
    if (this.isLoading) return;
    
    this.showLoadingState();
    
    const url = this.buildURL({ per_page: perPageValue });
    this.loadCollection(url);
  }
  
  buildURL(params = {}) {
    const url = new URL(window.location);
    
    // Update parameters
    Object.keys(params).forEach(key => {
      if (params[key]) {
        url.searchParams.set(key, params[key]);
      } else {
        url.searchParams.delete(key);
      }
    });
    
    // Reset to first page when changing sort or per page
    if (params.sort_by || params.per_page) {
      url.searchParams.delete('page');
    }
    
    return url.toString();
  }
  
  async loadCollection(url) {
    try {
      this.isLoading = true;
      
      const response = await fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load collection');
      
      const html = await response.text();
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
      const currentPagination = document.querySelector('.collection-pagination');
      
      if (newPagination && currentPagination) {
        currentPagination.innerHTML = newPagination.innerHTML;
        
        // Reinitialize pagination functionality
        if (typeof CollectionPaginationManager !== 'undefined') {
          new CollectionPaginationManager(currentPagination);
        }
      }
      
      // Update results count
      const newSorting = doc.querySelector('.collection-sorting');
      if (newSorting) {
        const newResultsCount = newSorting.querySelector('.collection-sorting__results-count');
        const currentResultsCount = this.container.querySelector('.collection-sorting__results-count');
        
        if (newResultsCount && currentResultsCount) {
          currentResultsCount.innerHTML = newResultsCount.innerHTML;
        }
      }
      
      // Update URL without page reload
      window.history.pushState({}, '', url);
      
      // Scroll to top of results
      const collectionGrid = document.querySelector('.collection-product-grid');
      if (collectionGrid) {
        collectionGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
    } catch (error) {
      console.error('Error loading collection:', error);
      
      // Fallback to page reload
      window.location.href = url;
    } finally {
      this.hideLoadingState();
      this.isLoading = false;
    }
  }
  
  showLoadingState() {
    this.container.classList.add('loading');
    
    const collectionGrid = document.querySelector('.collection-product-grid');
    if (collectionGrid) {
      collectionGrid.classList.add('loading');
    }
  }
  
  hideLoadingState() {
    this.container.classList.remove('loading');
    
    const collectionGrid = document.querySelector('.collection-product-grid');
    if (collectionGrid) {
      collectionGrid.classList.remove('loading');
    }
  }
  
  updateCurrentSortDisplay() {
    this.sortOptionButtons.forEach(button => {
      const sortValue = button.getAttribute('data-sort-value');
      const isSelected = sortValue === this.currentSort;
      
      button.setAttribute('aria-selected', isSelected);
      if (isSelected) {
        button.setAttribute('aria-current', 'true');
        
        if (this.currentSortText) {
          const sortText = button.querySelector('.collection-sorting__option-text').textContent;
          this.currentSortText.textContent = sortText;
        }
      } else {
        button.removeAttribute('aria-current');
      }
    });
  }
  
  updateCurrentPerPageDisplay() {
    this.perPageOptionButtons.forEach(button => {
      const perPageValue = parseInt(button.getAttribute('data-per-page-value'));
      const isSelected = perPageValue === this.currentPerPage;
      
      button.setAttribute('aria-selected', isSelected);
      if (isSelected) {
        button.setAttribute('aria-current', 'true');
        
        if (this.currentPerPageText) {
          const perPageText = button.querySelector('.collection-sorting__option-text').textContent;
          this.currentPerPageText.textContent = perPageText;
        }
      } else {
        button.removeAttribute('aria-current');
      }
    });
  }
  
  handleDocumentClick(event) {
    if (!this.container.contains(event.target)) {
      this.closeSortDropdown();
      this.closePerPageDropdown();
    }
  }
  
  handleKeydown(event) {
    const isDropdownOpen = this.sortButton?.getAttribute('aria-expanded') === 'true' ||
                          this.perPageButton?.getAttribute('aria-expanded') === 'true';
    
    if (!isDropdownOpen) return;
    
    switch (event.key) {
      case 'Escape':
        this.closeSortDropdown();
        this.closePerPageDropdown();
        break;
    }
  }
  
  handleOptionKeydown(event, options, currentIndex) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % options.length;
        this.focusOption(options, nextIndex);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        this.focusOption(options, prevIndex);
        break;
        
      case 'Home':
        event.preventDefault();
        this.focusOption(options, 0);
        break;
        
      case 'End':
        event.preventDefault();
        this.focusOption(options, options.length - 1);
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        options[currentIndex].click();
        break;
    }
  }
  
  focusOption(options, index) {
    options.forEach((option, i) => {
      option.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    options[index].focus();
  }
  
  handleResize() {
    // Close dropdowns on resize
    this.closeSortDropdown();
    this.closePerPageDropdown();
  }
  
  initializeAINavigation() {
    if (typeof window.AINavigation !== 'undefined') {
      this.aiNavigation = new window.AINavigation();
    }
  }
  
  trackAINavigation(action, data = {}) {
    if (this.aiNavigation) {
      this.aiNavigation.track('collection_sorting', action, {
        ...data,
        timestamp: Date.now(),
        url: window.location.pathname
      });
    }
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const sortingContainers = document.querySelectorAll('.collection-sorting');
  
  sortingContainers.forEach(container => {
    new CollectionSortingManager(container);
  });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CollectionSortingManager;
} else {
  window.CollectionSortingManager = CollectionSortingManager;
} 