/**
 * Product Form Functionality - Taiga Bubbly Theme
 * Handles variant selection, quantity updates, and cart interactions
 * Following shopirule.mdc guidelines for performance and accessibility
 */

if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();
      
      this.form = this.querySelector('form');
      this.cartButton = this.querySelector('[name="add"]');
      this.cartButtonText = this.cartButton?.querySelector('span');
      this.cartError = this.querySelector('.product-form__error-message-wrapper');
      this.cartErrorMessage = this.querySelector('.product-form__error-message');
      this.cartNotification = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      
      this.hideErrors = this.dataset.hideErrors === 'true';
      this.initEventListeners();
    }

    initEventListeners() {
      if (!this.form) return;

      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cartButton?.addEventListener('click', this.onSubmitHandler.bind(this));
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      
      if (this.cartButton?.getAttribute('aria-disabled') === 'true') return;
      
      this.handleErrorMessage();
      this.cartButton?.setAttribute('aria-disabled', 'true');
      this.cartButton?.classList.add('loading');
      
      if (this.cartButton?.querySelector('.loading-overlay__spinner')) {
        this.cartButton.querySelector('.loading-overlay__spinner').classList.remove('hidden');
      }

      const config = this.getConfigFromForm();
      
      // AI Navigation tracking for user patterns
      if (window.ThemeAI && window.ThemeAI.trackAction) {
        window.ThemeAI.trackAction('add_to_cart_attempt', {
          product_id: config.id,
          variant_id: config.id,
          quantity: config.quantity
        });
      }

      fetch(`${routes.cart_add_url}`, { ...config })
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);
            
            const soldOutMessage = this.cartButton?.querySelector('.sold-out-message');
            if (!soldOutMessage) return;
            
            this.cartButton.setAttribute('aria-disabled', 'true');
            this.cartButton.querySelector('span').classList.add('hidden');
            soldOutMessage.classList.remove('hidden');
            this.error = true;
            return;
          } else if (!this.cartNotification) {
            window.location = window.routes.cart_url;
            return;
          }

          if (!this.error) {
            this.publish(PUB_SUB_EVENTS.cartUpdate, {
              source: 'product-form',
              productVariantId: response.variant_id,
              cartData: response,
            });
          }
          
          this.error = false;
          
          // AI Navigation tracking for successful add to cart
          if (window.ThemeAI && window.ThemeAI.trackAction) {
            window.ThemeAI.trackAction('add_to_cart_success', {
              product_id: response.product_id,
              variant_id: response.variant_id,
              quantity: response.quantity
            });
          }
          
          const quickAddModal = this.cartButton?.closest('quick-add-modal');
          if (quickAddModal) {
            document.body.addEventListener(
              'modalClosed',
              () => {
                setTimeout(() => {
                  this.cartNotification.renderContents(response);
                });
              },
              { once: true }
            );
            quickAddModal.hide(true);
          } else {
            this.cartNotification.renderContents(response);
          }
        })
        .catch((e) => {
          console.error(e);
          this.handleErrorMessage(e.message || 'An error occurred. Please try again.');
        })
        .finally(() => {
          this.cartButton?.classList.remove('loading');
          if (this.cartButton?.querySelector('.loading-overlay__spinner')) {
            this.cartButton.querySelector('.loading-overlay__spinner').classList.add('hidden');
          }
          if (!this.error) {
            this.cartButton?.removeAttribute('aria-disabled');
          }
        });
    }

    getConfigFromForm() {
      const formData = new FormData(this.form);
      const config = {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/javascript',
        },
        body: formData
      };
      
      if (this.cartButton?.dataset.sectionId) {
        formData.append('sections', this.cartButton.dataset.sectionId);
        formData.append('sections_url', window.location.pathname);
        config.headers['Accept'] = 'application/json';
      }
      
      return config;
    }

    handleErrorMessage(errorMessage = false) {
      if (this.hideErrors) return;

      this.cartErrorMessage = this.cartErrorMessage || this.querySelector('.product-form__error-message');
      this.cartError = this.cartError || this.querySelector('.product-form__error-message-wrapper');

      if (!this.cartErrorMessage) return;

      if (errorMessage) {
        this.cartErrorMessage.textContent = errorMessage;
        this.cartError.removeAttribute('hidden');
        this.cartError.setAttribute('aria-live', 'polite');
        this.error = true;
      } else {
        this.cartError.setAttribute('hidden', '');
        this.cartError.removeAttribute('aria-live');
      }
    }

    publish(event, data) {
      document.dispatchEvent(new CustomEvent(event, { detail: data }));
    }
  });
}

