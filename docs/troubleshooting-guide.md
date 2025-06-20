# Guide de Dépannage - Thème Taiga Bubbly

## 🆘 Diagnostic Rapide

### Problème Général : Le Thème Ne Fonctionne Pas

**Première vérification (2 minutes) :**

1. **Test Navigateur**
   - Videz le cache : Ctrl+F5 (PC) / Cmd+Shift+R (Mac)
   - Testez en mode incognito/privé
   - Vérifiez sur un autre navigateur

2. **Console Développeur**
   - Appuyez sur F12
   - Onglet "Console"
   - Cherchez les erreurs en rouge
   - Notez les messages d'erreur

3. **Test Mobile/Desktop**
   - Redimensionnez la fenêtre
   - Testez sur mobile réel
   - Vérifiez les breakpoints (990px, 750px)

---

## 🎨 Problèmes de Design et Animations

### ❌ Les Bulles Flottantes Ne S'Affichent Pas

#### Symptômes
- Pas de bulles animées sur la page
- Fond uni sans effets visuels
- Performances dégradées sans cause apparente

#### Diagnostic
```javascript
// Ouvrir la console (F12) et taper :
console.log('Bulles:', document.querySelectorAll('.bubble'));
console.log('Settings:', window.bubbleSettings);
```

#### Solutions

**1. Vérifier les Paramètres Thème**
- Aller dans Personnaliser > Paramètres du thème > Animations
- Vérifier que "Activer les bulles" est coché
- Nombre de bulles > 0 (recommandé : 8-12)

**2. Problème Motion Preferences**
```css
/* Vérifier si les animations sont désactivées */
@media (prefers-reduced-motion: reduce) {
  .bubble {
    animation: none; /* Cause possible */
  }
}
```

**Solution :** Ajouter une override dans l'éditeur de thème
```css
/* Forcer l'affichage des bulles */
.bubble {
  animation: float 10s infinite linear !important;
  opacity: 0.2 !important;
}
```

**3. Conflit JavaScript**
- Désactiver temporairement autres apps
- Vérifier la console pour erreurs JS
- Test en mode thème par défaut

### ❌ Gradients Ne S'Affichent Pas Correctement

#### Symptômes
- Couleurs mates au lieu de gradients
- Dégradés avec bandes visibles
- Couleurs différentes de la configuration

#### Solutions

**1. Support Navigateur**
```css
/* Vérifier compatibilité gradient */
.gradient-test {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background: -webkit-linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background: -moz-linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

**2. Couleurs Configuration**
- Vérifier format couleurs (hex, rgb, hsl)
- S'assurer des contrastes suffisants
- Tester sur différents écrans

**3. Override CSS Temporaire**
```css
/* Custom CSS dans l'éditeur de thème */
.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
```

### ❌ Bordures Arrondies Manquantes

#### Solutions

**CSS Override :**
```css
/* Réappliquer les bordures rondes Bubbly */
.product-card {
  border-radius: 30px !important;
}

.btn {
  border-radius: 25px !important;
}

.form-field {
  border-radius: 50px !important;
}

input, textarea, select {
  border-radius: 20px !important;
}
```

---

## 📱 Problèmes Responsive et Mobile

### ❌ Menu Mobile Ne Fonctionne Pas

#### Symptômes
- Menu hamburger ne s'ouvre pas
- Navigation desktop visible sur mobile
- Boutons non cliquables

#### Diagnostic
```javascript
// Test fonction menu
document.querySelector('.mobile-menu-toggle').click();
console.log('Mobile menu:', document.querySelector('.mobile-nav'));
```

#### Solutions

**1. JavaScript Manquant**
```html
<!-- Vérifier présence dans theme.liquid -->
{{ 'mobile-menu.js' | asset_url | script_tag }}
```

**2. CSS Breakpoint**
```css
/* Forcer affichage mobile */
@media (max-width: 989px) {
  .mobile-menu-toggle {
    display: block !important;
  }
  .desktop-nav {
    display: none !important;
  }
}
```

**3. Event Listeners**
```javascript
// Fix temporaire console
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.querySelector('.mobile-nav');
  
  toggle.addEventListener('click', function() {
    menu.classList.toggle('active');
  });
});
```

### ❌ Contenu Déborde sur Mobile

#### Solutions

**CSS Responsive Fix :**
```css
/* Conteneurs responsive */
.container {
  max-width: 100% !important;
  padding: 0 15px !important;
}

/* Images responsive */
img {
  max-width: 100% !important;
  height: auto !important;
}

/* Texte adaptatif */
@media (max-width: 749px) {
  .hero-title {
    font-size: 2rem !important;
  }
  .product-grid {
    grid-template-columns: 1fr 1fr !important;
  }
}
```

---

## 🛒 Problèmes E-commerce

### ❌ Panier Ne S'Ouvre Pas (Cart Drawer)

#### Symptômes
- Click sur panier sans effet
- Panier s'ouvre en nouvelle page
- Quantités ne se mettent pas à jour

#### Diagnostic
```javascript
// Test API panier
fetch('/cart.js')
  .then(response => response.json())
  .then(cart => console.log('Cart:', cart));
