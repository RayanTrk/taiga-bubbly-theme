/**
 * Cart Upsells Manager for Taiga Theme - Bubbly Style
 * Handles product recommendations, bundle offers, gift options, and cart enhancements
 * Follows shopirule.mdc guidelines for performance and user experience
 */

class CartUpsells {
  constructor() {
    this.container = document.querySelector('[data-cart-upsells]');
    if (!this.container) return;

    this.cart = null;
    this.isLoading = false;
    this.settings = {
      freeShippingThreshold: 20000, // $200 in cents
      recommendationLimit: 4,
      bundleDiscount: 15,
      giftWrapPrice: 500, // $5 in cents
      maxRecentProducts: 8
    };

    this.init();
  }

  async init() {
    this.bindEvents();
    this.initializeRecommendations();
    this.initializeGiftOptions();
    this.initializeCartNotes();
    this.initializeUrgencyMessaging();
    this.initializeBundleOffers();
    
    // AI Navigation integration
    this.trackUpsellInteractions();
    
    await this.loadCartData();
    this.updateFreeShippingProgress();
  }

  bindEvents() {
    // Recommendation buttons
    this.container.addEventListener('click', this.handleUpsellClick.bind(this));
    
    // Gift options
    this.container.addEventListener('change', this.handleGiftOptionChange.bind(this));
    
    // Cart notes
    const notesTextarea = this.container.querySelector('.cart-notes__textarea');
    if (notesTextarea) {
      notesTextarea.addEventListener('input', this.handleNotesChange.bind(this));
    }

    // Gift message textarea
    const giftMessageTextarea = this.container.querySelector('.gift-message-textarea');
    if (giftMessageTextarea) {
      giftMessageTextarea.addEventListener('input', this.handleGiftMessageInput.bind(this));
    }

    // Listen for cart updates
    document.addEventListener('cart:updated', this.handleCartUpdate.bind(this));
    document.addEventListener('cart:item-added', this.handleItemAdded.bind(this));
  }

  async handleUpsellClick(event) {
    const target = event.target.closest('[data-variant-id]');
    if (!target) return;

    event.preventDefault();
    
    if (this.isLoading) return;
    
    const variantId = target.dataset.variantId;
    const productTitle = target.dataset.productTitle;
    
    await this.addRecommendationToCart(variantId, productTitle, target);
  }

