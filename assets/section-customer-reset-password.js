/**
 * Customer Reset Password JavaScript - Bubbly Design
 * Handles password visibility, validation, animations, and accessibility
 */

class CustomerResetPassword {
  constructor() {
    this.form = document.querySelector('form[action*="reset_customer_password"]');
    this.passwordField = document.getElementById('CustomerPassword');
    this.confirmPasswordField = document.getElementById('CustomerPasswordConfirmation');
    this.passwordToggles = document.querySelectorAll('.password-toggle');
    this.submitButton = document.querySelector('.btn-primary');
    this.bubbles = document.querySelectorAll('.bubble');
    
    this.validationRules = {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    };
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.initializeBubbleAnimations();
    this.setupAccessibility();
    this.setupFormValidation();
    this.trackAnalytics();
  }
  
  setupEventListeners() {
    // Password toggle functionality
    this.passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', this.handlePasswordToggle.bind(this));
    });
    
    // Form submission
    if (this.form) {
      this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    }
    
    // Real-time validation
    if (this.passwordField) {
      this.passwordField.addEventListener('input', this.validatePassword.bind(this));
      this.passwordField.addEventListener('blur', this.validatePassword.bind(this));
    }
    
    if (this.confirmPasswordField) {
      this.confirmPasswordField.addEventListener('input', this.validatePasswordConfirmation.bind(this));
      this.confirmPasswordField.addEventListener('blur', this.validatePasswordConfirmation.bind(this));
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    
    // Bubble interactions
    this.bubbles.forEach(bubble => {
      bubble.addEventListener('mouseenter', this.handleBubbleHover.bind(this));
    });
  }
  
  handlePasswordToggle(event) {
    const button = event.currentTarget;
    const targetId = button.getAttribute('data-password-toggle');
    const targetInput = document.getElementById(targetId);
    
    if (!targetInput) return;
    
    const isPressed = button.getAttribute('aria-pressed') === 'true';
    const newPressed = !isPressed;
    
    // Toggle input type
    targetInput.type = newPressed ? 'text' : 'password';
    
    // Update button state
    button.setAttribute('aria-pressed', newPressed);
    
    // Update aria-label
    const showLabel = button.getAttribute('aria-label').includes('Show') ? 
      button.getAttribute('aria-label').replace('Show', 'Hide') :
      button.getAttribute('aria-label').replace('Hide', 'Show');
    button.setAttribute('aria-label', showLabel);
    
    // Focus back to input
    targetInput.focus();
    
    // Announce to screen readers
    this.announceToScreenReader(
      newPressed ? 'Password is now visible' : 'Password is now hidden'
    );
  }
  
  validatePassword() {
    if (!this.passwordField) return;
    
    const password = this.passwordField.value;
    const errors = [];
    
    // Check minimum length
    if (password.length < this.validationRules.minLength) {
      errors.push(`Password must be at least ${this.validationRules.minLength} characters long`);
    }
    
    // Check uppercase
    if (this.validationRules.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    // Check lowercase
    if (this.validationRules.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    // Check numbers
    if (this.validationRules.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    // Check special characters
    if (this.validationRules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Update field validation state
    this.updateFieldValidation(this.passwordField, errors.length === 0);
    
    // Update help text
    const helpText = document.getElementById('password-requirements');
    if (helpText) {
      if (errors.length > 0) {
        helpText.textContent = errors[0];
        helpText.style.color = '#e74c3c';
      } else {
        helpText.textContent = 'Password meets all requirements';
        helpText.style.color = '#27ae60';
      }
    }
    
    return errors.length === 0;
  }
  
  validatePasswordConfirmation() {
    if (!this.confirmPasswordField || !this.passwordField) return;
    
    const password = this.passwordField.value;
    const confirmation = this.confirmPasswordField.value;
    const isValid = password === confirmation && confirmation.length > 0;
    
    this.updateFieldValidation(this.confirmPasswordField, isValid);
    
    return isValid;
  }
  
  updateFieldValidation(field, isValid) {
    if (isValid) {
      field.classList.remove('invalid');
      field.classList.add('valid');
      field.setAttribute('aria-invalid', 'false');
    } else {
      field.classList.remove('valid');
      field.classList.add('invalid');
      field.setAttribute('aria-invalid', 'true');
    }
  }
  
  setupFormValidation() {
    if (!this.form) return;
    
    // Add novalidate to prevent browser validation
    this.form.setAttribute('novalidate', '');
    
    // Setup custom validation messages
    const inputs = this.form.querySelectorAll('input[required]');
    inputs.forEach(input => {
      input.addEventListener('invalid', (e) => {
        e.preventDefault();
        this.showCustomValidationMessage(input);
      });
    });
  }
  
  showCustomValidationMessage(input) {
    const customMessages = {
      'CustomerPassword': 'Please enter a valid password',
      'CustomerPasswordConfirmation': 'Please confirm your password'
    };
    
    const message = customMessages[input.id] || 'Please fill out this field';
    
    // Create or update error message
    let errorElement = input.parentNode.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Remove error on input
    const removeError = () => {
      if (errorElement) {
        errorElement.style.display = 'none';
      }
      input.removeEventListener('input', removeError);
    };
    
    input.addEventListener('input', removeError);
  }
  
  handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate all fields
    const isPasswordValid = this.validatePassword();
    const isConfirmationValid = this.validatePasswordConfirmation();
    
    if (!isPasswordValid || !isConfirmationValid) {
      this.announceToScreenReader('Please correct the errors in the form');
      return false;
    }
    
    // Show loading state
    this.setLoadingState(true);
    
    // Submit form
    setTimeout(() => {
      this.form.submit();
    }, 100);
  }
  
  setLoadingState(loading) {
    if (!this.submitButton) return;
    
    if (loading) {
      this.submitButton.classList.add('loading');
      this.submitButton.disabled = true;
      this.submitButton.setAttribute('aria-busy', 'true');
    } else {
      this.submitButton.classList.remove('loading');
      this.submitButton.disabled = false;
      this.submitButton.setAttribute('aria-busy', 'false');
    }
  }
  
  initializeBubbleAnimations() {
    // Enhanced bubble interactions
    this.bubbles.forEach((bubble, index) => {
      // Add unique animation delays
      const delay = Math.random() * 20;
      bubble.style.animationDelay = `-${delay}s`;
      
      // Add hover effects
      bubble.addEventListener('mouseenter', () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          bubble.style.animationPlayState = 'paused';
          bubble.style.transform += ' scale(1.2)';
        }
      });
      
      bubble.addEventListener('mouseleave', () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          bubble.style.animationPlayState = 'running';
          bubble.style.transform = bubble.style.transform.replace(' scale(1.2)', '');
        }
      });
    });
    
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.bubbles.forEach(bubble => {
        bubble.style.animation = 'none';
      });
    }
  }
  
  handleBubbleHover(event) {
    const bubble = event.currentTarget;
    
    // Add ripple effect
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const ripple = document.createElement('div');
      ripple.className = 'bubble-ripple';
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255, 255, 255, 0.3)';
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple 0.6s linear';
      
      bubble.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  }
  
  setupAccessibility() {
    // Ensure proper focus management
    const focusableElements = this.form?.querySelectorAll(
      'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements && focusableElements.length > 0) {
      // Set initial focus
      focusableElements[0].focus();
    }
    
    // Add skip link functionality
    this.addSkipLinks();
    
    // Setup screen reader announcements
    this.setupScreenReaderSupport();
  }
  
  addSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link sr-only';
    skipLink.style.position = 'absolute';
    skipLink.style.top = '-40px';
    skipLink.style.left = '6px';
    skipLink.style.background = 'white';
    skipLink.style.color = 'black';
    skipLink.style.padding = '8px';
    skipLink.style.textDecoration = 'none';
    skipLink.style.zIndex = '1000';
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
  
  setupScreenReaderSupport() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
    
    this.liveRegion = liveRegion;
  }
  
  announceToScreenReader(message) {
    if (!this.liveRegion) return;
    
    this.liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      this.liveRegion.textContent = '';
    }, 1000);
  }
  
  handleKeyboardNavigation(event) {
    // Handle Escape key
    if (event.key === 'Escape') {
      // Clear any error messages
      const errors = document.querySelectorAll('.field-error');
      errors.forEach(error => {
        error.style.display = 'none';
      });
      
      // Focus first input
      if (this.passwordField) {
        this.passwordField.focus();
      }
    }
    
    // Handle Enter key on password toggles
    if (event.key === 'Enter' && event.target.classList.contains('password-toggle')) {
      event.preventDefault();
      event.target.click();
    }
  }
  
  trackAnalytics() {
    // Track page view
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: 'Reset Password',
        page_location: window.location.href
      });
    }
    
    // Track form interactions
    if (this.form) {
      this.form.addEventListener('submit', () => {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submit', {
            form_name: 'reset_password'
          });
        }
      });
    }
    
    // Track password toggle usage
    this.passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'password_toggle', {
            action: 'click'
          });
        }
      });
    });
  }
}

// CSS for ripple effect
const rippleCSS = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .bubble-ripple {
    width: 20px;
    height: 20px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
  }
`;

// Add ripple CSS to document
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CustomerResetPassword();
  });
} else {
  new CustomerResetPassword();
}

// Export for potential external use
window.CustomerResetPassword = CustomerResetPassword; 