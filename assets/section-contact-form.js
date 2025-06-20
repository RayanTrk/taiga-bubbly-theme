/**
 * Contact Form Section - Bubbly Style
 * Handles form validation, submission, and user interactions
 */

class ContactForm {
  constructor(section) {
    this.section = section;
    this.form = section.querySelector('[data-contact-form]');
    this.submitBtn = section.querySelector('.contact-submit-btn');
    this.buttonText = this.submitBtn?.querySelector('.button-text');
    this.buttonSpinner = this.submitBtn?.querySelector('.button-spinner');
    
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
    this.setupDecorations();
    
    console.log('Contact form initialized');
  }

  bindEvents() {
    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      
      // Real-time validation
      const inputs = this.form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', this.validateField.bind(this));
        input.addEventListener('input', this.clearFieldError.bind(this));
        
        // Special handling for select
        if (input.tagName === 'SELECT') {
          input.addEventListener('change', this.handleSelectChange.bind(this));
        }
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

    const messageInput = this.form.querySelector('textarea');
    if (messageInput) {
      messageInput.addEventListener('invalid', (e) => {
        e.preventDefault();
        this.showFieldError(messageInput, 'Please enter your message');
      });
    }
  }

  setupAccessibility() {
    // Ensure proper ARIA attributes
    const form = this.form;
    if (form && !form.getAttribute('aria-label')) {
      form.setAttribute('aria-label', 'Contact form');
    }

    // Add keyboard navigation for custom elements
    const selectFields = this.form.querySelectorAll('.field--select');
    selectFields.forEach(field => {
      const select = field.querySelector('select');
      const icon = field.querySelector('.field__select-icon');
      
      select.addEventListener('focus', () => {
        icon.style.transform = 'translateY(-50%) rotate(180deg)';
      });
      
      select.addEventListener('blur', () => {
        icon.style.transform = 'translateY(-50%) rotate(0deg)';
      });
    });

    // Enhance checkbox accessibility
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
        window.AINavigation.trackEvent('contact_form_engagement', {
          section: 'contact_form',
          action: 'form_focus'
        });
      });

      // Track field completion
      const inputs = this.form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          if (input.value.trim()) {
            window.AINavigation.trackEvent('contact_field_completion', {
              field: input.name,
              section: 'contact_form'
            });
          }
        });
      });

      // Track inquiry type selection
      const inquirySelect = this.form.querySelector('select[name="contact[inquiry_type]"]');
      if (inquirySelect) {
        inquirySelect.addEventListener('change', () => {
          window.AINavigation.trackEvent('contact_inquiry_selected', {
            inquiry_type: inquirySelect.value,
            section: 'contact_form'
          });
        });
      }
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
    
    // Clear previous errors
    this.clearFormErrors();
    
    // Validate form
    if (!this.validateForm()) {
      this.focusFirstError();
      return;
    }
    
    this.isSubmitting = true;
    this.setLoadingState(true);
    
    try {
      // The form will be submitted normally to Shopify's contact endpoint
      // This is just for UI feedback and tracking
      this.trackFormSubmission();
      
      // Let the form submit naturally
      this.form.submit();
      
    } catch (error) {
      console.error('Contact form submission error:', error);
      this.showFormError('Something went wrong. Please try again.');
      this.isSubmitting = false;
      this.setLoadingState(false);
    }
  }

  validateForm() {
    let isValid = true;
    const inputs = this.form.querySelectorAll('input[required], textarea[required], select[required]');
    
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
      
      if (input.tagName === 'TEXTAREA' && value.length < 10) {
        this.showFieldError(input, 'Please provide a more detailed message (at least 10 characters)');
        return false;
      }
    }
    
    return true;
  }

  getFieldLabel(input) {
    const label = this.form.querySelector(`label[for="${input.id}"]`);
    if (label) {
      return label.textContent.replace('*', '').trim();
    }
    
    // Fallback to placeholder or name
    return input.placeholder || input.name || 'This field';
  }

  showFieldError(input, message) {
    const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
    if (errorElement) {
      errorElement.textContent = message;
      input.setAttribute('aria-invalid', 'true');
      input.closest('.field').classList.add('field--error');
    }
  }

  clearFieldError(input) {
    const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
    if (errorElement) {
      errorElement.textContent = '';
      input.removeAttribute('aria-invalid');
      input.closest('.field').classList.remove('field--error');
    }
  }

  clearFormErrors() {
    // Clear field errors
    const errorElements = this.form.querySelectorAll('.field__error');
    errorElements.forEach(element => element.textContent = '');
    
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.removeAttribute('aria-invalid');
      input.closest('.field').classList.remove('field--error');
    });
  }

  focusFirstError() {
    const firstError = this.form.querySelector('.field--error input, .field--error textarea, .field--error select');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  showFormError(message) {
    // Create or update a general form error message
    let errorContainer = this.form.querySelector('.contact-form-general-error');
    
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'contact-form-general-error';
      errorContainer.setAttribute('role', 'alert');
      this.form.insertBefore(errorContainer, this.form.firstChild);
    }
    
    errorContainer.innerHTML = `
      <div class="error-icon">${this.getIconSVG('alert-circle')}</div>
      <div class="error-message">${message}</div>
    `;
    
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  handleSelectChange(e) {
    const select = e.target;
    const label = select.nextElementSibling;
    
    if (select.value && label) {
      label.style.transform = 'translateY(-2.5rem) scale(0.85)';
      label.style.color = '#007bff';
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
  }

  setLoadingState(loading) {
    if (!this.submitBtn) return;
    
    if (loading) {
      this.submitBtn.disabled = true;
      if (this.buttonText) this.buttonText.style.opacity = '0';
      if (this.buttonSpinner) this.buttonSpinner.classList.remove('hidden');
      this.submitBtn.setAttribute('aria-busy', 'true');
    } else {
      this.submitBtn.disabled = false;
      if (this.buttonText) this.buttonText.style.opacity = '1';
      if (this.buttonSpinner) this.buttonSpinner.classList.add('hidden');
      this.submitBtn.removeAttribute('aria-busy');
    }
  }

  trackFormSubmission() {
    // Track successful form submission attempt
    if (window.AINavigation) {
      const formData = new FormData(this.form);
      const inquiryType = formData.get('contact[inquiry_type]') || 'general';
      
      window.AINavigation.trackEvent('contact_form_submitted', {
        section: 'contact_form',
        inquiry_type: inquiryType,
        timestamp: Date.now()
      });
    }
    
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'contact_form_submit', {
        event_category: 'engagement',
        event_label: 'contact_form'
      });
    }
    
    // Facebook Pixel tracking
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Contact');
    }
  }

  handleResize() {
    // Adjust layout on resize
    const decorations = this.section.querySelector('.contact-decorations');
    if (decorations && window.innerWidth < 768) {
      decorations.style.display = 'none';
    } else if (decorations) {
      decorations.style.display = '';
    }
  }

  getIconSVG(iconName) {
    // Simple icon SVG generator
    const icons = {
      'alert-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      'check-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22,4 12,14.01 9,11.01"></polyline></svg>'
    };
    
    return icons[iconName] || '';
  }

  destroy() {
    // Cleanup event listeners
    if (this.form) {
      this.form.removeEventListener('submit', this.handleSubmit);
    }
    
    window.removeEventListener('resize', this.handleResize);
    
    console.log('Contact form destroyed');
  }
}

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  const contactSections = document.querySelectorAll('.contact-section');
  
  contactSections.forEach(section => {
    new ContactForm(section);
  });
});

// Handle section reloads in theme editor
document.addEventListener('shopify:section:load', (e) => {
  if (e.target.classList.contains('contact-section')) {
    new ContactForm(e.target);
  }
});

// Cleanup on section unload
document.addEventListener('shopify:section:unload', (e) => {
  if (e.target.classList.contains('contact-section')) {
    const instance = e.target.contactFormInstance;
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
  }
});

// Export for external use
window.ContactForm = ContactForm; 