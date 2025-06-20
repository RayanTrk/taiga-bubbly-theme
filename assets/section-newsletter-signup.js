/**
 * Newsletter Signup Section - Bubbly Style
 * Handles form validation, submission, and user interactions
 */

class NewsletterSignup {
  constructor(section) {
    this.section = section;
    this.form = section.querySelector('[data-newsletter-form]');
    this.submitBtn = section.querySelector('.newsletter-submit-btn');
    this.buttonText = this.submitBtn.querySelector('.button-text');
    this.buttonSpinner = this.submitBtn.querySelector('.button-spinner');
    this.errorContainer = section.querySelector('.newsletter-form-error');
    this.successContainer = section.querySelector('.newsletter-form-success');
    
    this.isSubmitting = false;
    this.validationRules = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[1-9][\d]{0,15}$/
    };
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupFormValidation();
    this.setupAccessibility();
    this.trackAINavigation();
    
    // Initialize decorative animations
    this.setupDecorations();
    
    console.log('Newsletter signup initialized');
  }

  bindEvents() {
    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      
      // Real-time validation
      const inputs = this.form.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('blur', this.validateField.bind(this));
        input.addEventListener('input', this.clearFieldError.bind(this));
      });
      
      // Checkbox interactions
      const checkboxes = this.form.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', this.handleCheckboxChange.bind(this));
      });
    }

    // Handle window events
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  setupFormValidation() {
    // Add custom validation messages
    const emailInput = this.form.querySelector('input[type="email"]');
    if (emailInput) {
      emailInput.addEventListener('invalid', (e) => {
        e.preventDefault();
        this.showFieldError(emailInput, 'Please enter a valid email address');
      });
    }

    const phoneInput = this.form.querySelector('input[type="tel"]');
    if (phoneInput) {
      phoneInput.addEventListener('invalid', (e) => {
        e.preventDefault();
        this.showFieldError(phoneInput, 'Please enter a valid phone number');
      });
    }
  }

  setupAccessibility() {
    // Ensure proper ARIA attributes
    const form = this.form;
    if (form && !form.getAttribute('aria-label')) {
      form.setAttribute('aria-label', 'Newsletter subscription form');
    }

    // Add keyboard navigation for custom checkboxes
    const checkboxes = this.form.querySelectorAll('.checkbox__input');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
          e.preventDefault();
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  trackAINavigation() {
    // Track user interactions for AI Navigation optimization
    if (window.AINavigation) {
      // Track form engagement
      this.form.addEventListener('focusin', () => {
        window.AINavigation.trackEvent('newsletter_form_engagement', {
          section: 'newsletter_signup',
          action: 'form_focus'
        });
      });

      // Track field completion
      const inputs = this.form.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          if (input.value.trim()) {
            window.AINavigation.trackEvent('newsletter_field_completion', {
              field: input.name,
              section: 'newsletter_signup'
            });
          }
        });
      });
    }
  }

  setupDecorations() {
    // Add interactive hover effects to decorative elements
    const bubbles = this.section.querySelectorAll('.bubble');
    bubbles.forEach((bubble, index) => {
      bubble.addEventListener('mouseenter', () => {
        bubble.style.animationPlayState = 'paused';
        bubble.style.transform = 'scale(1.1)';
      });
      
      bubble.addEventListener('mouseleave', () => {
        bubble.style.animationPlayState = 'running';
        bubble.style.transform = 'scale(1)';
      });
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (this.isSubmitting) return;
    
    // Clear previous messages
    this.clearMessages();
    
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    
    this.isSubmitting = true;
    this.setLoadingState(true);
    
    try {
      const formData = new FormData(this.form);
      const response = await this.submitForm(formData);
      
      if (response.success) {
        this.showSuccess();
        this.resetForm();
        this.trackConversion();
      } else {
        throw new Error(response.message || 'Subscription failed');
      }
    } catch (error) {
      console.error('Newsletter submission error:', error);
      this.showError(error.message || 'Something went wrong. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.setLoadingState(false);
    }
  }

  async submitForm(formData) {
    // Simulate API call - replace with actual endpoint
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure
        const success = Math.random() > 0.1; // 90% success rate for demo
        
        if (success) {
          resolve({
            success: true,
            message: 'Successfully subscribed!'
          });
        } else {
          reject(new Error('Network error. Please try again.'));
        }
      }, 2000);
    });
  }

  validateForm() {
    let isValid = true;
    const inputs = this.form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
      if (!this.validateField({ target: input })) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  validateField(e) {
    const input = e.target;
    const value = input.value.trim();
    const fieldName = input.name;
    
    // Clear previous error
    this.clearFieldError(input);
    
    // Required field validation
    if (input.hasAttribute('required') && !value) {
      this.showFieldError(input, `${this.getFieldLabel(input)} is required`);
      return false;
    }
    
    // Type-specific validation
    if (value) {
      if (input.type === 'email' && !this.validationRules.email.test(value)) {
        this.showFieldError(input, 'Please enter a valid email address');
        return false;
      }
      
      if (input.type === 'tel' && !this.validationRules.phone.test(value)) {
        this.showFieldError(input, 'Please enter a valid phone number');
        return false;
      }
    }
    
    return true;
  }

  getFieldLabel(input) {
    const label = this.form.querySelector(`label[for="${input.id}"]`);
    return label ? label.textContent.replace('*', '').trim() : input.name;
  }

  showFieldError(input, message) {
    const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
    if (errorElement) {
      errorElement.textContent = message;
      input.setAttribute('aria-invalid', 'true');
      input.classList.add('field--error');
    }
  }

  clearFieldError(input) {
    const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
    if (errorElement) {
      errorElement.textContent = '';
      input.removeAttribute('aria-invalid');
      input.classList.remove('field--error');
    }
  }

  handleCheckboxChange(e) {
    const checkbox = e.target;
    const label = checkbox.nextElementSibling;
    
    if (checkbox.checked) {
      label.style.color = '#007bff';
    } else {
      label.style.color = '';
    }
    
    // Track preference selection
    if (window.AINavigation && checkbox.name.includes('preferences')) {
      window.AINavigation.trackEvent('newsletter_preference_selected', {
        preference: checkbox.value,
        selected: checkbox.checked
      });
    }
  }

  setLoadingState(loading) {
    if (loading) {
      this.submitBtn.disabled = true;
      this.buttonText.style.opacity = '0';
      this.buttonSpinner.classList.remove('hidden');
      this.submitBtn.setAttribute('aria-busy', 'true');
    } else {
      this.submitBtn.disabled = false;
      this.buttonText.style.opacity = '1';
      this.buttonSpinner.classList.add('hidden');
      this.submitBtn.removeAttribute('aria-busy');
    }
  }

  showSuccess() {
    this.successContainer.classList.remove('hidden');
    this.successContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Announce to screen readers
    this.successContainer.setAttribute('aria-live', 'polite');
    
    // Hide after 5 seconds
    setTimeout(() => {
      this.successContainer.classList.add('hidden');
    }, 5000);
  }

  showError(message) {
    this.errorContainer.textContent = message;
    this.errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Announce to screen readers
    this.errorContainer.setAttribute('aria-live', 'assertive');
  }

  clearMessages() {
    this.errorContainer.textContent = '';
    this.successContainer.classList.add('hidden');
    
    // Clear field errors
    const errorElements = this.form.querySelectorAll('.field__error');
    errorElements.forEach(element => element.textContent = '');
    
    const inputs = this.form.querySelectorAll('input');
    inputs.forEach(input => {
      input.removeAttribute('aria-invalid');
      input.classList.remove('field--error');
    });
  }

  resetForm() {
    // Reset form fields
    this.form.reset();
    
    // Reset custom checkbox styles
    const checkboxes = this.form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      const label = checkbox.nextElementSibling;
      if (label) {
        label.style.color = '';
      }
    });
    
    // Reset floating labels
    const inputs = this.form.querySelectorAll('.field__input');
    inputs.forEach(input => {
      const label = input.nextElementSibling;
      if (label && label.classList.contains('field__label')) {
        label.style.transform = '';
        label.style.color = '';
      }
    });
  }

  trackConversion() {
    // Track successful newsletter signup
    if (window.AINavigation) {
      window.AINavigation.trackEvent('newsletter_signup_success', {
        section: 'newsletter_signup',
        timestamp: Date.now()
      });
    }
    
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'newsletter_signup', {
        event_category: 'engagement',
        event_label: 'newsletter_form'
      });
    }
    
    // Facebook Pixel tracking
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Subscribe');
    }
  }

  handleResize() {
    // Adjust decorative elements on resize
    const decorations = this.section.querySelector('.newsletter-decorations');
    if (decorations && window.innerWidth < 768) {
      decorations.style.display = 'none';
    } else if (decorations) {
      decorations.style.display = '';
    }
  }

  destroy() {
    // Cleanup event listeners
    if (this.form) {
      this.form.removeEventListener('submit', this.handleSubmit);
    }
    
    window.removeEventListener('resize', this.handleResize);
    
    console.log('Newsletter signup destroyed');
  }
}

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  const newsletterSections = document.querySelectorAll('.newsletter-section');
  
  newsletterSections.forEach(section => {
    new NewsletterSignup(section);
  });
});

// Handle section reloads in theme editor
document.addEventListener('shopify:section:load', (e) => {
  if (e.target.classList.contains('newsletter-section')) {
    new NewsletterSignup(e.target);
  }
});

// Cleanup on section unload
document.addEventListener('shopify:section:unload', (e) => {
  if (e.target.classList.contains('newsletter-section')) {
    const instance = e.target.newsletterInstance;
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
  }
});

// Export for external use
window.NewsletterSignup = NewsletterSignup; 