if (!customElements.get('variant-radios')) {
  customElements.define('variant-radios', class VariantRadios extends HTMLElement {
    constructor() {
      super();
      this.initEventListeners();
    }

    initEventListeners() {
      this.addEventListener('change', this.onVariantChange.bind(this));
    }

    onVariantChange() {
      this.updateOptions();
      this.updateMasterIdInput();
      this.toggleAddButton();
      this.updatePickupAvailability();
      this.removeErrorMessage();
      this.updateVariantStatuses();

      if (!this.currentVariant) {
        this.toggleAddButton(true);
        this.setUnavailable();
      } else {
        this.updateMedia();
        this.updateURL();
        this.updateVariantInput();
        this.renderProductInfo();
        this.updateShareUrl();
      }
      
      // AI Navigation tracking for variant selection
      if (window.ThemeAI && window.ThemeAI.trackAction) {
        window.ThemeAI.trackAction('variant_selected', {
          product_id: this.dataset.productId || '',
          variant_id: this.currentVariant?.id || '',
          option_selections: this.getSelectedOptions()
        });
      }
    }

    updateOptions() {
      const fieldsets = Array.from(this.querySelectorAll('fieldset'));
      this.options = fieldsets.map((fieldset) => {
        return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked)?.value;
      });
    }

    updateMasterIdInput() {
      this.currentVariant = this.getVariantData().find((variant) => {
        return !variant.options.map((option, index) => {
          return this.options[index] === option;
        }).includes(false);
      });
    }

    updateMedia() {
      if (!this.currentVariant) return;
      if (!this.currentVariant.featured_media) return;

      const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-"]`);
      mediaGalleries.forEach((mediaGallery) =>
        mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true)
      );

      const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
      if (!modalContent) return;
      
      const newMediaModal = modalContent.querySelector(`[data-media-id="${this.currentVariant.featured_media.id}"]`);
      modalContent.prepend(newMediaModal);
    }

    updateURL() {
      if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
      window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
    }

    updateShareUrl() {
      const shareButton = document.getElementById(`Share-${this.dataset.section}`);
      if (!shareButton || !shareButton.updateUrl) return;
      shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
    }

    updateVariantInput() {
      const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
      productForms.forEach((productForm) => {
        const input = productForm.querySelector('input[name="id"]');
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    updateVariantStatuses() {
      const selectedOptionOneVariants = this.variantData.filter(
        (variant) => this.querySelector(':checked').value === variant.option1
      );
      const inputWrappers = [...this.querySelectorAll('.product-form__input')];
      inputWrappers.forEach((option, index) => {
        if (index === 0) return;
        const optionInputs = [...option.querySelectorAll('input[type="radio"], option')];
        const previousOptionSelected = inputWrappers[index - 1].querySelector(':checked').value;
        const availableOptionInputsValue = selectedOptionOneVariants
          .filter((variant) => variant.available && variant[`option${index}`] === previousOptionSelected)
          .map((variantOption) => variantOption[`option${index + 1}`]);
        this.setInputAvailability(optionInputs, availableOptionInputsValue);
      });
    }

    setInputAvailability(listOfOptions, listOfAvailableOptions) {
      listOfOptions.forEach((input) => {
        if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
          input.innerText = input.getAttribute('value');
        } else {
          input.innerText = window.variantStrings.unavailable_with_option.replace('[value]', input.getAttribute('value'));
        }
      });
    }

    updatePickupAvailability() {
      const pickUpAvailability = document.querySelector('pickup-availability');
      if (!pickUpAvailability) return;

      if (this.currentVariant && this.currentVariant.available) {
        pickUpAvailability.fetchAvailability(this.currentVariant.id);
      } else {
        pickUpAvailability.removeAttribute('available');
        pickUpAvailability.innerHTML = '';
      }
    }

    removeErrorMessage() {
      const section = this.closest('section');
      if (!section) return;

      const productForm = section.querySelector('product-form');
      if (productForm) productForm.handleErrorMessage();
    }

    renderProductInfo() {
      const requestedVariantId = this.currentVariant.id;
      const sectionId = this.dataset.originalSection || this.dataset.section;

      fetch(`${this.dataset.url}?variant=${requestedVariantId}&section_id=${this.dataset.originalSection || this.dataset.section}`)
        .then((response) => response.text())
        .then((responseText) => {
          if (this.currentVariant.id !== requestedVariantId) return;

          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const destination = document.getElementById(`price-${this.dataset.section}`);
          const source = html.getElementById(`price-${this.dataset.originalSection || this.dataset.section}`);
          
          const skuSource = html.getElementById(`Sku-${this.dataset.originalSection || this.dataset.section}`);
          const skuDestination = document.getElementById(`Sku-${this.dataset.section}`);
          const inventorySource = html.getElementById(`Inventory-${this.dataset.originalSection || this.dataset.section}`);
          const inventoryDestination = document.getElementById(`Inventory-${this.dataset.section}`);

          if (source && destination) destination.innerHTML = source.innerHTML;
          if (inventorySource && inventoryDestination) inventoryDestination.innerHTML = inventorySource.innerHTML;
          if (skuSource && skuDestination) {
            skuDestination.innerHTML = skuSource.innerHTML;
            skuDestination.classList.toggle('visibility-hidden', skuSource.classList.contains('visibility-hidden'));
          }

          const price = document.getElementById(`price-${this.dataset.section}`);
          if (price) price.classList.remove('visibility-hidden');

          if (inventoryDestination) inventoryDestination.classList.toggle('visibility-hidden', inventorySource.innerText === '');

          const addButtonUpdated = html.getElementById(`ProductSubmitButton-${sectionId}`);
          this.toggleAddButton(addButtonUpdated ? addButtonUpdated.hasAttribute('disabled') : true, window.variantStrings.soldOut);
        });
    }

    toggleAddButton(disable = true, text, modifyClass = true) {
      const productForm = document.getElementById(`product-form-${this.dataset.section}`);
      if (!productForm) return;

      const addButton = productForm.querySelector('[name="add"]');
      const addButtonText = productForm.querySelector('[name="add"] > span');
      if (!addButton) return;

      if (disable) {
        addButton.setAttribute('disabled', 'disabled');
        if (text) addButtonText.textContent = text;
      } else {
        addButton.removeAttribute('disabled');
        addButtonText.textContent = window.variantStrings.addToCart;
      }

      if (!modifyClass) return;
    }

    setUnavailable() {
      const button = document.getElementById(`product-form-${this.dataset.section}`);
      const addButton = button?.querySelector('[name="add"]');
      const addButtonText = button?.querySelector('[name="add"] > span');
      const price = document.getElementById(`price-${this.dataset.section}`);
      if (!addButton) return;
      
      addButtonText.textContent = window.variantStrings.unavailable;
      if (price) price.classList.add('visibility-hidden');
    }

    getVariantData() {
      this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
      return this.variantData;
    }

    getSelectedOptions() {
      return this.options.map((option, index) => {
        return { [`option${index + 1}`]: option };
      }).reduce((acc, option) => ({ ...acc, ...option }), {});
    }
  });
}

