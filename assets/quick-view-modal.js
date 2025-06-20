/**
 * Quick View Modal Component
 * 
 * Handles the display and interaction of product quick view modals.
 * Features include image gallery navigation, variant selection, quantity controls,
 * and add to cart functionality with AI Navigation integration.
 */

class QuickViewModal {
  constructor() {
    this.modal = document.querySelector('[data-quick-view-modal]');
    this.overlay = document.querySelector('[data-quick-view-overlay]');
    this.closeButton = document.querySelector('[data-quick-view-close]');
    this.content = document.querySelector('[data-quick-view-content]');
    this.loading = document.querySelector('[data-quick-view-loading]');
    this.product = document.querySelector('[data-quick-view-product]');
    
    // Product elements
    this.mainImage = document.querySelector('[data-quick-view-main-image]');
    this.thumbnailsContainer = document.querySelector('[data-quick-view-thumbnails]');
    this.titleElement = document.querySelector('[data-quick-view-title-text]');
    this.priceElement = document.querySelector('[data-quick-view-price]');
    this.vendorElement = document.querySelector('[data-quick-view-vendor]');
    this.ratingElement = document.querySelector('[data-quick-view-rating]');
    this.descriptionElement = document.querySelector('[data-quick-view-description]');
    this.variantsContainer = document.querySelector('[data-quick-view-variants]');
    this.form = document.querySelector('[data-quick-view-form]');
    this.addToCartButton = document.querySelector('[data-quick-view-add-to-cart]');
    this.viewFullButton = document.querySelector('[data-quick-view-full]');
    
    // Gallery controls
    this.zoomButton = document.querySelector('[data-quick-view-zoom]');
    this.prevButton = document.querySelector('[data-quick-view-prev]');
    this.nextButton = document.querySelector('[data-quick-view-next]');
    
    // Quantity controls
    this.quantityInput = document.querySelector('[data-quantity-input]');
    this.quantityMinus = document.querySelector('[data-quantity-minus]');
    this.quantityPlus = document.querySelector('[data-quantity-plus]');
    
    // State
    this.currentProduct = null;
    this.currentVariant = null;
    this.currentImageIndex = 0;
    this.images = [];
    this.isLoading = false;
    
    this.init();
  }
  
  init() {
    if (!this.modal) return;
    
    this.bindEvents();
    this.setupAccessibility();
    
    // Listen for quick view triggers
    document.addEventListener('click', this.handleQuickViewTrigger.bind(this));
  }
  
  bindEvents() {
    // Modal controls
    this.overlay?.addEventListener('click', this.close.bind(this));
    this.closeButton?.addEventListener('click', this.close.bind(this));
    
    // Gallery controls
    this.zoomButton?.addEventListener('click', this.handleZoom.bind(this));
    this.prevButton?.addEventListener('click', this.previousImage.bind(this));
    this.nextButton?.addEventListener('click', this.nextImage.bind(this));
    
    // Quantity controls
    this.quantityMinus?.addEventListener('click', this.decreaseQuantity.bind(this));
    this.quantityPlus?.addEventListener('click', this.increaseQuantity.bind(this));
    this.quantityInput?.addEventListener('change', this.validateQuantity.bind(this));
    
    // Form submission
    this.form?.addEventListener('submit', this.handleAddToCart.bind(this));
    this.viewFullButton?.addEventListener('click', this.handleViewFull.bind(this));
    
    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }
  
  setupAccessibility() {
    // Trap focus within modal when open
    this.focusableElements = [
      this.closeButton,
      this.zoomButton,
      this.prevButton,
      this.nextButton,
      this.quantityMinus,
      this.quantityInput,
      this.quantityPlus,
      this.addToCartButton,
      this.viewFullButton
    ].filter(Boolean);
  }
  
