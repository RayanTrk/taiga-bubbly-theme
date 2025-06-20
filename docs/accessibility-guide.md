# Guide d'Accessibilité - Thème Taiga Bubbly

## 🎯 Objectif WCAG 2.1 AA

Ce guide assure la conformité du thème Taiga Bubbly aux standards WCAG 2.1 niveau AA selon les spécifications shopirule.mdc.

## 🔧 Outils d'Audit Automatisé

### Script d'Audit Principal
```bash
# Lancer l'audit complet
node scripts/accessibility-audit.js

# Vérifier les résultats
open .taskmaster/reports/accessibility-audit-report.html
```

### Tests Lighthouse Intégrés
```bash
# Tests de performance incluant l'accessibilité
npm run test:performance

# Tests d'accessibilité uniquement
lighthouse https://your-store.myshopify.com --only-categories=accessibility
```

## 📋 Checklist WCAG 2.1 AA

### Niveau A (Obligatoire)

#### Images et Médias
- [ ] Toutes les images ont un attribut `alt` descriptif
- [ ] Images décoratives ont `alt=""` ou `aria-hidden="true"`
- [ ] Vidéos ont des sous-titres et descriptions audio

#### Structure et Navigation
- [ ] Hiérarchie des titres logique (H1 → H2 → H3...)
- [ ] Navigation cohérente sur toutes les pages
- [ ] Liens de saut ("Skip to content") disponibles
- [ ] Ordre de tabulation logique

#### Formulaires
- [ ] Tous les champs ont des labels associés
- [ ] Messages d'erreur clairs et descriptifs
- [ ] Instructions de saisie disponibles

#### Clavier
- [ ] Toute fonctionnalité accessible au clavier
- [ ] Aucun piège de clavier
- [ ] Indicateurs de focus visibles

### Niveau AA (Cible)

#### Contraste des Couleurs
- [ ] Texte normal : ratio 4.5:1 minimum
- [ ] Texte large (18pt+) : ratio 3:1 minimum
- [ ] Éléments d'interface : ratio 3:1 minimum

#### Responsive et Zoom
- [ ] Contenu lisible à 200% de zoom
- [ ] Pas de défilement horizontal à 320px
- [ ] Espacement de texte ajustable

#### Interaction
- [ ] Cibles tactiles minimum 44x44px
- [ ] Contenu au survol/focus persistant et contrôlable
- [ ] Animations respectent `prefers-reduced-motion`

## 🎨 Spécificités du Design Bubbly

### Gradients et Bulles Décoratives
```css
/* Bulles décoratives - masquer aux lecteurs d'écran */
.bubble-decoration {
  aria-hidden: true;
  pointer-events: none;
}

/* Maintenir le contraste sur les gradients */
.gradient-background {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; /* Contraste 4.5:1 minimum */
}
```

### Animations et Mouvement
```css
/* Respecter les préférences utilisateur */
@media (prefers-reduced-motion: reduce) {
  .bubble-float,
  .gradient-shift {
    animation: none !important;
    transition: none !important;
  }
}
```

### Focus et Navigation
```css
/* Focus visible pour le design Bubbly */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
  box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.2);
}
```

## 🧪 Tests Manuels Essentiels

### Navigation Clavier
1. **Tab** : Parcourir tous les éléments interactifs
2. **Shift+Tab** : Navigation inverse
3. **Enter/Space** : Activer boutons et liens
4. **Échap** : Fermer modales et menus
5. **Flèches** : Navigation dans les menus

### Lecteurs d'Écran
1. **NVDA** (Windows) - Gratuit
2. **VoiceOver** (Mac) - Intégré
3. **JAWS** (Windows) - Payant

### Tests de Contraste
1. **WebAIM Contrast Checker**
2. **Colour Contrast Analyser**
3. **axe DevTools** (Extension navigateur)

## 🔍 Patterns d'Accessibilité Bubbly

### Modales et Overlays
```javascript
// Gestion du focus dans les modales
class AccessibleModal {
  open() {
    this.previousFocus = document.activeElement;
    this.modal.setAttribute('aria-hidden', 'false');
    this.trapFocus();
  }
  
  close() {
    this.modal.setAttribute('aria-hidden', 'true');
    this.previousFocus.focus();
  }
}
```

### Carrousels et Sliders
```html
<!-- Carrousel accessible -->
<div class="carousel" role="region" aria-label="Featured Products">
  <div class="carousel-controls">
    <button aria-label="Previous slide">‹</button>
    <button aria-label="Next slide">›</button>
  </div>
  <div class="carousel-slides" aria-live="polite">
    <!-- Slides content -->
  </div>
</div>
```

### Formulaires Complexes
```html
<!-- Groupe de champs avec description -->
<fieldset>
  <legend>Shipping Information</legend>
  <div class="field-group">
    <label for="address">Street Address</label>
    <input id="address" type="text" aria-describedby="address-help">
    <div id="address-help" class="help-text">
      Include apartment or unit number
    </div>
  </div>
</fieldset>
```

## 🚀 Automatisation et CI/CD

### Tests Automatisés
```json
// package.json scripts
{
  "scripts": {
    "test:a11y": "node scripts/accessibility-audit.js",
    "test:a11y:ci": "lighthouse-ci --config=lighthouserc.js",
    "lint:a11y": "axe-core --include=main --exclude=.bubble-decoration"
  }
}
```

### Pre-commit Hooks
```bash
# Installation husky pour les hooks git
npm install --save-dev husky

# Hook pre-commit pour les tests d'accessibilité
echo "npm run test:a11y" > .husky/pre-commit
```

## 📊 Métriques et Monitoring

### Objectifs de Performance
- **Lighthouse Accessibility Score** : 95+ sur toutes les pages
- **axe Violations** : 0 erreurs critiques
- **Keyboard Navigation** : 100% des fonctionnalités accessibles
- **Screen Reader Compatibility** : Tests réussis sur NVDA/VoiceOver

### Monitoring Continu
```javascript
// Monitoring des Core Web Vitals avec accessibilité
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Track accessibility-related metrics
    if (entry.name.includes('accessibility')) {
      sendToAnalytics('accessibility', entry);
    }
  }
}).observe({ entryTypes: ['navigation', 'resource'] });
```

## 🎓 Formation et Ressources

### Ressources WCAG
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project](https://www.a11yproject.com/)

### Outils de Développement
- **axe DevTools** : Extension navigateur
- **WAVE** : Évaluateur web d'accessibilité
- **Lighthouse** : Audit intégré Chrome
- **Pa11y** : Outil en ligne de commande

### Tests Utilisateurs
- Recruter des utilisateurs avec handicaps
- Tests avec technologies d'assistance réelles
- Feedback sur l'expérience utilisateur complète

## 🔄 Processus de Révision

### Avant Chaque Release
1. ✅ Audit automatisé passé (95+ score)
2. ✅ Tests manuels clavier effectués
3. ✅ Tests lecteur d'écran réalisés
4. ✅ Validation contraste couleurs
5. ✅ Tests responsive et zoom
6. ✅ Documentation mise à jour

### Maintenance Continue
- Audit mensuel complet
- Formation équipe trimestrielle
- Mise à jour outils et standards
- Veille réglementaire accessibilité

---

**Note** : Ce guide suit les spécifications shopirule.mdc pour le thème Taiga Bubbly. L'accessibilité n'est pas une fonctionnalité ajoutée mais un principe de design fondamental intégré dès la conception. 