if (!customElements.get('quantity-input')) {
  customElements.define('quantity-input', class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('input');
      this.changeEvent = new Event('change', { bubbles: true });
      this.input.addEventListener('change', this.onInputChange.bind(this));
      this.querySelectorAll('button').forEach((button) =>
        button.addEventListener('click', this.onButtonClick.bind(this))
      );
    }

    onInputChange(event) {
      this.validateQtyRules();
    }

    onButtonClick(event) {
      event.preventDefault();
      const previousValue = this.input.value;

      if (event.target.name === 'plus') {
        this.input.stepUp();
      } else {
        this.input.stepDown();
      }

      if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
      this.validateQtyRules();
    }

    validateQtyRules() {
      const value = parseInt(this.input.value);
      if (this.input.min) {
        const min = parseInt(this.input.min);
        const buttonMinus = this.querySelector(`button[name="minus"]`);
        buttonMinus.classList.toggle('disabled', value <= min);
      }
      if (this.input.max) {
        const max = parseInt(this.input.max);
        const buttonPlus = this.querySelector(`button[name="plus"]`);
        buttonPlus.classList.toggle('disabled', value >= max);
      }
    }
  });
}

// Product Media Gallery functionality
class ProductMediaGallery {
  constructor(container) {
    this.container = container;
    this.mediaItems = this.container.querySelectorAll('.product__media-toggle');
    this.featuredMedia = this.container.querySelector('.product__media--featured');
    
    this.initEventListeners();
  }

