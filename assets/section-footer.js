/**
 * Footer JavaScript optimisé selon shopirule.mdc
 * Gestion du formulaire newsletter avec accessibilité complète
 */

class FooterManager {
  constructor() {
    this.init();
  }

  init() {
    this.initNewsletterForm();
    this.initAccessibilityFeatures();
    this.initMobileOptimizations();
  }

  /**
   * Initialise le formulaire newsletter avec validation et accessibilité
   */
  initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form__form');
    if (!newsletterForm) return;

    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const submitButton = newsletterForm.querySelector('.newsletter-form__submit');
    const errorElement = newsletterForm.querySelector('.newsletter-form__error');
    const successElement = newsletterForm.querySelector('.newsletter-form__success');

    // Validation en temps réel
    emailInput?.addEventListener('input', (e) => {
      this.validateEmail(e.target, errorElement);
    });

    // Soumission du formulaire
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!this.validateEmail(emailInput, errorElement)) {
        // Focus sur le champ en erreur pour l'accessibilité
        emailInput.focus();
        return;
      }

      await this.submitNewsletterForm(newsletterForm, emailInput, submitButton, errorElement, successElement);
    });

    // Gestion des touches pour le bouton
    submitButton?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        newsletterForm.dispatchEvent(new Event('submit'));
      }
    });
  }

  /**
   * Valide l'adresse email avec retour accessible
   */
  validateEmail(input, errorElement) {
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      this.showError(errorElement, 'Veuillez saisir votre adresse email');
      input.setAttribute('aria-invalid', 'true');
      return false;
    }
    
    if (!emailRegex.test(email)) {
      this.showError(errorElement, 'Veuillez saisir une adresse email valide');
      input.setAttribute('aria-invalid', 'true');
      return false;
    }

    this.clearError(errorElement);
    input.setAttribute('aria-invalid', 'false');
    return true;
  }

  /**
   * Soumet le formulaire newsletter avec gestion d'erreur
   */
  async submitNewsletterForm(form, input, button, errorElement, successElement) {
    // État de chargement
    button.disabled = true;
    button.classList.add('loading');
    button.setAttribute('aria-label', 'Inscription en cours...');

    try {
      const formData = new FormData(form);
      
      const response = await fetch(form.action || '/contact', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        this.showSuccess(successElement, 'Inscription réussie ! Merci de vous être inscrit(e) à notre newsletter.');
        form.reset();
        
        // Analytics si disponible
        if (typeof gtag !== 'undefined') {
          gtag('event', 'newsletter_signup', {
            'event_category': 'engagement',
            'event_label': 'footer'
          });
        }
      } else {
        throw new Error('Erreur réseau');
      }
    } catch (error) {
      console.error('Erreur inscription newsletter:', error);
      this.showError(errorElement, 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      // Rétablir l'état du bouton
      button.disabled = false;
      button.classList.remove('loading');
      button.setAttribute('aria-label', 'S\'inscrire à la newsletter');
    }
  }

  /**
   * Affiche un message d'erreur accessible
   */
  showError(errorElement, message) {
    if (!errorElement) return;
    
    errorElement.textContent = message;
    errorElement.classList.add('visible');
    
    // Annonce pour les lecteurs d'écran
    this.announceToScreenReader(message, 'assertive');
  }

  /**
   * Efface le message d'erreur
   */
  clearError(errorElement) {
    if (!errorElement) return;
    
    errorElement.textContent = '';
    errorElement.classList.remove('visible');
  }

  /**
   * Affiche un message de succès accessible
   */
  showSuccess(successElement, message) {
    if (!successElement) return;
    
    successElement.textContent = message;
    successElement.classList.add('visible');
    
    // Annonce pour les lecteurs d'écran
    this.announceToScreenReader(message, 'polite');
    
    // Masquer après 5 secondes
    setTimeout(() => {
      successElement.classList.remove('visible');
    }, 5000);
  }

  /**
   * Annonce un message aux lecteurs d'écran
   */
  announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Nettoyer après annonce
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Initialise les fonctionnalités d'accessibilité du footer
   */
  initAccessibilityFeatures() {
    // Amélioration des liens externes
    const externalLinks = document.querySelectorAll('.footer a[href^="http"]:not([href*="' + location.hostname + '"])');
    externalLinks.forEach(link => {
      if (!link.getAttribute('aria-label')?.includes('nouvelle fenêtre')) {
        const currentLabel = link.getAttribute('aria-label') || link.textContent;
        link.setAttribute('aria-label', `${currentLabel} (s'ouvre dans une nouvelle fenêtre)`);
      }
    });

    // Gestion des liens téléphone et email
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
      link.setAttribute('aria-label', `Appeler ${link.textContent}`);
    });

    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
      link.setAttribute('aria-label', `Envoyer un email à ${link.textContent}`);
    });
  }

  /**
   * Optimisations spécifiques aux appareils mobiles
   */
  initMobileOptimizations() {
    // Amélioration tactile pour les petits éléments
    const smallElements = document.querySelectorAll('.footer .social-media__link, .footer .newsletter-form__submit');
    smallElements.forEach(element => {
      if (element.offsetWidth < 44 || element.offsetHeight < 44) {
        element.style.minWidth = '44px';
        element.style.minHeight = '44px';
      }
    });

    // Gestion des survols tactiles
    if ('ontouchstart' in window) {
      const hoverElements = document.querySelectorAll('.footer a, .footer button');
      hoverElements.forEach(element => {
        element.addEventListener('touchstart', function() {
          this.classList.add('touch-hover');
        });
        
        element.addEventListener('touchend', function() {
          setTimeout(() => {
            this.classList.remove('touch-hover');
          }, 150);
        });
      });
    }
  }
}

// Initialisation lorsque le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new FooterManager());
} else {
  new FooterManager();
}

// Export pour utilisation dans d'autres scripts
window.FooterManager = FooterManager; 