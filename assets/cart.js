/* Cart functionality following Bubbly design from shopirule.mdc */

class CartManager {
  constructor() {
    this.cart = document.querySelector('#main-cart-footer');
    this.cartItems = document.querySelector('#main-cart-items');
    this.cartDrawer = document.querySelector('#cart-drawer');
    this.cartCount = document.querySelectorAll('.cart-count-bubble');
    this.cartTotal = document.querySelector('.totals__total-value');
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.initQuantityButtons();
    this.initRemoveButtons();
    this.initCartNotes();
    this.initDiscountCode();
    this.updateCartBadge();
  }

  bindEvents() {
    // Cart form submission
    document.addEventListener('submit', (event) => {
      if (event.target.classList.contains('cart-form')) {
        this.onCartUpdate(event);
      }
    });

    // Quantity changes
    document.addEventListener('change', (event) => {
      if (event.target.classList.contains('quantity__input')) {
        this.onQuantityChange(event);
      }
    });

    // Remove item buttons
    document.addEventListener('click', (event) => {
      if (event.target.closest('.cart-remove-button')) {
        this.onRemoveItem(event);
      }
    });

    // Cart drawer toggle
    document.addEventListener('click', (event) => {
      if (event.target.closest('[data-cart-drawer-toggle]')) {
        this.toggleCartDrawer();
      }
    });
  }

  initQuantityButtons() {
    const quantityButtons = document.querySelectorAll('.quantity__button');
    
    quantityButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const input = button.parentNode.querySelector('.quantity__input');
        const isIncrement = button.classList.contains('quantity__button--increment');
        const currentValue = parseInt(input.value);
        const newValue = isIncrement ? currentValue + 1 : Math.max(0, currentValue - 1);
        
        input.value = newValue;
        this.updateQuantity(input, newValue);
      });
    });
  }

  initRemoveButtons() {
    const removeButtons = document.querySelectorAll('.cart-remove-button');
    
    removeButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const lineItem = button.closest('.cart-item');
        const key = button.dataset.index;
        
        this.removeItem(key, lineItem);
      });
    });
  }

  initCartNotes() {
    const cartNoteField = document.querySelector('[name="note"]');
    
    if (cartNoteField) {
      let noteTimeout;
      
      cartNoteField.addEventListener('input', () => {
        clearTimeout(noteTimeout);
        noteTimeout = setTimeout(() => {
          this.updateCartNote(cartNoteField.value);
        }, 500);
      });
    }
  }

  initDiscountCode() {
    const discountForm = document.querySelector('.cart-discount-form');
    
    if (discountForm) {
      discountForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const discountCode = discountForm.querySelector('[name="discount"]').value;
        this.applyDiscountCode(discountCode);
      });
    }
  }

  async updateQuantity(input, quantity) {
    const key = input.dataset.index;
    const lineItem = input.closest('.cart-item');
    
    try {
      this.showLoading(lineItem);
      
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: key,
          quantity: quantity
        })
      });

      if (response.ok) {
        const cart = await response.json();
        this.updateCartUI(cart);
        
        if (quantity === 0) {
          this.removeLineItem(lineItem);
        }
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      this.showError('Failed to update quantity. Please try again.');
      input.value = input.dataset.previousValue || 1;
    } finally {
      this.hideLoading(lineItem);
    }
  }

  async removeItem(key, lineItem) {
    try {
      this.showLoading(lineItem);
      
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: key,
          quantity: 0
        })
      });

      if (response.ok) {
        const cart = await response.json();
        this.updateCartUI(cart);
        this.removeLineItem(lineItem);
        this.showSuccess('Item removed from cart');
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      this.showError('Failed to remove item. Please try again.');
    } finally {
      this.hideLoading(lineItem);
    }
  }

  async updateCartNote(note) {
    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: note
        })
      });

      if (response.ok) {
        const cart = await response.json();
        console.log('Cart note updated');
      } else {
        throw new Error('Failed to update cart note');
      }
    } catch (error) {
      console.error('Error updating cart note:', error);
    }
  }

  async applyDiscountCode(code) {
    // Note: Discount codes are typically handled by Shopify's checkout
    // This is a placeholder for any custom discount logic
    console.log('Applying discount code:', code);
  }

  updateCartUI(cart) {
    // Update cart count
    this.updateCartBadge(cart.item_count);
    
    // Update cart total
    if (this.cartTotal) {
      this.cartTotal.textContent = this.formatMoney(cart.total_price);
    }
    
    // Update subtotal displays
    const subtotalElements = document.querySelectorAll('.cart-subtotal');
    subtotalElements.forEach(element => {
      element.textContent = this.formatMoney(cart.total_price);
    });
    
    // Check if cart is empty
    if (cart.item_count === 0) {
      this.showEmptyCart();
    }
  }

  updateCartBadge(count = null) {
    if (count === null) {
      // Fetch current cart count
      fetch('/cart.js')
        .then(response => response.json())
        .then(cart => {
          this.updateCartBadgeDisplay(cart.item_count);
        })
        .catch(error => console.error('Error fetching cart:', error));
    } else {
      this.updateCartBadgeDisplay(count);
    }
  }

  updateCartBadgeDisplay(count) {
    this.cartCount.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  removeLineItem(lineItem) {
    lineItem.style.transform = 'translateX(-100%)';
    lineItem.style.opacity = '0';
    
    setTimeout(() => {
      lineItem.remove();
    }, 300);
  }

  showEmptyCart() {
    if (this.cartItems) {
      this.cartItems.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty__content">
            <h2 class="cart-empty__title">Your cart is empty</h2>
            <p class="cart-empty__text">Looks like you haven't added anything to your cart yet.</p>
            <a href="/collections/all" class="button button--primary">
              Continue Shopping
            </a>
          </div>
        </div>
      `;
    }
  }

  showLoading(element) {
    element.classList.add('loading');
    const loadingSpinner = element.querySelector('.loading-overlay');
    if (loadingSpinner) {
      loadingSpinner.style.display = 'flex';
    }
  }

  hideLoading(element) {
    element.classList.remove('loading');
    const loadingSpinner = element.querySelector('.loading-overlay');
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `cart-notification cart-notification--${type}`;
    notification.innerHTML = `
      <div class="cart-notification__content">
        <span class="cart-notification__message">${message}</span>
        <button class="cart-notification__close" aria-label="Close notification">
          <svg class="icon icon-close" viewBox="0 0 18 18">
            <path d="M17 1L1 17M1 1l16 16" stroke="currentColor" stroke-width="2" fill="none" fill-rule="evenodd" stroke-linecap="round"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideNotification(notification);
    }, 5000);

    // Close button functionality
    const closeButton = notification.querySelector('.cart-notification__close');
    closeButton.addEventListener('click', () => {
      this.hideNotification(notification);
    });

    // Show notification with animation
    requestAnimationFrame(() => {
      notification.classList.add('cart-notification--visible');
    });
  }

  hideNotification(notification) {
    notification.classList.remove('cart-notification--visible');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  toggleCartDrawer() {
    if (this.cartDrawer) {
      this.cartDrawer.classList.toggle('active');
      document.body.classList.toggle('cart-drawer-open');
    }
  }

  formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }

  onCartUpdate(event) {
    event.preventDefault();
    // Handle cart form updates if needed
  }

  onQuantityChange(event) {
    const input = event.target;
    const newValue = parseInt(input.value);
    
    if (newValue !== parseInt(input.dataset.previousValue || 1)) {
      input.dataset.previousValue = input.value;
      this.updateQuantity(input, newValue);
    }
  }

  onRemoveItem(event) {
    event.preventDefault();
    const button = event.target.closest('.cart-remove-button');
    const lineItem = button.closest('.cart-item');
    const key = button.dataset.index;
    
    this.removeItem(key, lineItem);
  }
}