  initEventListeners() {
    this.mediaItems.forEach(item => {
      item.addEventListener('click', this.onMediaClick.bind(this));
      item.addEventListener('keydown', this.onMediaKeydown.bind(this));
    });
  }

  onMediaClick(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const mediaId = target.dataset.target;
    this.setActiveMedia(mediaId);
    
    // AI Navigation tracking for media interaction
    if (window.ThemeAI && window.ThemeAI.trackAction) {
      window.ThemeAI.trackAction('product_media_viewed', {
        media_id: mediaId,
        media_position: target.dataset.mediaPosition || '1'
      });
    }
  }

  onMediaKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onMediaClick(event);
    }
  }

  setActiveMedia(mediaId) {
    // Update main media
    const targetMedia = this.container.querySelector(`[data-media-id="${mediaId}"]`);
    if (targetMedia && this.featuredMedia) {
      const targetImg = targetMedia.querySelector('img, video');
      const featuredContainer = this.featuredMedia.querySelector('.product__media-item');
      
      if (targetImg && featuredContainer) {
        featuredContainer.innerHTML = targetImg.outerHTML;
        this.featuredMedia.dataset.mediaId = mediaId;
      }
    }

    // Update active state
    this.mediaItems.forEach(item => {
      item.classList.toggle('active', item.dataset.target === mediaId);
      item.setAttribute('aria-pressed', item.dataset.target === mediaId ? 'true' : 'false');
    });
  }
}

// Initialize product media galleries
document.addEventListener('DOMContentLoaded', () => {
  const mediaGalleries = document.querySelectorAll('.product__media-wrapper');
  mediaGalleries.forEach(gallery => {
    new ProductMediaGallery(gallery);
  });
});

// Global variant strings for translation support
window.variantStrings = {
  addToCart: window.variantStrings?.addToCart || 'Add to cart',
  soldOut: window.variantStrings?.soldOut || 'Sold out',
  unavailable: window.variantStrings?.unavailable || 'Unavailable',
  unavailable_with_option: window.variantStrings?.unavailable_with_option || '[value] - Unavailable',
};

// PubSub events for cart updates
window.PUB_SUB_EVENTS = {
  cartUpdate: 'cart-update',
  quantityUpdate: 'quantity-update',
  variantChange: 'variant-change',
  cartError: 'cart-error'
};

// Performance optimization: Use passive event listeners where possible
const addPassiveEventListener = (element, event, handler) => {
  element.addEventListener(event, handler, { passive: true });
};

// Export for potential use by other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProductMediaGallery };
} 