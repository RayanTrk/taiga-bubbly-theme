/**
 * Customer Account Dashboard Manager
 * Gestion complète du dashboard client avec design Bubbly
 * Fonctionnalités : onglets, modals, validation, AI Navigation
 */

class CustomerAccountManager {
  constructor() {
    this.currentTab = 'overview';
    this.modal = null;
    this.addressModal = null;
    this.editingAddressId = null;
    this.orders = [];
    this.addresses = [];
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupTabs();
    this.setupModals();
    this.loadData();
    this.setupAnimations();
    this.integrateAINavigation();
    this.enhanceAccessibility();
    
    console.log('🎯 CustomerAccountManager initialized with Bubbly design');
  }

  bindEvents() {
    // Navigation par onglets
    document.querySelectorAll('.account-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e));
      tab.addEventListener('keydown', (e) => this.handleTabKeydown(e));
    });

    // Boutons d'action
    document.addEventListener('click', (e) => {
      if (e.target.matches('.edit-address-btn')) {
        this.openAddressModal(e.target.dataset.addressId);
      }
      
      if (e.target.matches('.delete-address-btn')) {
        this.deleteAddress(e.target.dataset.addressId);
      }
      
      if (e.target.matches('.add-address-btn')) {
        this.openAddressModal();
      }
      
      if (e.target.matches('.modal-close')) {
        this.closeModal();
      }
      
      if (e.target.matches('.save-address-btn')) {
        this.saveAddress();
      }
      
      if (e.target.matches('.save-profile-btn')) {
        this.saveProfile();
      }
    });

    // Fermeture modal sur fond
    document.addEventListener('click', (e) => {
      if (e.target.matches('.account-modal')) {
        this.closeModal();
      }
    });