```

#### Solutions

**1. Vérifier Configuration**
- Personnaliser > Paramètres > Panier
- "Activer panier coulissant" coché
- "Type de panier" = "Drawer"

**2. JavaScript Fix**
```javascript
// Force cart drawer behavior
document.addEventListener('click', function(e) {
  if (e.target.matches('.cart-link, .cart-icon')) {
    e.preventDefault();
    document.querySelector('.cart-drawer').classList.add('active');
  }
});
```

**3. Alternative Fallback**
```liquid
<!-- Snippet cart-drawer.liquid -->
<div class="cart-drawer" id="cart-drawer">
  <div class="cart-drawer-content">
    {% render 'cart-items' %}
  </div>
</div>
```

### ❌ Quick View Modal Ne Fonctionne Pas

#### Diagnostic
```javascript
// Test quick view
console.log('Quick view buttons:', document.querySelectorAll('.quick-view-btn'));
console.log('Modal:', document.querySelector('.quick-view-modal'));
```

#### Solutions

**1. Product Handle Manquant**
```liquid
<!-- Vérifier dans product-card.liquid -->
<button class="quick-view-btn" data-product-handle="{{ product.handle }}">
  Aperçu rapide
</button>
```

**2. JavaScript Integration**
```javascript
// Quick view initialization
class QuickView {
  constructor() {
    this.bindEvents();
  }
  
  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.quick-view-btn')) {
        const handle = e.target.dataset.productHandle;
        this.openModal(handle);
      }
    });
  }
  
  async openModal(handle) {
    const response = await fetch(`/products/${handle}?view=quick-view`);
    const html = await response.text();
    // Display modal with content
  }
}

new QuickView();
```

---

## 🌍 Problèmes Multilingues

### ❌ Traductions Ne S'Affichent Pas

#### Symptômes
- Textes restent en anglais
- Erreurs de clés de traduction
- Langues disponibles non visibles

#### Diagnostic
```liquid
<!-- Test dans template -->
{{ 'general.search.search' | t }}
Langue actuelle : {{ request.locale.iso_code }}
```

#### Solutions

**1. Fichiers de Traduction**
- Vérifier présence `/locales/[langue].json`
- Valider syntaxe JSON
- Comparer clés avec `en.default.json`

**2. Activation Shopify**
- Admin > Paramètres > Langues
- Vérifier langues publiées
- Tester changement de langue

**3. Sélecteur de Langue**
```liquid
<!-- Snippet language-selector.liquid -->
<div class="language-selector">
  {% for locale in localization.available_locales %}
    <a href="{{ locale.url }}" class="lang-link {% if locale.iso_code == localization.language.iso_code %}active{% endif %}">
      {{ locale.iso_code | upcase }}
    </a>
  {% endfor %}
</div>
```

### ❌ Formatage Devises Incorrect

#### Solutions

**1. Configuration Shopify Markets**
- Admin > Paramètres > Markets
- Vérifier devises par région
- Activer conversion automatique

**2. Template Fix**
```liquid
<!-- Prix avec devise correcte -->
{{ product.price | money_with_currency }}

<!-- Format local -->
{% assign price_format = localization.currency.symbol %}
{{ product.price | money | replace: '$', price_format }}
```

---

## ⚡ Problèmes de Performance

### ❌ Site Lent à Charger

#### Diagnostic Performance

**1. Lighthouse Audit**
```bash
# Via CLI
npx lighthouse https://votre-boutique.myshopify.com

# Ou Chrome DevTools
# F12 > Lighthouse > Generate report
```

**2. Identifier Goulots**
- Network tab (F12)
- Performance tab
- Core Web Vitals

#### Solutions Performance

**1. Optimisation Images**
```liquid
<!-- Images responsive optimisées -->
{%- assign image_sizes = '300,600,900,1200' | split: ',' -%}
<img
  srcset="{%- for size in image_sizes -%}{{ image | img_url: size | append: 'x' }} {{ size }}w{%- unless forloop.last -%},{%- endunless -%}{%- endfor -%}"
  sizes="(min-width: 990px) 25vw, 50vw"
  src="{{ image | img_url: '600x' }}"
  loading="lazy"
  alt="{{ image.alt | escape }}"
>
```

**2. JavaScript Optimization**
```javascript
// Lazy load non-critical JS
const loadModule = (module) => {
  return import(`./modules/${module}.js`);
};

// Intersection Observer pour animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
    }
  });
});
```

**3. CSS Critique**
```css
/* Inline critical CSS dans <head> */
/* Différer non-critical CSS */
<link rel="preload" href="{{ 'theme.css' | asset_url }}" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### ❌ Bulles Causent Lag

#### Solutions

**1. Réduire Nombre**
- Paramètres > Animations > Bulles : 6-8 max

**2. Optimisation Animation**
```css
/* Performance GPU */
.bubble {
  will-change: transform;
  transform: translateZ(0);
  animation: float 12s linear infinite;
}

/* Disable sur mobile */
@media (max-width: 749px) {
  .bubble {
    display: none;
  }
}
```