// Quantity Input Component
class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });
    
    this.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', this.onButtonClick.bind(this));
    });
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    
    if (event.target.name === 'plus') {
      this.input.stepUp();
    } else {
      this.input.stepDown();
    }
    
    if (previousValue !== this.input.value) {
      this.input.dispatchEvent(this.changeEvent);
    }
  }
}

customElements.define('quantity-input', QuantityInput);

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CartManager();
});

// AI Navigation Integration following shopirule.mdc
if (window.AINavigation) {
  document.addEventListener('DOMContentLoaded', () => {
    // Track cart interactions for AI learning
    const cartManager = new CartManager();
    
    // Track cart additions
    document.addEventListener('cart:item-added', (event) => {
      window.AINavigation.trackEvent('cart_add', {
        product_id: event.detail.product_id,
        variant_id: event.detail.variant_id,
        quantity: event.detail.quantity
      });
    });
    
    // Track cart removals
    document.addEventListener('cart:item-removed', (event) => {
      window.AINavigation.trackEvent('cart_remove', {
        product_id: event.detail.product_id,
        variant_id: event.detail.variant_id
      });
    });
    
    // Track checkout initiation
    document.addEventListener('click', (event) => {
      if (event.target.closest('[name="add"], .btn[href*="checkout"]')) {
        window.AINavigation.trackEvent('checkout_start', {
          cart_total: document.querySelector('.cart-subtotal')?.textContent || '0'
        });
      }
    });
  });
} 