  async addRecommendationToCart(variantId, productTitle, button) {
    try {
      this.isLoading = true;
      this.showButtonLoading(button, true);

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          items: [{
            id: variantId,
            quantity: 1
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add product to cart');
      }

      const result = await response.json();
      
      // Show success feedback
      this.showAddToCartSuccess(button, productTitle);
      
      // Track AI Navigation event
      this.trackEvent('upsell_add_to_cart', {
        variant_id: variantId,
        product_title: productTitle,
        source: 'cart_recommendations'
      });

      // Update cart and trigger events
      await this.refreshCart();
      document.dispatchEvent(new CustomEvent('cart:item-added', {
        detail: { items: result.items }
      }));

    } catch (error) {
      console.error('Error adding recommendation to cart:', error);
      this.showAddToCartError(button);
    } finally {
      this.isLoading = false;
      this.showButtonLoading(button, false);
    }
  }

  showButtonLoading(button, loading) {
    const text = button.querySelector('.btn__text');
    const icon = button.querySelector('.btn__loading-icon');
    
    if (loading) {
      button.classList.add('btn--loading');
      if (text) text.style.opacity = '0';
      if (icon) icon.style.display = 'inline-block';
    } else {
      button.classList.remove('btn--loading');
      if (text) text.style.opacity = '1';
      if (icon) icon.style.display = 'none';
    }
  }

  showAddToCartSuccess(button, productTitle) {
    const originalText = button.querySelector('.btn__text').textContent;
    const textElement = button.querySelector('.btn__text');
    
    // Success state
    button.classList.add('btn--success');
    textElement.textContent = window.cartTranslations?.added || 'Added!';
    
    // Create bubble animation
    this.createBubbleAnimation(button);
    
    // Reset after 2 seconds
    setTimeout(() => {
      button.classList.remove('btn--success');
      textElement.textContent = originalText;
    }, 2000);
  }

  showAddToCartError(button) {
    const originalText = button.querySelector('.btn__text').textContent;
    const textElement = button.querySelector('.btn__text');
    
    button.classList.add('btn--error');
    textElement.textContent = window.cartTranslations?.error || 'Error';
    
    setTimeout(() => {
      button.classList.remove('btn--error');
      textElement.textContent = originalText;
    }, 3000);
  }

  createBubbleAnimation(element) {
    // Create floating bubbles for Bubbly style success feedback
    for (let i = 0; i < 3; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'success-bubble';
      bubble.style.cssText = `
        position: absolute;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: linear-gradient(45deg, #00d4aa, #00b894);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        opacity: 0.8;
        animation: bubbleFloat 1.5s ease-out forwards;
      `;
      
      const rect = element.getBoundingClientRect();
      bubble.style.left = `${rect.left + Math.random() * rect.width}px`;
      bubble.style.top = `${rect.top + rect.height / 2}px`;
      
      document.body.appendChild(bubble);
      
      setTimeout(() => {
        if (bubble.parentNode) {
          bubble.parentNode.removeChild(bubble);
        }
      }, 1500);
    }
  }

  handleGiftOptionChange(event) {
    const target = event.target;
    
    if (target.id === 'gift-message') {
      const messageInput = this.container.querySelector('.gift-message-input');
      if (messageInput) {
        messageInput.style.display = target.checked ? 'block' : 'none';
        
        if (target.checked) {
          const textarea = messageInput.querySelector('textarea');
          if (textarea) {
            setTimeout(() => textarea.focus(), 100);
          }
        }
      }
    }
    
    if (target.name && target.name.includes('attributes')) {
      this.updateCartAttributes();
    }
  }

  handleGiftMessageInput(event) {
    const textarea = event.target;
    const counter = this.container.querySelector('.gift-message-counter .counter-text');
    
    if (counter) {
      const length = textarea.value.length;
      counter.textContent = `${length}/200`;
      
      // Add visual feedback for character limit
      if (length > 180) {
        counter.style.color = '#e74c3c';
      } else {
        counter.style.color = '';
      }
    }
  }

  handleNotesChange(event) {
    const textarea = event.target;
    const counter = this.container.querySelector('.cart-notes__counter .counter-text');
    
    if (counter) {
      const length = textarea.value.length;
      counter.textContent = `${length}/500`;
      
      if (length > 450) {
        counter.style.color = '#e74c3c';
      } else {
        counter.style.color = '';
      }
    }
    
    // Auto-save cart notes
    this.debounce(this.updateCartNotes.bind(this), 500)();
  }

  async updateCartAttributes() {
    try {
      const giftWrapping = this.container.querySelector('#gift-wrapping');
      const giftMessage = this.container.querySelector('#gift-message');
      const giftMessageText = this.container.querySelector('.gift-message-textarea');
      
      const attributes = {};
      
      if (giftWrapping?.checked) {
        attributes['Gift Wrapping'] = 'Yes';
      }
      
      if (giftMessage?.checked) {
        attributes['Gift Message'] = 'Yes';
        if (giftMessageText?.value) {
          attributes['Gift Message Text'] = giftMessageText.value;
        }
      }

      await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attributes })
      });

      this.refreshCart();
      
    } catch (error) {
      console.error('Error updating cart attributes:', error);
    }
  }

  async updateCartNotes() {
    try {
      const notesTextarea = this.container.querySelector('.cart-notes__textarea');
      if (!notesTextarea) return;

      await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          note: notesTextarea.value
        })
      });

    } catch (error) {
      console.error('Error updating cart notes:', error);
    }
  }

  async loadCartData() {
    try {
      const response = await fetch('/cart.js');
      this.cart = await response.json();
    } catch (error) {
      console.error('Error loading cart data:', error);
    }
  }

  async refreshCart() {
    await this.loadCartData();
    this.updateFreeShippingProgress();
    
    // Trigger cart update event
    document.dispatchEvent(new CustomEvent('cart:updated', {
      detail: { cart: this.cart }
    }));
  }

  updateFreeShippingProgress() {
    if (!this.cart) return;

    const progressBar = this.container.querySelector('.progress-bar__fill');
    const freeShippingText = this.container.querySelector('.free-shipping-indicator__text');
    const freeShippingSection = this.container.querySelector('.cart-upsells__free-shipping');
    
    if (!progressBar || !freeShippingSection) return;

    const cartTotal = this.cart.total_price;
    const remaining = this.settings.freeShippingThreshold - cartTotal;
    const hasAchieved = remaining <= 0;
    
    if (hasAchieved) {
      freeShippingSection.classList.add('cart-upsells__free-shipping--achieved');
      this.createFreeShippingCelebration();
    } else {
      const progressPercentage = Math.min((cartTotal / this.settings.freeShippingThreshold) * 100, 100);
      progressBar.style.width = `${progressPercentage}%`;
      
      // Add animated bubbles when close to threshold
      if (progressPercentage > 80) {
        progressBar.classList.add('progress-bar--almost-there');
      }
    }
  }

  createFreeShippingCelebration() {
    // Create celebration effect for achieving free shipping
    const celebration = document.createElement('div');
    celebration.className = 'free-shipping-celebration';
    celebration.innerHTML = '🎉';
    celebration.style.cssText = `
      position: absolute;
      font-size: 2rem;
      animation: celebrationPop 2s ease-out forwards;
      pointer-events: none;
      z-index: 1000;
    `;
    
    const section = this.container.querySelector('.cart-upsells__free-shipping');
    if (section) {
      section.style.position = 'relative';
      section.appendChild(celebration);
      
      setTimeout(() => {
        if (celebration.parentNode) {
          celebration.parentNode.removeChild(celebration);
        }
      }, 2000);
    }
  }

  initializeRecommendations() {
    // Load product recommendations based on cart contents
    this.loadRecommendations();
  }

  async loadRecommendations() {
    try {
      if (!this.cart || this.cart.items.length === 0) return;

      const productIds = this.cart.items.map(item => item.product_id);
      const response = await fetch(`/recommendations/products.json?product_id=${productIds[0]}&limit=${this.settings.recommendationLimit}`);
      
      if (response.ok) {
        const recommendations = await response.json();
        this.renderRecommendations(recommendations.products);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  }

  renderRecommendations(products) {
    const grid = this.container.querySelector('[data-recommendations-grid]');
    if (!grid || !products.length) return;

    // Filter out products already in cart
    const cartProductIds = this.cart.items.map(item => item.product_id);
    const filteredProducts = products.filter(product => !cartProductIds.includes(product.id));

    if (filteredProducts.length === 0) {
      grid.parentElement.style.display = 'none';
      return;
    }

    grid.innerHTML = filteredProducts.slice(0, this.settings.recommendationLimit).map(product => `
      <div class="cart-recommendation-card animate-fade-in" data-product-id="${product.id}">
        <div class="cart-recommendation-card__image">
          <a href="${product.url}" class="cart-recommendation-card__image-link">
            ${product.featured_image ? `
              <img 
                src="${product.featured_image}?width=300"
                alt="${product.title}"
                loading="lazy"
                width="150"
                height="150"
                class="cart-recommendation-card__img"
              >
            ` : `
              <div class="cart-recommendation-card__placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            `}
          </a>
          ${product.compare_at_price && product.compare_at_price > product.price ? `
            <div class="cart-recommendation-card__badge">
              <span class="badge badge--sale">Sale</span>
            </div>
          ` : ''}
        </div>
        
        <div class="cart-recommendation-card__content">
          <h4 class="cart-recommendation-card__title">
            <a href="${product.url}" class="cart-recommendation-card__title-link">
              ${product.title}
            </a>
          </h4>
          
          <div class="cart-recommendation-card__price">
            ${product.compare_at_price && product.compare_at_price > product.price ? `
              <span class="price price--on-sale">
                <span class="price__sale">${this.formatMoney(product.price)}</span>
                <span class="price__compare">${this.formatMoney(product.compare_at_price)}</span>
              </span>
            ` : `
              <span class="price">${this.formatMoney(product.price)}</span>
            `}
          </div>
          
          ${product.available ? `
            <div class="cart-recommendation-card__actions">
              ${product.variants.length === 1 ? `
                <button 
                  type="button" 
                  class="btn btn--secondary btn--small cart-recommendation__add-btn"
                  data-variant-id="${product.variants[0].id}"
                  data-product-title="${product.title}"
                >
                  <span class="btn__text">Add to Cart</span>
                  <span class="btn__loading-icon">
                    <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                  </span>
                </button>
              ` : `
                <a href="${product.url}" class="btn btn--secondary btn--small">
                  View Options
                </a>
              `}
            </div>
          ` : `
            <div class="cart-recommendation-card__unavailable">
              <span class="text--muted">Sold Out</span>
            </div>
          `}
        </div>
      </div>
    `).join('');
  }

  initializeGiftOptions() {
    // Set up gift option interactions
    const giftMessage = this.container.querySelector('#gift-message');
    if (giftMessage?.checked) {
      const messageInput = this.container.querySelector('.gift-message-input');
      if (messageInput) {
        messageInput.style.display = 'block';
      }
    }
  }

  initializeCartNotes() {
    // Initialize character counter for cart notes
    const textarea = this.container.querySelector('.cart-notes__textarea');
    if (textarea) {
      const counter = this.container.querySelector('.cart-notes__counter .counter-text');
      if (counter) {
        counter.textContent = `${textarea.value.length}/500`;
      }
    }
  }

  initializeUrgencyMessaging() {
    // Set up dynamic urgency messaging based on inventory
    this.updateUrgencyMessage();
  }

  updateUrgencyMessage() {
    const urgencyElement = this.container.querySelector('[data-urgency-messaging]');
    if (!urgencyElement || !this.cart) return;

    // Check for low stock items in cart
    const lowStockItems = this.cart.items.filter(item => {
      // This would require additional product data
      return Math.random() > 0.5; // Placeholder logic
    });

    if (lowStockItems.length > 0) {
      urgencyElement.style.display = 'block';
      this.animateUrgencyPulse(urgencyElement);
    } else {
      urgencyElement.style.display = 'none';
    }
  }

  animateUrgencyPulse(element) {
    element.classList.add('urgency-pulse');
    setTimeout(() => {
      element.classList.remove('urgency-pulse');
    }, 2000);
  }

  initializeBundleOffers() {
    // Set up bundle offer interactions
    const bundleBtn = this.container.querySelector('.cart-bundle__add-btn');
    if (bundleBtn) {
      bundleBtn.addEventListener('click', this.handleBundleAdd.bind(this));
    }
  }

  async handleBundleAdd(event) {
    const button = event.target;
    const collection = button.dataset.bundleCollection;
    
    try {
      this.showButtonLoading(button, true);
      
      // This would load bundle products and add them to cart
      // Implementation depends on bundle product structure
      
      this.trackEvent('bundle_offer_clicked', {
        collection: collection,
        source: 'cart_upsells'
      });
      
    } catch (error) {
      console.error('Error adding bundle to cart:', error);
    } finally {
      this.showButtonLoading(button, false);
    }
  }

  handleCartUpdate(event) {
    this.cart = event.detail.cart;
    this.updateFreeShippingProgress();
    this.updateUrgencyMessage();
    this.loadRecommendations();
  }

  handleItemAdded(event) {
    // Handle new item added to cart - could trigger new recommendations
    this.loadRecommendations();
  }

  // AI Navigation integration
  trackUpsellInteractions() {
    // Track user interactions for AI learning
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target.dataset.section;
          if (section) {
            this.trackEvent('upsell_section_viewed', {
              section: section,
              viewport_time: Date.now()
            });
          }
        }
      });
    }, { threshold: 0.5 });

    // Observe upsell sections
    this.container.querySelectorAll('[data-section]').forEach(section => {
      observer.observe(section);
    });
  }

  trackEvent(eventName, data = {}) {
    // AI Navigation event tracking
    if (typeof window.AINavigation !== 'undefined') {
      window.AINavigation.track(eventName, {
        ...data,
        timestamp: Date.now(),
        cart_total: this.cart?.total_price || 0,
        cart_item_count: this.cart?.item_count || 0
      });
    }
  }

  // Utility functions
  formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
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
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.CartUpsells = CartUpsells;
  });
} else {
  window.CartUpsells = CartUpsells;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CartUpsells;
} 