  handleQuickViewTrigger(event) {
    const trigger = event.target.closest('[data-quick-view]');
    if (!trigger) return;
    
    event.preventDefault();
    
    const productHandle = trigger.dataset.quickView;
    const productUrl = trigger.dataset.productUrl || `/products/${productHandle}`;
    
    this.loadProduct(productUrl);
    
    // AI Navigation tracking
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('quick_view_opened', {
        product_handle: productHandle,
        source: 'collection_page'
      });
    }
  }
  
  async loadProduct(productUrl) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.open();
    this.showLoading();
    
    try {
      const response = await fetch(`${productUrl}.js`);
      if (!response.ok) throw new Error('Product not found');
      
      const product = await response.json();
      this.currentProduct = product;
      this.currentVariant = product.variants[0];
      this.images = product.images;
      this.currentImageIndex = 0;
      
      this.renderProduct();
      this.hideLoading();
      
    } catch (error) {
      console.error('Error loading product:', error);
      this.showError();
    } finally {
      this.isLoading = false;
    }
  }
  
  renderProduct() {
    if (!this.currentProduct) return;
    
    // Title
    if (this.titleElement) {
      this.titleElement.textContent = this.currentProduct.title;
    }
    
    // Price
    this.renderPrice();
    
    // Vendor
    if (this.vendorElement && this.currentProduct.vendor) {
      this.vendorElement.innerHTML = `<span>{{ 'products.product.vendor' | t }}: ${this.currentProduct.vendor}</span>`;
    }
    
    // Description
    if (this.descriptionElement) {
      this.descriptionElement.innerHTML = this.currentProduct.description || '';
    }
    
    // Images
    this.renderImages();
    
    // Variants
    this.renderVariants();
    
    // View full product link
    if (this.viewFullButton) {
      this.viewFullButton.dataset.productUrl = `/products/${this.currentProduct.handle}`;
    }
  }
  
  renderPrice() {
    if (!this.priceElement || !this.currentVariant) return;
    
    const price = this.formatMoney(this.currentVariant.price);
    const comparePrice = this.currentVariant.compare_at_price;
    
    let priceHtml = `<span class="quick-view-modal__price-current">${price}</span>`;
    
    if (comparePrice && comparePrice > this.currentVariant.price) {
      const originalPrice = this.formatMoney(comparePrice);
      const savings = Math.round(((comparePrice - this.currentVariant.price) / comparePrice) * 100);
      
      priceHtml += `<span class="quick-view-modal__price-original">${originalPrice}</span>`;
      priceHtml += `<span class="quick-view-modal__price-badge">{{ 'products.product.save' | t }} ${savings}%</span>`;
    }
    
    this.priceElement.innerHTML = priceHtml;
  }
  
  renderImages() {
    if (!this.images.length) return;
    
    // Main image
    if (this.mainImage) {
      this.updateMainImage();
    }
    
    // Thumbnails
    if (this.thumbnailsContainer && this.images.length > 1) {
      this.renderThumbnails();
    }
  }
  
  updateMainImage() {
    if (!this.mainImage || !this.images[this.currentImageIndex]) return;
    
    const image = this.images[this.currentImageIndex];
    this.mainImage.src = image.replace('.jpg', '_800x800.jpg').replace('.png', '_800x800.png');
    this.mainImage.alt = this.currentProduct.title;
  }
  
  renderThumbnails() {
    if (!this.thumbnailsContainer) return;
    
    const thumbnailsHtml = this.images.map((image, index) => `
      <div class="quick-view-modal__thumbnail ${index === this.currentImageIndex ? 'is-active' : ''}"
           data-thumbnail-index="${index}">
        <img src="${image.replace('.jpg', '_100x100.jpg').replace('.png', '_100x100.png')}" 
             alt="${this.currentProduct.title}" 
             loading="lazy">
      </div>
    `).join('');
    
    this.thumbnailsContainer.innerHTML = thumbnailsHtml;
    
    // Bind thumbnail clicks
    this.thumbnailsContainer.querySelectorAll('[data-thumbnail-index]').forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        this.currentImageIndex = parseInt(thumbnail.dataset.thumbnailIndex);
        this.updateMainImage();
        this.updateThumbnailsActive();
      });
    });
  }
  
  updateThumbnailsActive() {
    if (!this.thumbnailsContainer) return;
    
    this.thumbnailsContainer.querySelectorAll('.quick-view-modal__thumbnail').forEach((thumbnail, index) => {
      thumbnail.classList.toggle('is-active', index === this.currentImageIndex);
    });
  }
  
  renderVariants() {
    if (!this.variantsContainer || !this.currentProduct.options) return;
    
    const variantsHtml = this.currentProduct.options.map(option => {
      if (option.name.toLowerCase() === 'title' && option.values.length === 1) return '';
      
      const isColor = option.name.toLowerCase().includes('color') || option.name.toLowerCase().includes('colour');
      
      return `
        <div class="quick-view-modal__variant-group">
          <label class="quick-view-modal__variant-label">${option.name}:</label>
          <div class="quick-view-modal__variant-options" data-option-name="${option.name}">
            ${option.values.map(value => `
              <button type="button" 
                      class="quick-view-modal__variant-option ${isColor ? 'quick-view-modal__variant-option--color' : ''}" 
                      data-option-value="${value}"
                      ${isColor ? `style="--swatch-color: ${this.getColorValue(value)}"` : ''}>
                ${isColor ? '' : value}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }).filter(Boolean).join('');
    
    this.variantsContainer.innerHTML = variantsHtml;
    
    // Bind variant selection
    this.variantsContainer.querySelectorAll('.quick-view-modal__variant-option').forEach(button => {
      button.addEventListener('click', this.handleVariantSelection.bind(this));
    });
    
    // Select first variant
    this.selectInitialVariants();
  }
  
  selectInitialVariants() {
    if (!this.currentVariant) return;
    
    this.currentVariant.options.forEach((value, index) => {
      const optionName = this.currentProduct.options[index].name;
      const button = this.variantsContainer.querySelector(`[data-option-name="${optionName}"] [data-option-value="${value}"]`);
      if (button) {
        button.classList.add('is-selected');
      }
    });
  }
  
  handleVariantSelection(event) {
    const button = event.target;
    const optionName = button.closest('[data-option-name]').dataset.optionName;
    const optionValue = button.dataset.optionValue;
    
    // Update UI
    button.parentElement.querySelectorAll('.quick-view-modal__variant-option').forEach(btn => {
      btn.classList.remove('is-selected');
    });
    button.classList.add('is-selected');
    
    // Find matching variant
    const selectedOptions = {};
    this.variantsContainer.querySelectorAll('.is-selected').forEach(selectedButton => {
      const name = selectedButton.closest('[data-option-name]').dataset.optionName;
      const value = selectedButton.dataset.optionValue;
      selectedOptions[name] = value;
    });
    
    const matchingVariant = this.currentProduct.variants.find(variant => {
      return variant.options.every((option, index) => {
        const optionName = this.currentProduct.options[index].name;
        return selectedOptions[optionName] === option;
      });
    });
    
    if (matchingVariant) {
      this.currentVariant = matchingVariant;
      this.renderPrice();
      this.updateAddToCartButton();
    }
    
    // AI Navigation tracking
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('variant_selected', {
        product_id: this.currentProduct.id,
        variant_id: this.currentVariant?.id,
        option_name: optionName,
        option_value: optionValue
      });
    }
  }
  
  updateAddToCartButton() {
    if (!this.addToCartButton || !this.currentVariant) return;
    
    const button = this.addToCartButton;
    const text = button.querySelector('.quick-view-modal__add-to-cart-text');
    
    if (this.currentVariant.available) {
      button.disabled = false;
      if (text) text.textContent = '{{ "products.product.add_to_cart" | t }}';
    } else {
      button.disabled = true;
      if (text) text.textContent = '{{ "products.product.sold_out" | t }}';
    }
  }
  
  getColorValue(colorName) {
    const colorMap = {
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#008000',
      'black': '#000000',
      'white': '#ffffff',
      'pink': '#ffc0cb',
      'yellow': '#ffff00',
      'purple': '#800080',
      'orange': '#ffa500',
      'brown': '#a52a2a',
      'gray': '#808080',
      'grey': '#808080'
    };
    
    return colorMap[colorName.toLowerCase()] || '#cccccc';
  }
  
  previousImage() {
    if (this.images.length <= 1) return;
    
    this.currentImageIndex = this.currentImageIndex > 0 ? this.currentImageIndex - 1 : this.images.length - 1;
    this.updateMainImage();
    this.updateThumbnailsActive();
  }
  
  nextImage() {
    if (this.images.length <= 1) return;
    
    this.currentImageIndex = this.currentImageIndex < this.images.length - 1 ? this.currentImageIndex + 1 : 0;
    this.updateMainImage();
    this.updateThumbnailsActive();
  }
  
  handleZoom() {
    if (!this.mainImage) return;
    
    // Create zoom overlay
    const zoomOverlay = document.createElement('div');
    zoomOverlay.className = 'quick-view-modal__zoom-overlay';
    zoomOverlay.innerHTML = `
      <div class="quick-view-modal__zoom-container">
        <img src="${this.mainImage.src.replace('_800x800', '_1200x1200')}" alt="${this.currentProduct.title}">
        <button type="button" class="quick-view-modal__zoom-close" aria-label="Close zoom">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(zoomOverlay);
    
    // Close zoom
    const closeZoom = () => {
      zoomOverlay.remove();
      document.removeEventListener('keydown', handleZoomKeydown);
    };
    
    const handleZoomKeydown = (event) => {
      if (event.key === 'Escape') closeZoom();
    };
    
    zoomOverlay.addEventListener('click', (event) => {
      if (event.target === zoomOverlay) closeZoom();
    });
    
    zoomOverlay.querySelector('.quick-view-modal__zoom-close').addEventListener('click', closeZoom);
    document.addEventListener('keydown', handleZoomKeydown);
    
    // Focus trap
    const zoomImage = zoomOverlay.querySelector('img');
    zoomImage.focus();
  }
  
  decreaseQuantity() {
    const currentValue = parseInt(this.quantityInput.value) || 1;
    if (currentValue > 1) {
      this.quantityInput.value = currentValue - 1;
    }
  }
  
  increaseQuantity() {
    const currentValue = parseInt(this.quantityInput.value) || 1;
    this.quantityInput.value = currentValue + 1;
  }
  
  validateQuantity() {
    const value = parseInt(this.quantityInput.value);
    if (isNaN(value) || value < 1) {
      this.quantityInput.value = 1;
    }
  }
  
  async handleAddToCart(event) {
    event.preventDefault();
    
    if (!this.currentVariant || !this.currentVariant.available) return;
    
    const quantity = parseInt(this.quantityInput.value) || 1;
    const button = this.addToCartButton;
    
    // Show loading state
    button.classList.add('is-loading');
    button.disabled = true;
    
    try {
      const formData = {
        id: this.currentVariant.id,
        quantity: quantity
      };
      
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }
      
      const result = await response.json();
      
      // Update cart UI if available
      if (window.cartDrawer) {
        window.cartDrawer.updateCart();
      }
      
      // Show success feedback
      this.showAddToCartSuccess();
      
      // AI Navigation tracking
      if (window.aiNavigation) {
        window.aiNavigation.trackEvent('add_to_cart', {
          product_id: this.currentProduct.id,
          variant_id: this.currentVariant.id,
          quantity: quantity,
          source: 'quick_view'
        });
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showAddToCartError();
    } finally {
      button.classList.remove('is-loading');
      button.disabled = false;
    }
  }
  
  showAddToCartSuccess() {
    const button = this.addToCartButton;
    const text = button.querySelector('.quick-view-modal__add-to-cart-text');
    const originalText = text.textContent;
    
    text.textContent = '{{ "products.product.added_to_cart" | t }}';
    button.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    
    setTimeout(() => {
      text.textContent = originalText;
      button.style.background = '';
    }, 2000);
  }
  
  showAddToCartError() {
    const button = this.addToCartButton;
    const text = button.querySelector('.quick-view-modal__add-to-cart-text');
    const originalText = text.textContent;
    
    text.textContent = '{{ "products.product.error_adding_to_cart" | t }}';
    button.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
    
    setTimeout(() => {
      text.textContent = originalText;
      button.style.background = '';
    }, 3000);
  }
  
  handleViewFull() {
    if (!this.viewFullButton || !this.currentProduct) return;
    
    const productUrl = `/products/${this.currentProduct.handle}`;
    
    // AI Navigation tracking
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('view_full_product', {
        product_id: this.currentProduct.id,
        source: 'quick_view'
      });
    }
    
    window.location.href = productUrl;
  }
  
  handleKeydown(event) {
    if (!this.modal.classList.contains('is-open')) return;
    
    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowLeft':
        if (event.target === document.body || event.target === this.modal) {
          event.preventDefault();
          this.previousImage();
        }
        break;
      case 'ArrowRight':
        if (event.target === document.body || event.target === this.modal) {
          event.preventDefault();
          this.nextImage();
        }
        break;
      case 'Tab':
        this.handleTabNavigation(event);
        break;
    }
  }
  
  handleTabNavigation(event) {
    const focusableElements = this.modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
  
  open() {
    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element
    setTimeout(() => {
      const firstFocusable = this.modal.querySelector('button:not([disabled]), input:not([disabled])');
      if (firstFocusable) firstFocusable.focus();
    }, 100);
  }
  
  close() {
    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Reset state
    this.currentProduct = null;
    this.currentVariant = null;
    this.currentImageIndex = 0;
    this.images = [];
    
    // AI Navigation tracking
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('quick_view_closed');
    }
  }
  
  showLoading() {
    this.loading.style.display = 'flex';
    this.product.style.display = 'none';
  }
  
  hideLoading() {
    this.loading.style.display = 'none';
    this.product.style.display = 'grid';
  }
  
  showError() {
    this.loading.innerHTML = `
      <div class="quick-view-modal__error">
        <p>{{ 'products.quick_view.error_loading' | t }}</p>
        <button type="button" onclick="window.quickViewModal.close()">
          {{ 'general.accessibility.close' | t }}
        </button>
      </div>
    `;
  }
  
  formatMoney(cents) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents);
    }
    
    // Fallback formatting
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
  window.quickViewModal = new QuickViewModal();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickViewModal;
} 