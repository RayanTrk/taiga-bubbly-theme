# Documentation Complète du Thème Shopify Taiga - Style Bubbly

## Table des Matières

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration Initiale](#configuration-initiale)
4. [Personnalisation du Design](#personnalisation-du-design)
5. [Configuration des Sections](#configuration-des-sections)
6. [Fonctionnalités Avancées](#fonctionnalités-avancées)
7. [Gestion Multilingue](#gestion-multilingue)
8. [Optimisation Performance](#optimisation-performance)
9. [Accessibilité](#accessibilité)
10. [Dépannage](#dépannage)
11. [Support Développeur](#support-développeur)

---

## Introduction

Le thème Shopify Taiga style "Bubbly" est un thème e-commerce moderne conçu pour offrir une expérience utilisateur exceptionnelle avec des animations fluides, des gradients colorés et une interface accessible. Ce thème est optimisé pour les performances, l'accessibilité WCAG 2.1 AA et le support multilingue.

### Caractéristiques Principales

- ✨ **Design Bubbly** : Gradients colorés avec bulles flottantes animées
- 🚀 **Performance Optimisée** : Lazy loading, optimisation des images, cache intelligent
- ♿ **Accessibilité WCAG 2.1 AA** : Support complet screen readers et navigation clavier
- 🌍 **Support Multilingue** : 5 langues incluses + support RTL
- 📱 **Responsive Design** : Optimisé pour tous les appareils
- 🛒 **E-commerce Avancé** : Cart drawer, quick view, product recommendations

---

## Installation

### Prérequis

- Store Shopify actif
- Accès administrateur au store
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

### Installation depuis l'Admin Shopify

1. **Accéder aux Thèmes**
   - Connectez-vous à votre admin Shopify
   - Allez dans `Boutique en ligne` > `Thèmes`

2. **Installer le Thème**
   - Cliquez sur `Ajouter un thème`
   - Sélectionnez `Télécharger un fichier zip`
   - Téléchargez le fichier `taiga-bubbly-theme.zip`

3. **Prévisualiser et Publier**
   - Cliquez sur `Prévisualiser` pour tester le thème
   - Cliquez sur `Publier` quand vous êtes satisfait

### Installation Manuelle (Développeurs)

```bash
# Cloner le repository
git clone [repository-url] taiga-bubbly-theme

# Installer les dépendances
cd taiga-bubbly-theme
npm install

# Développement local
npm run dev

# Build pour production
npm run build
```

---

## Configuration Initiale

### Paramètres Globaux

Accédez à `Thèmes` > `Personnaliser` > `Paramètres du thème`

#### 1. Couleurs et Typographie

- **Couleurs Principales**
  - Couleur principale : `#667eea`
  - Couleur secondaire : `#764ba2`
  - Couleur d'accent : `#f093fb`
  - Couleur de fond : `#ffffff`

- **Typographie**
  - Police principale : 'Poppins', sans-serif
  - Police des titres : 'Poppins', sans-serif
  - Tailles configurables par section

#### 2. Logo et Branding

- **Logo** : Format recommandé 300x100px (SVG préférable)
- **Favicon** : 32x32px minimum
- **Couleurs de marque** : Configurables dans les paramètres

#### 3. Animations et Effets

- **Bulles Flottantes** : 12 bulles par défaut (configurable 0-20)
- **Vitesse d'animation** : 1x par défaut (0.5x à 2x)
- **Respect Motion Preferences** : Activé par défaut

---

## Personnalisation du Design

### Style Bubbly

Le design Bubbly comprend plusieurs éléments caractéristiques :

#### Gradients

```css
/* Gradient principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Gradient secondaire */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* Gradient tertiaire */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
```

#### Bulles Animées

- **Position** : Aléatoire sur la page
- **Taille** : Variable (50px à 200px)
- **Animation** : Mouvement vertical lent avec rotation
- **Opacité** : 0.1 à 0.3 pour subtilité

#### Bordures Arrondies

- **Formulaires** : 50px
- **Cartes produit** : 30px
- **Petits éléments** : 20px
- **Boutons** : 25px

### Responsive Design

#### Breakpoints

```css
/* Mobile First */
@media (min-width: 480px) { /* Mobile Large */ }
@media (min-width: 750px) { /* Tablet */ }
@media (min-width: 990px) { /* Desktop */ }
@media (min-width: 1200px) { /* Large Desktop */ }
```

#### Adaptations Mobile

- Navigation hamburger automatique < 990px
- Bulles réduites sur mobile (performance)
- Touch targets minimum 44x44px
- Swipe gestures pour galeries

---

## Configuration des Sections

### Header

#### Navigation Principale

1. **Menu Configuration**
   - Allez dans `Navigation` > `Menu principal`
   - Ajoutez vos liens de navigation
   - Support des méga-menus (3 niveaux max)

2. **Options d'Affichage**
   - Logo centré ou aligné à gauche
   - Recherche dans header : Activée/Désactivée
   - Icônes sociales : Configurables
   - Sélecteur de langue : Automatique si multilingue

#### Barre Promotionnelle

- **Texte** : Message promotionnel
- **Lien** : URL de destination (optionnel)
- **Couleurs** : Fond et texte personnalisables
- **Animation** : Défilement si texte long

### Sections Homepage

#### Hero Banner

```liquid
{% comment %} Configuration Hero Banner {% endcomment %}
{%- assign hero_image = section.settings.image -%}
{%- assign hero_title = section.settings.title -%}
{%- assign hero_subtitle = section.settings.subtitle -%}
{%- assign hero_button_text = section.settings.button_text -%}
{%- assign hero_button_url = section.settings.button_url -%}
```

**Paramètres disponibles :**
- Image de fond (recommandé 1920x1080px)
- Titre principal (max 60 caractères)
- Sous-titre (max 120 caractères)
- Texte du bouton CTA
- URL de destination
- Position du texte (gauche/centre/droite)
- Overlay opacity (0-100%)

#### Collection Showcase

- **Collections à afficher** : Sélection multiple
- **Layout** : Grille (2, 3, ou 4 colonnes)
- **Images** : Format carré recommandé
- **Animation** : Hover effects configurables

#### Product Grid

- **Collection source** : Collection à afficher
- **Nombre de produits** : 4, 6, 8, ou 12
- **Colonnes desktop** : 2, 3, ou 4
- **Colonnes mobile** : 1 ou 2
- **Quick view** : Activé par défaut

### Footer

#### Configuration

1. **Liens Rapides**
   - Menu footer principal
   - Menu informations légales
   - Menu service client

2. **Newsletter**
   - Intégration Shopify Email/Klaviyo
   - Message d'incitation personnalisable
   - Design intégré au style Bubbly

3. **Informations de Contact**
   - Adresse physique
   - Téléphone
   - Email
   - Horaires d'ouverture

---

## Fonctionnalités Avancées

### Cart Drawer

Le panier coulissant offre une expérience d'achat fluide :

#### Configuration

```liquid
{%- assign cart_drawer_enabled = settings.enable_cart_drawer -%}
{%- assign cart_upsells_enabled = settings.enable_cart_upsells -%}
{%- assign cart_notes_enabled = settings.enable_cart_notes -%}
```

**Fonctionnalités :**
- Ouverture automatique à l'ajout produit
- Mise à jour temps réel des quantités
- Calcul automatique des frais de port
- Recommandations produits (upsells)
- Codes de réduction
- Notes de commande

### Quick View Modal

#### Implementation

```javascript
// Initialisation Quick View
class QuickViewModal {
  constructor() {
    this.modal = document.querySelector('.quick-view-modal');
    this.bindEvents();
  }
  
  bindEvents() {
    document.addEventListener('click', this.handleQuickViewClick.bind(this));
  }
  
  async handleQuickViewClick(event) {
    if (!event.target.matches('.quick-view-trigger')) return;
    
    const productHandle = event.target.dataset.productHandle;
    const productData = await this.fetchProduct(productHandle);
    this.renderModal(productData);
  }
}
```

### Product Recommendations

#### Types de Recommandations

1. **Related Products** : Basé sur les tags et collections
2. **Recently Viewed** : Historique de navigation (localStorage)
3. **Cart Upsells** : Produits complémentaires
4. **Cross-sell** : Suggestions dans le panier

#### Configuration

```json
{
  "product_recommendations": {
    "enabled": true,
    "limit": 4,
    "algorithm": "related",
    "show_prices": true,
    "show_quick_view": true
  }
}
```

---

## Gestion Multilingue

### Langues Supportées

Le thème inclut des traductions complètes pour :

- 🇺🇸 **Anglais** (en) - Langue par défaut
- 🇫🇷 **Français** (fr)
- 🇪🇸 **Espagnol** (es)  
- 🇩🇪 **Allemand** (de)
- 🇯🇵 **Japonais** (ja)

### Support RTL

Support complet pour les langues droite-à-gauche :

```css
/* Propriétés CSS logiques */
.product-card {
  margin-inline-start: 1rem;
  padding-inline: 1rem;
  border-inline-start: 2px solid var(--color-primary);
}

/* Support RTL automatique */
[dir="rtl"] .navigation {
  text-align: right;
}
```

### Ajout de Nouvelles Langues

1. **Créer le fichier de traduction**
   ```bash
   # Exemple pour l'italien
   cp locales/en.default.json locales/it.json
   ```

2. **Traduire les chaînes**
   ```json
   {
     "general": {
       "search": {
         "search": "Cerca",
         "products": "Prodotti",
         "suggestions": "Suggerimenti"
       }
     }
   }
   ```

3. **Activer dans Shopify**
   - Admin > Paramètres > Langues
   - Ajouter la nouvelle langue
   - Publier les traductions

### Formatage des Devises

```javascript
// Configuration automatique par locale
const currencyFormatters = {
  'en': { position: 'before', symbol: '$' },
  'fr': { position: 'after', symbol: '€', space: true },
  'de': { position: 'after', symbol: '€', space: true },
  'ja': { position: 'before', symbol: '¥' }
};
```

---

## Optimisation Performance

### Métriques Cibles

- **Lighthouse Performance** : 90+ score
- **First Contentful Paint** : < 2.5s
- **Largest Contentful Paint** : < 4s
- **Cumulative Layout Shift** : < 0.25
- **First Input Delay** : < 300ms

### Techniques Implémentées

#### 1. Lazy Loading

```javascript
// Images lazy loading
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      imageObserver.unobserve(img);
    }
  });
});
```

#### 2. Code Splitting

```javascript
// Chargement asynchrone des modules
const loadQuickView = () => import('./quick-view-modal.js');
const loadCartDrawer = () => import('./cart-drawer.js');

// Chargement conditionnel
if (document.querySelector('.quick-view-trigger')) {
  loadQuickView();
}
```

#### 3. Image Optimization

```liquid
{%- comment -%} Responsive images avec srcset {%- endcomment -%}
{%- assign image_sizes = '300,600,900,1200,1500,1800' | split: ',' -%}
<img
  src="{{ image | img_url: '300x' }}"
  srcset="{%- for size in image_sizes -%}{{ image | img_url: size | append: 'x' }} {{ size }}w{%- unless forloop.last -%},{%- endunless -%}{%- endfor -%}"
  sizes="(min-width: 990px) 25vw, (min-width: 750px) 33vw, 50vw"
  alt="{{ image.alt | escape }}"
  loading="lazy"
>
```

#### 4. CSS Optimization

```css
/* Variables CSS pour performance */
:root {
  --color-primary: #667eea;
  --color-secondary: #764ba2;
  --border-radius: 30px;
  --transition-duration: 0.3s;
}

/* Éviter les reflows */
.product-card {
  will-change: transform;
  transform: translateZ(0);
}

/* Optimisation animations */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Monitoring Performance

#### Script de Monitoring

```javascript
// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics({ name, value, id }) {
  gtag('event', name, {
    event_category: 'Web Vitals',
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    event_label: id,
    non_interaction: true,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## Accessibilité

### Standards WCAG 2.1 AA

Le thème respecte intégralement les standards WCAG 2.1 AA :

#### 1. Navigation Clavier

```javascript
// Gestion navigation clavier
class KeyboardNavigation {
  constructor() {
    this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.setupKeyboardNavigation();
  }
  
  setupKeyboardNavigation() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  handleKeyDown(event) {
    if (event.key === 'Tab') {
      this.manageFocusOrder(event);
    }
    if (event.key === 'Escape') {
      this.closeModals();
    }
  }
}
```

#### 2. Support Screen Readers

```liquid
{%- comment -%} ARIA labels et descriptions {%- endcomment -%}
<button 
  type="button"
  aria-label="{{ 'cart.add_to_cart' | t }}"
  aria-describedby="product-{{ product.id }}-description"
  class="btn btn-primary add-to-cart-btn"
>
  <span class="visually-hidden">{{ 'cart.add_to_cart' | t }}</span>
  {{ 'cart.add' | t }}
</button>

<div id="product-{{ product.id }}-description" class="visually-hidden">
  {{ product.title }} - {{ product.price | money }}
</div>
```

#### 3. Contraste des Couleurs

```css
/* Ratios de contraste respectés */
.btn-primary {
  background: #667eea; /* Ratio 4.5:1 avec blanc */
  color: #ffffff;
}

.text-body {
  color: #2c3e50; /* Ratio 7:1 avec blanc */
}

/* États de focus visibles */
.focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
```

#### 4. Tests Accessibilité

```bash
# Audit automatisé
npm run test:accessibility

# Tests manuels recommandés
# - Navigation complète au clavier
# - Test avec screen reader (NVDA/VoiceOver)
# - Vérification contraste couleurs
# - Test resize texte 200%
```

---

## Dépannage

### Problèmes Courants

#### 1. Animations Lentes sur Mobile

**Symptôme** : Bulles flottantes causent des performances dégradées

**Solution** :
```css
/* Réduire animations sur mobile */
@media (max-width: 749px) {
  .bubble {
    animation-duration: 8s; /* Plus lent = moins de calculs */
  }
}

/* Désactiver sur connexions lentes */
@media (prefers-reduced-motion: reduce) {
  .bubble {
    animation: none;
  }
}
```

#### 2. Quick View ne Fonctionne Pas

**Causes possibles** :
- JavaScript non chargé
- Product handle manquant
- Modal HTML incorrect

**Solution** :
```javascript
// Debug Quick View
console.log('Quick View triggers:', document.querySelectorAll('.quick-view-trigger'));
console.log('Modal element:', document.querySelector('.quick-view-modal'));

// Vérifier product handle
document.addEventListener('click', (e) => {
  if (e.target.matches('.quick-view-trigger')) {
    console.log('Product handle:', e.target.dataset.productHandle);
  }
});
```

#### 3. Problèmes de Traduction

**Symptôme** : Textes ne se traduisent pas

**Vérifications** :
1. Fichier de traduction existe dans `locales/`
2. Syntaxe JSON valide
3. Clés de traduction correspondent
4. Langue activée dans Shopify Admin

**Debug** :
```liquid
{{ 'general.search.search' | t }}
{%- comment -%} Affiche la clé si traduction manquante {%- endcomment -%}
```

#### 4. Problèmes de Performance

**Diagnostic** :
```bash
# Audit performance
npm run test:performance

# Lighthouse CLI
npx lighthouse https://votre-store.myshopify.com --output=html
```

**Optimisations** :
- Réduire nombre de bulles animées
- Optimiser images (WebP)
- Limiter JavaScript sur mobile
- Utiliser CDN pour assets

### Outils de Debug

#### 1. Console Développeur

```javascript
// Debug mode
window.TAIGA_DEBUG = true;

// Logger personnalisé
window.TaigaLogger = {
  log: (message, data) => {
    if (window.TAIGA_DEBUG) {
      console.log(`[Taiga] ${message}`, data);
    }
  }
};
```

#### 2. Tests Automatisés

```bash
# Tous les tests
npm run test:all

# Tests spécifiques
npm run test:accessibility
npm run test:performance
npm run test:cross-browser
npm run test:i18n
```

---

## Support Développeur

### Structure du Code

```
assets/
├── css/
│   ├── base.css                    # Styles de base
│   ├── accessibility.css          # Styles accessibilité
│   └── performance-optimization.css # Optimisations CSS
├── js/
│   ├── global.js                  # JavaScript global
│   ├── cart-drawer.js             # Panier coulissant
│   ├── quick-view-modal.js        # Modal aperçu rapide
│   └── performance-monitor.js      # Monitoring performance
└── images/
    └── bubbles/                   # Assets bulles animées

sections/
├── header.liquid                  # En-tête
├── footer.liquid                  # Pied de page
├── hero-banner.liquid             # Bannière principale
├── collection-showcase.liquid     # Showcase collections
└── product-recommendations.liquid # Recommandations

snippets/
├── product-card.liquid            # Carte produit
├── price.liquid                   # Affichage prix
└── quick-buy.liquid               # Achat rapide

templates/
├── product.json                   # Template produit
├── collection.json                # Template collection
└── cart.json                      # Template panier

locales/
├── en.default.json                # Anglais (défaut)
├── fr.json                        # Français
├── es.json                        # Espagnol
├── de.json                        # Allemand
└── ja.json                        # Japonais
```

### Hooks de Développement

```javascript
// Event hooks personnalisés
document.addEventListener('taiga:cart:updated', (event) => {
  console.log('Cart updated:', event.detail);
});

document.addEventListener('taiga:product:added', (event) => {
  console.log('Product added:', event.detail);
});

// Lifecycle hooks
window.Taiga = {
  onReady: (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  },
  
  onCartUpdate: (callback) => {
    document.addEventListener('taiga:cart:updated', callback);
  }
};
```

### API Interne

```javascript
// Taiga Theme API
window.TaigaAPI = {
  // Cart methods
  cart: {
    add: async (items) => { /* Implementation */ },
    update: async (updates) => { /* Implementation */ },
    get: async () => { /* Implementation */ }
  },
  
  // Product methods
  product: {
    fetchRecommendations: async (productId) => { /* Implementation */ },
    getVariant: (productId, selectedOptions) => { /* Implementation */ }
  },
  
  // UI methods
  ui: {
    showNotification: (message, type) => { /* Implementation */ },
    openQuickView: (productHandle) => { /* Implementation */ },
    toggleCartDrawer: () => { /* Implementation */ }
  }
};
```

### Personnalisations Avancées

#### 1. Ajouter des Animations Personnalisées

```css
/* Nouvelle animation bulle */
@keyframes custom-bubble-float {
  0% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

.bubble.custom {
  animation: custom-bubble-float 12s linear infinite;
}
```

#### 2. Nouveau Type de Section

```liquid
{%- comment -%} sections/custom-feature.liquid {%- endcomment -%}
{%- liquid
  assign section_id = 'custom-feature-' | append: section.id
  assign bg_color = section.settings.background_color | default: '#ffffff'
-%}

<div id="{{ section_id }}" class="custom-feature-section" style="background-color: {{ bg_color }};">
  <div class="container">
    {%- if section.settings.title != blank -%}
      <h2 class="section-title">{{ section.settings.title }}</h2>
    {%- endif -%}
    
    {%- for block in section.blocks -%}
      <div class="feature-block" {{ block.shopify_attributes }}>
        {%- case block.type -%}
          {%- when 'text' -%}
            {{ block.settings.content }}
          {%- when 'image' -%}
            <img src="{{ block.settings.image | img_url: '600x' }}" alt="{{ block.settings.image.alt }}">
        {%- endcase -%}
      </div>
    {%- endfor -%}
  </div>
</div>

{% schema %}
{
  "name": "Feature Personnalisée",
  "tag": "section",
  "class": "custom-feature",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Titre de la section"
    },
    {
      "type": "color",
      "id": "background_color",
      "label": "Couleur de fond",
      "default": "#ffffff"
    }
  ],
  "blocks": [
    {
      "type": "text",
      "name": "Texte",
      "settings": [
        {
          "type": "richtext",
          "id": "content",
          "label": "Contenu"
        }
      ]
    },
    {
      "type": "image",
      "name": "Image",
      "settings": [
        {
          "type": "image_picker",
          "id": "image",
          "label": "Image"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Feature Personnalisée"
    }
  ]
}
{% endschema %}
```

### Contributions et Mises à Jour

#### Workflow Git

```bash
# Développement
git checkout -b feature/nouvelle-fonctionnalite
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# Testing
npm run test:all
npm run build

# Merge
git checkout main
git merge feature/nouvelle-fonctionnalite
```

#### Standards de Code

- **CSS** : BEM methodology
- **JavaScript** : ES6+ modules
- **Liquid** : Indentation 2 spaces
- **Commits** : Conventional commits

---

## Contact et Support

### Resources

- 📧 **Email Support** : support@taiga-theme.com
- 📚 **Documentation** : https://docs.taiga-theme.com
- 🐛 **Bug Reports** : https://github.com/taiga-theme/issues
- 💬 **Community** : https://discord.gg/taiga-theme

### Versions du Thème

- **Version Actuelle** : 1.0.0
- **Compatibility Shopify** : 2.0+
- **Dernière Mise à Jour** : 2024-06-20

---

*Cette documentation est maintenue à jour avec chaque release du thème. Pour la dernière version, consultez la documentation en ligne.* 