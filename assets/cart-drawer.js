/* Cart drawer functionality following Bubbly design from shopirule.mdc */

class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Close drawer when clicking overlay
    const overlay = this.querySelector('.cart-drawer__overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.close());
    }

    // Close drawer when clicking close button
    const closeButton = this.querySelector('.cart-drawer__close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.close());
    }

    // Handle escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Handle quantity changes
    this.addEventListener('change', (event) => {
      if (event.target.classList.contains('quantity__input')) {
        this.updateQuantity(event.target);
      }
    });

    // Handle quantity buttons
    this.addEventListener('click', (event) => {
      if (event.target.closest('.quantity__button')) {
        this.handleQuantityButton(event);
      }
      
      if (event.target.closest('.cart-remove-button')) {
        this.removeItem(event);
      }
    });
  }

  open() {
    document.body.classList.add('overflow-hidden');
    this.classList.add('animate');
    this.style.visibility = 'visible';
    
    // Focus management
    const firstFocusable = this.querySelector('.cart-drawer__close');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  close() {
    document.body.classList.remove('overflow-hidden');
    this.classList.remove('animate');
    
    setTimeout(() => {
      this.style.visibility = 'hidden';
    }, 400);
  }

  isOpen() {
    return this.classList.contains('animate');
  }

  handleQuantityButton(event) {
    event.preventDefault();
    const button = event.target.closest('.quantity__button');
    const quantityInput = button.parentElement.querySelector('.quantity__input');
    const currentValue = parseInt(quantityInput.value);
    const isIncrement = button.name === 'plus';
    
    let newValue = isIncrement ? currentValue + 1 : currentValue - 1;
    newValue = Math.max(0, newValue);
    
    quantityInput.value = newValue;
    this.updateQuantity(quantityInput);
  }

  async updateQuantity(input) {
    const index = input.dataset.index;
    const quantity = parseInt(input.value);
    
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line: index,
          quantity: quantity
        })
      });

      if (response.ok) {
        const cart = await response.json();
        this.updateCartDisplay(cart);
        this.updateCartCount(cart.item_count);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  async removeItem(event) {
    event.preventDefault();
    const button = event.target.closest('.cart-remove-button');
    const cartItem = button.closest('.cart-item');
    const quantityInput = cartItem.querySelector('.quantity__input');
    
    quantityInput.value = '0';
    await this.updateQuantity(quantityInput);
  }

  updateCartDisplay(cart) {
    // Refresh the drawer content
    fetch(`${window.location.pathname}?section_id=cart-drawer`)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector('cart-drawer .cart-drawer__content');
        
        if (newContent) {
          this.querySelector('.cart-drawer__content').innerHTML = newContent.innerHTML;
          this.bindEvents(); // Re-bind events for new content
        }
      })
      .catch(error => console.error('Error refreshing cart:', error));
  }

  updateCartCount(count) {
    // Update cart count in header
    const cartCountElements = document.querySelectorAll('.cart-count-bubble');
    cartCountElements.forEach(element => {
      element.textContent = count;
      element.style.display = count > 0 ? 'block' : 'none';
    });
  }
}

