/**
 * Customer Register Page - Bubbly Theme JavaScript
 * Handles form validation, password requirements, and user interactions
 */

class CustomerRegisterManager {
  constructor() {
    this.form = document.querySelector('.customer-register-form');
    this.passwordInput = document.querySelector('#customer_password');
    this.confirmPasswordInput = document.querySelector('#customer_password_confirmation');
    this.passwordToggle = document.querySelector('.password-toggle');
    this.confirmPasswordToggle = document.querySelector('.confirm-password-toggle');
    this.requirements = document.querySelector('.password-requirements');
    this.submitButton = document.querySelector('.btn-primary');
    this.errorContainer = document.querySelector('.form-errors');
    
    this.passwordRequirements = {
      minLength: 8,
      hasUppercase: /[A-Z]/,
      hasLowercase: /[a-z]/,
      hasNumber: /\d/,
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/
    };
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.initializePasswordValidation();
    this.initializeBubbleAnimations();
    this.initializeAccessibility();
    this.trackInteractions();
  }
  
  bindEvents() {
    // Form submission
    if (this.form) {
      this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    }
    
    // Password visibility toggle
    if (this.passwordToggle) {
      this.passwordToggle.addEventListener('click', () => {
        this.togglePasswordVisibility(this.passwordInput, this.passwordToggle);
      });
    }
    
    if (this.confirmPasswordToggle) {
      this.confirmPasswordToggle.addEventListener('click', () => {
        this.togglePasswordVisibility(this.confirmPasswordInput, this.confirmPasswordToggle);
      });
    }
    
    // Real-time validation
    if (this.passwordInput) {
      this.passwordInput.addEventListener('input', this.validatePassword.bind(this));
      this.passwordInput.addEventListener('blur', this.validatePassword.bind(this));
    }
    
    if (this.confirmPasswordInput) {
      this.confirmPasswordInput.addEventListener('input', this.validatePasswordConfirmation.bind(this));
      this.confirmPasswordInput.addEventListener('blur', this.validatePasswordConfirmation.bind(this));
    }
    
    // Email validation
    const emailInput = document.querySelector('#customer_email');
    if (emailInput) {
      emailInput.addEventListener('input', this.validateEmail.bind(this));
      emailInput.addEventListener('blur', this.validateEmail.bind(this));
    }
    
    // Form inputs for general validation
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }
  
  initializePasswordValidation() {
    if (!this.passwordInput || !this.requirements) return;
    
    // Create requirements list if it doesn't exist
    if (!this.requirements.querySelector('.requirements-list')) {
      this.createPasswordRequirementsList();
    }
  }
  
  createPasswordRequirementsList() {
    const requirementsList = document.createElement('ul');
    requirementsList.className = 'requirements-list';
    
    const requirements = [
      { key: 'minLength', text: 'At least 8 characters long', icon: '●' },
      { key: 'hasUppercase', text: 'Contains uppercase letter', icon: '●' },
      { key: 'hasLowercase', text: 'Contains lowercase letter', icon: '●' },
      { key: 'hasNumber', text: 'Contains at least one number', icon: '●' },
      { key: 'hasSpecial', text: 'Contains special character', icon: '●' }
    ];
    
    requirements.forEach(req => {
      const li = document.createElement('li');
      li.className = `requirement requirement-${req.key}`;
      li.innerHTML = `
        <span class="requirement-icon">${req.icon}</span>
        <span class="requirement-text">${req.text}</span>
      `;
      requirementsList.appendChild(li);
    });
    
    this.requirements.appendChild(requirementsList);
  }
  
  validatePassword() {
    if (!this.passwordInput) return;
    
    const password = this.passwordInput.value;
    
    // Check minimum length
    const minLengthReq = this.requirements.querySelector('.requirement-minLength');
    if (minLengthReq) {
      this.updateRequirementStatus(minLengthReq, password.length >= this.passwordRequirements.minLength);
    }
    
    // Check uppercase
    const uppercaseReq = this.requirements.querySelector('.requirement-hasUppercase');
    if (uppercaseReq) {
      this.updateRequirementStatus(uppercaseReq, this.passwordRequirements.hasUppercase.test(password));
    }
    
    // Check lowercase
    const lowercaseReq = this.requirements.querySelector('.requirement-hasLowercase');
    if (lowercaseReq) {
      this.updateRequirementStatus(lowercaseReq, this.passwordRequirements.hasLowercase.test(password));
    }
    
    // Check number
    const numberReq = this.requirements.querySelector('.requirement-hasNumber');
    if (numberReq) {
      this.updateRequirementStatus(numberReq, this.passwordRequirements.hasNumber.test(password));
    }
    
    // Check special character
    const specialReq = this.requirements.querySelector('.requirement-hasSpecial');
    if (specialReq) {
      this.updateRequirementStatus(specialReq, this.passwordRequirements.hasSpecial.test(password));
    }
    
    // Validate password confirmation if it has a value
    if (this.confirmPasswordInput && this.confirmPasswordInput.value) {
      this.validatePasswordConfirmation();
    }
  }
  