    // Navigation clavier pour modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal) {
        this.closeModal();
      }
    });

    // Validation en temps réel
    document.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.account-tab');
    const panels = document.querySelectorAll('.account-panel');
    
    // Activer le premier onglet par défaut
    if (tabs.length > 0) {
      tabs[0].classList.add('active');
      panels[0].classList.add('active');
    }
  }

  switchTab(e) {
    e.preventDefault();
    const targetTab = e.target.dataset.tab;
    
    if (targetTab === this.currentTab) return;
    
    // Animation de sortie
    const currentPanel = document.querySelector('.account-panel.active');
    if (currentPanel) {
      currentPanel.style.opacity = '0';
      currentPanel.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        currentPanel.classList.remove('active');
        currentPanel.style.opacity = '';
        currentPanel.style.transform = '';
      }, 150);
    }

    // Mettre à jour les onglets
    document.querySelectorAll('.account-tab').forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });
    
    e.target.classList.add('active');
    e.target.setAttribute('aria-selected', 'true');

    // Animation d'entrée
    setTimeout(() => {
      const newPanel = document.querySelector(`[data-panel="${targetTab}"]`);
      if (newPanel) {
        newPanel.classList.add('active');
        newPanel.style.opacity = '0';
        newPanel.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
          newPanel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          newPanel.style.opacity = '1';
          newPanel.style.transform = 'translateY(0)';
          
          setTimeout(() => {
            newPanel.style.transition = '';
            newPanel.style.opacity = '';
            newPanel.style.transform = '';
          }, 300);
        });
      }
    }, 150);

    this.currentTab = targetTab;
    
    // Tracking AI Navigation
    this.trackTabSwitch(targetTab);
    
    // Annonce pour les lecteurs d'écran
    this.announceToScreenReader(`Onglet ${targetTab} activé`);
  }

  handleTabKeydown(e) {
    const tabs = Array.from(document.querySelectorAll('.account-tab'));
    const currentIndex = tabs.indexOf(e.target);
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        tabs[prevIndex].focus();
        tabs[prevIndex].click();
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
        break;
        
      case 'Home':
        e.preventDefault();
        tabs[0].focus();
        tabs[0].click();
        break;
        
      case 'End':
        e.preventDefault();
        tabs[tabs.length - 1].focus();
        tabs[tabs.length - 1].click();
        break;
    }
  }

  setupModals() {
    // Modal pour les adresses
    this.addressModal = document.querySelector('#address-modal');
    
    if (this.addressModal) {
      this.setupFocusTrap(this.addressModal);
    }
  }

  openAddressModal(addressId = null) {
    this.editingAddressId = addressId;
    
    if (!this.addressModal) {
      this.createAddressModal();
    }
    
    // Pré-remplir si édition
    if (addressId) {
      this.populateAddressForm(addressId);
    } else {
      this.clearAddressForm();
    }
    
    // Afficher modal avec animation
    this.addressModal.style.display = 'flex';
    requestAnimationFrame(() => {
      this.addressModal.classList.add('active');
    });
    
    // Focus sur le premier champ
    const firstInput = this.addressModal.querySelector('.form-input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
    
    // Tracking
    this.trackModalOpen('address', addressId ? 'edit' : 'add');
  }

  createAddressModal() {
    const modalHTML = `
      <div id="address-modal" class="account-modal">
        <div class="modal-content">
          <button class="modal-close" aria-label="Fermer">×</button>
          <h3 id="address-modal-title">Ajouter une adresse</h3>
          
          <form class="account-form" id="address-form">
            <div class="form-group">
              <label class="form-label" for="address-first-name">Prénom *</label>
              <input type="text" id="address-first-name" class="form-input" required>
              <span class="form-error" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="address-last-name">Nom *</label>
              <input type="text" id="address-last-name" class="form-input" required>
              <span class="form-error" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="address-address1">Adresse *</label>
              <input type="text" id="address-address1" class="form-input" required>
              <span class="form-error" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="address-address2">Complément d'adresse</label>
              <input type="text" id="address-address2" class="form-input">
            </div>
            
            <div class="form-group">
              <label class="form-label" for="address-city">Ville *</label>
              <input type="text" id="address-city" class="form-input" required>
              <span class="form-error" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="address-zip">Code postal *</label>
              <input type="text" id="address-zip" class="form-input" required>
              <span class="form-error" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="address-country">Pays *</label>
              <select id="address-country" class="form-input" required>
                <option value="">Sélectionner un pays</option>
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="CH">Suisse</option>
                <option value="CA">Canada</option>
              </select>
              <span class="form-error" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="address-phone">Téléphone</label>
              <input type="tel" id="address-phone" class="form-input">
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="address-default">
                <span class="checkmark"></span>
                Définir comme adresse par défaut
              </label>
            </div>
            
            <div class="form-actions">
              <button type="button" class="account-btn account-btn-secondary modal-close">
                Annuler
              </button>
              <button type="submit" class="account-btn account-btn-primary save-address-btn">
                <span class="btn-text">Sauvegarder</span>
                <span class="btn-loading" style="display: none;">
                  <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.addressModal = document.querySelector('#address-modal');
    this.setupFocusTrap(this.addressModal);
  }

  populateAddressForm(addressId) {
    const address = this.addresses.find(addr => addr.id === addressId);
    if (!address) return;
    
    document.querySelector('#address-modal-title').textContent = 'Modifier l\'adresse';
    document.querySelector('#address-first-name').value = address.first_name || '';
    document.querySelector('#address-last-name').value = address.last_name || '';
    document.querySelector('#address-address1').value = address.address1 || '';
    document.querySelector('#address-address2').value = address.address2 || '';
    document.querySelector('#address-city').value = address.city || '';
    document.querySelector('#address-zip').value = address.zip || '';
    document.querySelector('#address-country').value = address.country_code || '';
    document.querySelector('#address-phone').value = address.phone || '';
    document.querySelector('#address-default').checked = address.default || false;
  }

  clearAddressForm() {
    document.querySelector('#address-modal-title').textContent = 'Ajouter une adresse';
    document.querySelector('#address-form').reset();
  }

  saveAddress() {
    const form = document.querySelector('#address-form');
    const formData = new FormData(form);
    const addressData = Object.fromEntries(formData);
    
    // Validation
    if (!this.validateAddressForm()) {
      return;
    }
    
    // État de chargement
    this.setButtonLoading('.save-address-btn', true);
    
    // Simulation de sauvegarde
    setTimeout(() => {
      this.setButtonLoading('.save-address-btn', false);
      
      if (this.editingAddressId) {
        // Mise à jour
        const index = this.addresses.findIndex(addr => addr.id === this.editingAddressId);
        if (index !== -1) {
          this.addresses[index] = { ...this.addresses[index], ...addressData };
        }
        this.announceToScreenReader('Adresse mise à jour avec succès');
      } else {
        // Ajout
        const newAddress = {
          id: Date.now().toString(),
          ...addressData
        };
        this.addresses.push(newAddress);
        this.announceToScreenReader('Adresse ajoutée avec succès');
      }
      
      this.renderAddresses();
      this.closeModal();
      this.trackAddressSave(this.editingAddressId ? 'edit' : 'add');
    }, 1000);
  }

  validateAddressForm() {
    const requiredFields = [
      'address-first-name',
      'address-last-name', 
      'address-address1',
      'address-city',
      'address-zip',
      'address-country'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
      const field = document.querySelector(`#${fieldId}`);
      if (!field.value.trim()) {
        this.showFieldError(field, 'Ce champ est obligatoire');
        isValid = false;
      }
    });
    
    // Validation du code postal
    const zipField = document.querySelector('#address-zip');
    if (zipField.value && !/^\d{5}$/.test(zipField.value)) {
      this.showFieldError(zipField, 'Code postal invalide (5 chiffres requis)');
      isValid = false;
    }
    
    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
      this.showFieldError(field, 'Ce champ est obligatoire');
      return false;
    }
    
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.showFieldError(field, 'Email invalide');
      return false;
    }
    
    if (field.id === 'address-zip' && value && !/^\d{5}$/.test(value)) {
      this.showFieldError(field, 'Code postal invalide');
      return false;
    }
    
    this.clearFieldError(field);
    return true;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    const errorElement = field.parentElement.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  closeModal() {
    if (this.addressModal) {
      this.addressModal.classList.remove('active');
      setTimeout(() => {
        this.addressModal.style.display = 'none';
      }, 300);
    }
    
    this.editingAddressId = null;
  }

  setupFocusTrap(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }

  loadData() {
    // Simulation de chargement des données
    this.orders = [
      {
        id: '#1001',
        date: '2024-06-15',
        status: 'fulfilled',
        total: '89.99 €',
        items: 3
      },
      {
        id: '#1002',
        date: '2024-06-10',
        status: 'pending',
        total: '156.50 €',
        items: 2
      }
    ];
    
    this.addresses = [
      {
        id: '1',
        first_name: 'Jean',
        last_name: 'Dupont',
        address1: '123 Rue de la Paix',
        city: 'Paris',
        zip: '75001',
        country_code: 'FR',
        default: true
      }
    ];
    
    this.renderData();
  }

  renderData() {
    this.renderOrders();
    this.renderAddresses();
    this.updateStats();
  }

  renderOrders() {
    const container = document.querySelector('.orders-container');
    if (!container) return;
    
    if (this.orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Aucune commande</h3>
          <p>Vous n'avez pas encore passé de commande.</p>
          <a href="/collections/all" class="account-btn account-btn-primary">
            Découvrir nos produits
          </a>
        </div>
      `;
      return;
    }
    
    const ordersHTML = this.orders.map(order => `
      <tr>
        <td>${order.id}</td>
        <td>${new Date(order.date).toLocaleDateString('fr-FR')}</td>
        <td>
          <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
        </td>
        <td>${order.total}</td>
        <td>${order.items} article${order.items > 1 ? 's' : ''}</td>
        <td>
          <button class="account-btn account-btn-secondary" onclick="viewOrder('${order.id}')">
            Voir
          </button>
        </td>
      </tr>
    `).join('');
    
    container.innerHTML = `
      <table class="orders-table">
        <thead>
          <tr>
            <th>Commande</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Total</th>
            <th>Articles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${ordersHTML}
        </tbody>
      </table>
    `;
  }

  renderAddresses() {
    const container = document.querySelector('.addresses-container');
    if (!container) return;
    
    if (this.addresses.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Aucune adresse</h3>
          <p>Ajoutez une adresse pour faciliter vos commandes.</p>
          <button class="account-btn account-btn-primary add-address-btn">
            Ajouter une adresse
          </button>
        </div>
      `;
      return;
    }
    
    const addressesHTML = this.addresses.map(address => `
      <div class="address-card ${address.default ? 'default' : ''}">
        <h4>${address.first_name} ${address.last_name}</h4>
        <p>
          ${address.address1}<br>
          ${address.address2 ? address.address2 + '<br>' : ''}
          ${address.city}, ${address.zip}<br>
          ${address.country_code}
        </p>
        ${address.phone ? `<p>Tél: ${address.phone}</p>` : ''}
        
        <div class="address-actions">
          <button class="account-btn account-btn-secondary edit-address-btn" 
                  data-address-id="${address.id}">
            Modifier
          </button>
          ${!address.default ? `
            <button class="account-btn account-btn-warning delete-address-btn" 
                    data-address-id="${address.id}">
              Supprimer
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
    
    container.innerHTML = `
      <div class="addresses-header">
        <button class="account-btn account-btn-primary add-address-btn">
          Ajouter une adresse
        </button>
      </div>
      <div class="addresses-grid">
        ${addressesHTML}
      </div>
    `;
  }

  updateStats() {
    const stats = {
      totalOrders: this.orders.length,
      totalSpent: this.orders.reduce((sum, order) => {
        return sum + parseFloat(order.total.replace('€', '').replace(',', '.'));
      }, 0),
      addressCount: this.addresses.length,
      wishlistCount: 0 // À implémenter
    };
    
    const statElements = {
      'total-orders': stats.totalOrders,
      'total-spent': `${stats.totalSpent.toFixed(2)} €`,
      'address-count': stats.addressCount,
      'wishlist-count': stats.wishlistCount
    };
    
    Object.entries(statElements).forEach(([id, value]) => {
      const element = document.querySelector(`[data-stat="${id}"]`);
      if (element) {
        element.textContent = value;
      }
    });
  }

  getStatusText(status) {
    const statusMap = {
      'fulfilled': 'Expédiée',
      'pending': 'En attente',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status;
  }

  setButtonLoading(selector, loading) {
    const button = document.querySelector(selector);
    if (!button) return;
    
    const text = button.querySelector('.btn-text');
    const loader = button.querySelector('.btn-loading');
    
    if (loading) {
      button.disabled = true;
      text.style.display = 'none';
      loader.style.display = 'inline-flex';
    } else {
      button.disabled = false;
      text.style.display = 'inline';
      loader.style.display = 'none';
    }
  }

  setupAnimations() {
    // Animation des cartes au survol
    document.querySelectorAll('.stat-card, .address-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
    
    // Animation des bulles interactives
    this.createInteractiveBubbles();
  }

  createInteractiveBubbles() {
    const dashboard = document.querySelector('.account-dashboard');
    if (!dashboard) return;
    
    for (let i = 0; i < 5; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'interactive-bubble';
      bubble.style.cssText = `
        position: absolute;
        width: ${20 + Math.random() * 40}px;
        height: ${20 + Math.random() * 40}px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(240, 147, 251, 0.1));
        border-radius: 50%;
        pointer-events: none;
        animation: floatBubble ${5 + Math.random() * 10}s ease-in-out infinite;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        z-index: 0;
      `;
      
      dashboard.appendChild(bubble);
    }
  }

  integrateAINavigation() {
    // Integration avec AI Navigation pour l'apprentissage des patterns
    if (typeof window.AINavigation !== 'undefined') {
      this.aiNavigation = window.AINavigation;
      
      // Tracking des interactions
      document.addEventListener('click', (e) => {
        if (e.target.matches('.account-tab, .account-btn, .address-card')) {
          this.aiNavigation.trackInteraction({
            type: 'account_interaction',
            element: e.target.className,
            tab: this.currentTab,
            timestamp: Date.now()
          });
        }
      });
    }
  }

  trackTabSwitch(tab) {
    if (this.aiNavigation) {
      this.aiNavigation.trackInteraction({
        type: 'tab_switch',
        tab: tab,
        timestamp: Date.now()
      });
    }
    
    // Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'tab_switch', {
        'event_category': 'Account Dashboard',
        'event_label': tab
      });
    }
  }

  trackModalOpen(type, action) {
    if (this.aiNavigation) {
      this.aiNavigation.trackInteraction({
        type: 'modal_open',
        modal_type: type,
        action: action,
        timestamp: Date.now()
      });
    }
  }

  trackAddressSave(action) {
    if (this.aiNavigation) {
      this.aiNavigation.trackInteraction({
        type: 'address_save',
        action: action,
        timestamp: Date.now()
      });
    }
    
    // Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'address_save', {
        'event_category': 'Account Management',
        'event_label': action
      });
    }
  }

  enhanceAccessibility() {
    // ARIA live region pour les annonces
    if (!document.querySelector('#account-announcements')) {
      const announcements = document.createElement('div');
      announcements.id = 'account-announcements';
      announcements.setAttribute('aria-live', 'polite');
      announcements.setAttribute('aria-atomic', 'true');
      announcements.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(announcements);
    }
    
    // Amélioration des étiquettes
    document.querySelectorAll('.account-tab').forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
      tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');
    });
    
    document.querySelectorAll('.account-panel').forEach((panel, index) => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-hidden', panel.classList.contains('active') ? 'false' : 'true');
    });
  }

  announceToScreenReader(message) {
    const announcements = document.querySelector('#account-announcements');
    if (announcements) {
      announcements.textContent = message;
    }
  }

  deleteAddress(addressId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      this.addresses = this.addresses.filter(addr => addr.id !== addressId);
      this.renderAddresses();
      this.updateStats();
      this.announceToScreenReader('Adresse supprimée avec succès');
    }
  }

  destroy() {
    // Nettoyage des event listeners et des éléments créés
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('keydown', this.handleKeydown);
    
    // Suppression des bulles interactives
    document.querySelectorAll('.interactive-bubble').forEach(bubble => {
      bubble.remove();
    });
    
    console.log('CustomerAccountManager destroyed');
  }
}

// CSS pour les animations
const bubbleStyles = `
  @keyframes floatBubble {
    0%, 100% { 
      transform: translateY(0px) rotate(0deg);
      opacity: 0.1;
    }
    25% { 
      transform: translateY(-20px) rotate(90deg);
      opacity: 0.2;
    }
    50% { 
      transform: translateY(-40px) rotate(180deg);
      opacity: 0.1;
    }
    75% { 
      transform: translateY(-20px) rotate(270deg);
      opacity: 0.2;
    }
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Injection des styles
if (!document.querySelector('#account-bubble-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'account-bubble-styles';
  styleSheet.textContent = bubbleStyles;
  document.head.appendChild(styleSheet);
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.account-dashboard')) {
    window.customerAccountManager = new CustomerAccountManager();
  }
});

// Export pour utilisation externe
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomerAccountManager;
} 