// Custom element for quantity input
class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const minusButton = this.querySelector('[name="minus"]');
    const plusButton = this.querySelector('[name="plus"]');
    const input = this.querySelector('.quantity__input');

    if (minusButton) {
      minusButton.addEventListener('click', () => {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.max(0, currentValue - 1);
        input.value = newValue;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    if (plusButton) {
      plusButton.addEventListener('click', () => {
        const currentValue = parseInt(input.value) || 0;
        const newValue = currentValue + 1;
        input.value = newValue;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  }
}

// Register custom elements
customElements.define('cart-drawer', CartDrawer);
customElements.define('quantity-input', QuantityInput);

// Initialize cart drawer functionality
document.addEventListener('DOMContentLoaded', function() {
  // Open cart drawer when cart icon is clicked
  const cartIcon = document.querySelector('#cart-icon-bubble');
  const cartDrawer = document.querySelector('cart-drawer');
  
  if (cartIcon && cartDrawer) {
    cartIcon.addEventListener('click', (event) => {
      event.preventDefault();
      cartDrawer.open();
    });
  }
});

class CartDrawerItems extends HTMLElement {
  constructor() {
    super();

    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-drawer') {
        return;
      }
      this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  onChange(event) {
    const inputElement = event.target;
    if (inputElement.name !== 'updates[]') return;

    this.updateQuantity(inputElement.dataset.index, inputElement.value, document.activeElement.getAttribute('name'), inputElement.dataset.quantityVariantId);
  }

  onCartUpdate() {
    fetch(`${routes.cart_url}?section_id=cart-drawer`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const selectors = ['cart-drawer-items', '.cart-drawer__footer'];
        for (const selector of selectors) {
          const targetElement = document.querySelector(selector);
          const sourceElement = html.querySelector(selector);
          if (targetElement && sourceElement) {
            targetElement.replaceWith(sourceElement);
          }
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        section: 'cart-drawer',
        selector: '.drawer__inner'
      },
      {
        id: 'cart-icon-bubble'
      }
    ];
  }

  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement = document.getElementById(`Drawer-quantity-${line}`) || document.getElementById(`CartDrawer-quantity-${line}`);
        const items = document.querySelectorAll('.cart-item');

        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute('value');
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const drawer = document.querySelector('cart-drawer');
        drawer.renderContents(parsedState);

        if (parsedState.item_count === 0 && name === 'plus') {
          trapFocus(drawer.querySelector('.drawer__inner-empty'), drawer.querySelector('a'))
        } else if (document.querySelector('.cart-item') && name !== '') {
          trapFocus(drawer, document.querySelector(`#CartDrawer-Item-${line}`) || document.querySelector(`#CartDrawer-Item-${Array.from(items).map(item => item.id).sort().reverse()[0].split('-')[2]}`), false);
        }

        publish(PUB_SUB_EVENTS.cartUpdate, {source: 'cart-drawer'});
      }).catch(() => {
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById(`CartDrawer-LineItemError-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError = document.getElementById(`CartDrawer-LineItemError-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError) lineItemError.querySelector('.cart-item__error-text').innerHTML = message;

    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('CartDrawer-CartItems') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);
    const cartItem = document.getElementById(`CartDrawer-Item-${line}`);

    if (cartItem) {
      cartItem.classList.add('cart-item--disabled');
      cartItemElements.forEach((overlay) => overlay.classList.remove('hidden'));
    }
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('CartDrawer-CartItems') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);
    const cartItem = document.getElementById(`CartDrawer-Item-${line}`);

    if (cartItem) {
      cartItem.classList.remove('cart-item--disabled');
      cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
    }
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);

class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-drawer-items') || this.closest('cart-items');
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

// Utility functions
function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();

  if (elementToFocus.tagName === 'INPUT' &&
    ['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
    elementToFocus.value) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

const trapFocusHandlers = {};

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

// Pub/Sub events
const PUB_SUB_EVENTS = {
  cartUpdate: 'cart-update',
  quantityUpdate: 'quantity-update',
  variantChange: 'variant-change',
  cartError: 'cart-error'
};

let subscribers = {};

function subscribe(eventName, callback) {
  if (subscribers[eventName] === undefined) {
    subscribers[eventName] = [];
  }

  subscribers[eventName] = [...subscribers[eventName], callback];

  return function unsubscribe() {
    subscribers[eventName] = subscribers[eventName].filter((cb) => {
      return cb !== callback;
    });
  };
}

function publish(eventName, data) {
  if (subscribers[eventName]) {
    subscribers[eventName].forEach((callback) => {
      callback(data);
    });
  }
}

// Debounce function
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

const ON_CHANGE_DEBOUNCE_TIMER = 300;

// Fetch config
function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
} 