  updateRequirementStatus(element, isValid) {
    if (isValid) {
      element.classList.add('valid');
      element.classList.remove('invalid');
    } else {
      element.classList.add('invalid');
      element.classList.remove('valid');
    }
  }
  
  validatePasswordConfirmation() {
    if (!this.confirmPasswordInput || !this.passwordInput) return;
    
    const password = this.passwordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;
    
    this.clearFieldError(this.confirmPasswordInput);
    
    if (confirmPassword && password !== confirmPassword) {
      this.showFieldError(this.confirmPasswordInput, 'Passwords do not match');
      return false;
    }
    
    return true;
  }
  
  validateEmail(event) {
    const emailInput = event.target;
    const email = emailInput.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    this.clearFieldError(emailInput);
    
    if (email && !emailRegex.test(email)) {
      this.showFieldError(emailInput, 'Please enter a valid email address');
      return false;
    }
    
    return true;
  }
  
  validateField(input) {
    const value = input.value.trim();
    const isRequired = input.hasAttribute('required');
    
    this.clearFieldError(input);
    
    if (isRequired && !value) {
      this.showFieldError(input, 'This field is required');
      return false;
    }
    
    return true;
  }
  
  showFieldError(input, message) {
    let errorElement = input.parentNode.querySelector('.form-error-message');
    
    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'form-error-message';
      errorElement.setAttribute('role', 'alert');
      input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
  }
  
  clearFieldError(input) {
    const errorElement = input.parentNode.querySelector('.form-error-message');
    if (errorElement) {
      errorElement.remove();
    }
    
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
  }
  
  togglePasswordVisibility(input, toggle) {
    if (!input || !toggle) return;
    
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    // Update aria-label for accessibility
    toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    
    // Animate the toggle button
    toggle.style.transform = 'scale(0.9)';
    setTimeout(() => {
      toggle.style.transform = 'scale(1)';
    }, 150);
  }
  
  async handleFormSubmit(event) {
    event.preventDefault();
    
    // Show loading state
    this.setLoadingState(true);
    
    // Validate all fields
    const isValid = this.validateAllFields();
    
    if (!isValid) {
      this.setLoadingState(false);
      this.focusFirstError();
      return;
    }
    
    // Submit the form normally for Shopify
    this.form.submit();
  }
  
  validateAllFields() {
    let isValid = true;
    
    // Validate required fields
    const requiredFields = this.form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    
    // Validate email
    const emailInput = document.querySelector('#customer_email');
    if (emailInput && !this.validateEmail({ target: emailInput })) {
      isValid = false;
    }
    
    // Validate password
    if (this.passwordInput) {
      const password = this.passwordInput.value;
      const isPasswordValid = this.isPasswordValid(password);
      
      if (!isPasswordValid) {
        this.showFieldError(this.passwordInput, 'Password does not meet requirements');
        isValid = false;
      }
    }
    
    // Validate password confirmation
    if (!this.validatePasswordConfirmation()) {
      isValid = false;
    }
    
    return isValid;
  }
  
  isPasswordValid(password) {
    return password.length >= this.passwordRequirements.minLength &&
           this.passwordRequirements.hasUppercase.test(password) &&
           this.passwordRequirements.hasLowercase.test(password) &&
           this.passwordRequirements.hasNumber.test(password) &&
           this.passwordRequirements.hasSpecial.test(password);
  }
  
  setLoadingState(isLoading) {
    if (!this.submitButton) return;
    
    if (isLoading) {
      this.submitButton.classList.add('loading');
      this.submitButton.disabled = true;
    } else {
      this.submitButton.classList.remove('loading');
      this.submitButton.disabled = false;
    }
  }
  
  focusFirstError() {
    const firstError = document.querySelector('.form-input.error, .form-input[aria-invalid="true"]');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  initializeBubbleAnimations() {
    const bubbles = document.querySelectorAll('.bubble');
    
    bubbles.forEach((bubble, index) => {
      // Add random movement
      const randomDelay = Math.random() * 2;
      const randomDuration = 4 + Math.random() * 4;
      
      bubble.style.animationDelay = `${randomDelay}s`;
      bubble.style.animationDuration = `${randomDuration}s`;
      
      // Add interactive hover effect
      bubble.addEventListener('mouseenter', () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          bubble.style.transform = 'scale(1.2)';
          bubble.style.opacity = '0.8';
        }
      });
      
      bubble.addEventListener('mouseleave', () => {
        bubble.style.transform = 'scale(1)';
        bubble.style.opacity = '0.7';
      });
    });
  }
  
  initializeAccessibility() {
    // Enhance form labels
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
      if (input.hasAttribute('required')) {
        input.setAttribute('aria-required', 'true');
      }
    });
  }
  
  trackInteractions() {
    // Track form interactions for AI Navigation
    if (window.AINavigation) {
      window.AINavigation.trackEvent('customer_register_started', {
        timestamp: Date.now(),
        page: window.location.pathname
      });
    }
    
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: 'Customer Registration',
        page_location: window.location.href
      });
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CustomerRegisterManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomerRegisterManager;
} 