/**
 * Quick Buy and Sticky Cart Functionality
 * Follows Taiga theme Bubbly style with AI-powered navigation
 */

class QuickBuy {
  constructor(element) {
    this.container = element;
    this.form = element.querySelector('.quick-buy__form');
    this.button = element.querySelector('.quick-buy__button');
    this.buttonText = element.querySelector('.quick-buy__button-text');
    this.buttonLoading = element.querySelector('.quick-buy__button-loading');
    this.errorContainer = element.querySelector('.quick-buy__error');
    this.variantSelect = element.querySelector('.quick-buy__variant-select');
    this.quantityInput = element.querySelector('.quantity__input');
    this.quantityButtons = element.querySelectorAll('.quantity__button');
    this.productId = element.dataset.productId;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.initQuantityControls();
    this.initVariantSelection();
  }

  bindEvents() {
    this.form?.addEventListener('submit', this.handleSubmit.bind(this));
    
    // AI Navigation tracking
    this.container.addEventListener('mouseenter', this.trackInteraction.bind(this));
    this.container.addEventListener('click', this.trackClick.bind(this));
  }

  initQuantityControls() {
    this.quantityButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const input = this.quantityInput;
        const currentValue = parseInt(input.value) || 1;
        
        if (button.name === 'plus') {
          input.value = currentValue + 1;
        } else if (button.name === 'minus' && currentValue > 1) {
          input.value = currentValue - 1;
        }
        
        // Add bubble animation
        this.addBubbleEffect(button);
      });
    });
  }

  initVariantSelection() {
    if (this.variantSelect) {
      this.variantSelect.addEventListener('change', this.handleVariantChange.bind(this));
    }
  }

  handleVariantChange(event) {
    const selectedOption = event.target.selectedOptions[0];
    const isAvailable = !selectedOption.disabled;
    
    this.button.disabled = !isAvailable;
    this.buttonText.textContent = isAvailable 
      ? window.quickBuyTranslations?.addToCart || 'Add to cart'
      : window.quickBuyTranslations?.soldOut || 'Sold out';
    
    // Update price if needed
    this.updatePrice(selectedOption);
  }

  updatePrice(selectedOption) {
    const priceContainer = this.container.querySelector('.quick-buy__price');
    if (priceContainer && selectedOption.dataset.price) {
      // Update price display with animation
      priceContainer.style.transform = 'scale(0.95)';
      setTimeout(() => {
        priceContainer.innerHTML = selectedOption.dataset.price;
        priceContainer.style.transform = 'scale(1)';
      }, 150);
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    if (this.button.disabled) return;
    
    this.setLoadingState(true);
    this.clearError();
    
    try {
      const formData = new FormData(this.form);
      const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          id: formData.get('id'),
          quantity: parseInt(formData.get('quantity'))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const item = await response.json();
      
      // Success animation
      this.showSuccess();
      
      // Update cart count and show sticky cart
      this.updateCartCount();
      this.showStickyCart();
      
      // AI navigation tracking - successful purchase
      this.trackSuccessfulPurchase(item);
      
      // Show cart drawer after short delay
      setTimeout(() => {
        if (window.cartDrawer) {
          window.cartDrawer.open();
        }
      }, 800);
      
    } catch (error) {
      console.error('Quick buy error:', error);
      this.showError(error.message || 'Une erreur est survenue');
    } finally {
      this.setLoadingState(false);
    }
  }

  setLoadingState(isLoading) {
    this.button.classList.toggle('loading', isLoading);
    this.button.disabled = isLoading;
    
    if (isLoading) {
      this.buttonText.style.opacity = '0';
      this.buttonLoading.style.opacity = '1';
    } else {
      this.buttonText.style.opacity = '1';
      this.buttonLoading.style.opacity = '0';
    }
  }

  showSuccess() {
    // Add success bubble animation
    this.button.classList.add('success');
    this.addBubbleEffect(this.button, 'success');
    
    const originalText = this.buttonText.textContent;
    this.buttonText.textContent = window.quickBuyTranslations?.added || 'Ajouté !';
    
    setTimeout(() => {
      this.button.classList.remove('success');
      this.buttonText.textContent = originalText;
    }, 2000);
  }

  showError(message) {
    this.errorContainer.textContent = message;
    this.errorContainer.setAttribute('aria-hidden', 'false');
    this.errorContainer.style.display = 'block';
    
    // Error animation
    this.errorContainer.style.animation = 'quickBuyErrorSlide 0.3s ease-out';
  }

  clearError() {
    this.errorContainer.setAttribute('aria-hidden', 'true');
    this.errorContainer.style.display = 'none';
    this.errorContainer.textContent = '';
  }

  addBubbleEffect(element, type = 'default') {
    const bubble = document.createElement('div');
    bubble.className = `bubble-effect bubble-effect--${type}`;
    
    const rect = element.getBoundingClientRect();
    const size = Math.random() * 20 + 10;
    
    bubble.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: linear-gradient(45deg, var(--gradient-base-accent-1), var(--gradient-base-accent-2));
      opacity: 0.7;
      pointer-events: none;
      z-index: 1000;
      animation: bubbleFloat 1s ease-out forwards;
    `;
    
    element.appendChild(bubble);
    
    setTimeout(() => bubble.remove(), 1000);
  }

  updateCartCount() {
    fetch(window.Shopify.routes.root + 'cart.js')
      .then(response => response.json())
      .then(cart => {
        const countElements = document.querySelectorAll('.cart-count');
        countElements.forEach(element => {
          element.textContent = cart.item_count;
          element.classList.add('updated');
          setTimeout(() => element.classList.remove('updated'), 300);
        });
      })
      .catch(console.error);
  }

  showStickyCart() {
    const stickyCart = document.querySelector('.sticky-cart');
    if (stickyCart) {
      stickyCart.classList.add('visible');
      stickyCart.style.animation = 'stickyCartSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  }

  // AI Navigation Methods
  trackInteraction() {
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('quick_buy_hover', {
        product_id: this.productId,
        timestamp: Date.now()
      });
    }
  }

  trackClick() {
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('quick_buy_click', {
        product_id: this.productId,
        timestamp: Date.now()
      });
    }
  }

  trackSuccessfulPurchase(item) {
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('quick_buy_success', {
        product_id: this.productId,
        variant_id: item.id,
        quantity: item.quantity,
        price: item.price,
        timestamp: Date.now()
      });
    }
  }
}

/**
 * Sticky Cart Component
 */
class StickyCart {
  constructor() {
    this.element = document.querySelector('.sticky-cart');
    this.threshold = window.innerHeight;
    this.isVisible = false;
    
    if (this.element) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
    this.updateCartData();
  }

  bindEvents() {
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Cart interaction events
    const checkoutBtn = this.element?.querySelector('.sticky-cart__checkout');
    const cartBtn = this.element?.querySelector('.sticky-cart__cart');
    
    checkoutBtn?.addEventListener('click', this.goToCheckout.bind(this));
    cartBtn?.addEventListener('click', this.openCartDrawer.bind(this));
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const shouldShow = scrollY > this.threshold;
    
    if (shouldShow !== this.isVisible) {
      this.toggle(shouldShow);
    }
  }

  handleResize() {
    this.threshold = window.innerHeight;
  }

  toggle(show) {
    this.isVisible = show;
    
    if (this.element) {
      this.element.classList.toggle('visible', show);
      
      if (show) {
        this.element.style.animation = 'stickyCartSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      } else {
        this.element.style.animation = 'stickyCartSlideOut 0.3s ease-in';
      }
    }
  }

  async updateCartData() {
    try {
      const response = await fetch(window.Shopify.routes.root + 'cart.js');
      const cart = await response.json();
      
      if (this.element) {
        const countElement = this.element.querySelector('.sticky-cart__count');
        const totalElement = this.element.querySelector('.sticky-cart__total');
        
        if (countElement) {
          countElement.textContent = cart.item_count;
        }
        
        if (totalElement) {
          totalElement.textContent = new Intl.NumberFormat(window.Shopify.locale, {
            style: 'currency',
            currency: window.Shopify.currency.active
          }).format(cart.total_price / 100);
        }
        
        // Show/hide based on cart contents
        this.element.style.display = cart.item_count > 0 ? 'block' : 'none';
      }
    } catch (error) {
      console.error('Error updating cart data:', error);
    }
  }

  goToCheckout() {
    // AI navigation tracking
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('sticky_cart_checkout', {
        timestamp: Date.now()
      });
    }
    
    window.location.href = window.Shopify.routes.root + 'checkout';
  }

  openCartDrawer() {
    if (window.cartDrawer) {
      window.cartDrawer.open();
    }
    
    // AI navigation tracking
    if (window.aiNavigation) {
      window.aiNavigation.trackEvent('sticky_cart_open', {
        timestamp: Date.now()
      });
    }
  }
}

// Animation keyframes (to be added to CSS)
const animationStyles = `
  @keyframes bubbleFloat {
    0% {
      transform: translateY(0) scale(0);
      opacity: 0.7;
    }
    50% {
      transform: translateY(-20px) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateY(-40px) scale(0);
      opacity: 0;
    }
  }

  @keyframes stickyCartSlideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes stickyCartSlideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  @keyframes quickBuyErrorSlide {
    from {
      transform: translateX(-10px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Quick Buy components
  document.querySelectorAll('.quick-buy').forEach(element => {
    new QuickBuy(element);
  });
  
  // Initialize Sticky Cart
  new StickyCart();
  
  // Add animation styles if not already present
  if (!document.getElementById('quick-buy-animations')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'quick-buy-animations';
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);
  }
});

// Global availability
window.QuickBuy = QuickBuy;
window.StickyCart = StickyCart; 