---

## 🔍 Problèmes SEO et Analytics

### ❌ Google Analytics Ne Fonctionne Pas

#### Diagnostic
```javascript
// Test GA4
console.log('GA:', window.gtag);
console.log('dataLayer:', window.dataLayer);
```

#### Solutions

**1. Configuration GA4**
```liquid
<!-- Dans theme.liquid <head> -->
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id={{ settings.google_analytics_id }}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{{ settings.google_analytics_id }}');
</script>
```

**2. E-commerce Tracking**
```javascript
// Purchase event
gtag('event', 'purchase', {
  transaction_id: '{{ order.order_number }}',
  value: {{ order.total_price | money_without_currency }},
  currency: '{{ order.currency }}',
  items: [
    {% for line_item in order.line_items %}
    {
      item_id: '{{ line_item.product.id }}',
      item_name: '{{ line_item.product.title }}',
      quantity: {{ line_item.quantity }},
      price: {{ line_item.price | money_without_currency }}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ]
});
```

### ❌ Schema.org / Structured Data

#### Validation
- Google Rich Results Test
- Schema.org Validator

#### Fix Structured Data
```liquid
<!-- Product schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "{{ product.title | escape }}",
  "image": "{{ product.featured_image | img_url: '1200x' }}",
  "description": "{{ product.description | strip_html | truncate: 160 | escape }}",
  "brand": {
    "@type": "Brand",
    "name": "{{ shop.name | escape }}"
  },
  "offers": {
    "@type": "Offer",
    "url": "{{ shop.url }}{{ product.url }}",
    "priceCurrency": "{{ cart.currency.iso_code }}",
    "price": "{{ product.price | money_without_currency }}",
    "availability": "{% if product.available %}https://schema.org/InStock{% else %}https://schema.org/OutOfStock{% endif %}"
  }
}
</script>
```

---

## 🛠️ Outils de Debug

### Console Commands Utiles

```javascript
// Debug général thème
window.TaigaDebug = {
  version: '1.0.0',
  features: {
    bubbles: !!document.querySelector('.bubble'),
    cartDrawer: !!document.querySelector('.cart-drawer'),
    quickView: !!document.querySelector('.quick-view-modal'),
    mobileMenu: !!document.querySelector('.mobile-nav')
  },
  performance: {
    loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
    domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
  }
};

console.table(window.TaigaDebug.features);
console.log('Performance:', window.TaigaDebug.performance);
```

### Tests Automatisés

```bash
# Si environnement de développement
npm run test:theme
npm run test:accessibility
npm run test:performance
```

### Validation HTML/CSS

```bash
# HTML Validator
curl -H "Content-Type: text/html; charset=utf-8" \
     --data-binary @index.html \
     https://validator.w3.org/nu/?out=json

# CSS Validator  
curl -H "Content-Type: text/css; charset=utf-8" \
     --data-binary @theme.css \
     https://jigsaw.w3.org/css-validator/validator
```

---

## 📞 Escalade Support

### Avant de Contacter le Support

**Informations à Préparer :**
- URL de la boutique
- Version du thème
- Navigateur et version
- Screenshots du problème
- Messages d'erreur console
- Étapes pour reproduire

### Niveaux de Support

**1. Auto-assistance** (ce guide)
**2. Communauté** Discord/Forum
**3. Support Email** support@taiga-theme.com
**4. Support Prioritaire** (clients premium)

### Template Email Support

```
Objet : [Taiga Bubbly] Problème [Description courte]

Bonjour,

Boutique : https://[votre-boutique].myshopify.com
Version thème : 1.0.0
Navigateur : Chrome 91.0.4472.124
Appareil : Desktop/Mobile

Problème :
[Description détaillée]

Étapes pour reproduire :
1. [Étape 1]
2. [Étape 2]
3. [Résultat observé]

Résultat attendu :
[Ce qui devrait se passer]

Captures d'écran :
[Joindre images]

Console errors :
[Copier erreurs JS/CSS]

Tests effectués :
- Cache vidé : Oui/Non
- Autre navigateur : Oui/Non
- Mode incognito : Oui/Non

Merci,
[Votre nom]
```

---

## 🔄 Mises à Jour et Maintenance

### Avant Mise à Jour

1. **Sauvegarde complète**
   - Dupliquer thème actuel
   - Exporter paramètres
   - Liste des personnalisations

2. **Test environnement**
   - Store de développement
   - Validation fonctionnalités
   - Tests de régression

### Après Mise à Jour

1. **Vérification rapide**
   - Homepage fonctionne
   - Pages produit OK
   - Panier fonctionnel
   - Mobile responsive

2. **Tests approfondis**
   - Parcours d'achat complet
   - Toutes les pages personnalisées
   - Intégrations tierces

---

*Guide de dépannage - Version 1.0 - Juin 2024*
*Mis à jour régulièrement avec nouveaux problèmes identifiés* 