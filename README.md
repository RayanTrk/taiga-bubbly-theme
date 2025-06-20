# 🎨 Thème Shopify Taiga - Style Bubbly

Un thème Shopify moderne et performant avec des animations de bulles flottantes, des gradients colorés et une expérience utilisateur optimisée.

![Taiga Bubbly Theme](https://via.placeholder.com/800x400/667eea/ffffff?text=Taiga+Bubbly+Theme)

## ✨ Caractéristiques Principales

### 🎪 Design Bubbly Unique
- **12 bulles flottantes animées** avec effets de transparence
- **Gradients colorés dynamiques** (#667eea → #764ba2)
- **Bordures ultra-rondes** pour un look moderne
- **Animations GPU-accelerated** avec respect des préférences utilisateur

### ⚡ Performance Optimisée
- **Score Lighthouse 90+** sur mobile et desktop
- **Lazy loading intelligent** pour images et composants
- **Core Web Vitals optimisés** (LCP < 2.5s, FID < 100ms)
- **JavaScript modulaire** avec code splitting

### ♿ Accessibilité WCAG 2.1 AA
- **Navigation clavier complète** avec focus visible
- **Support screen readers** (NVDA, VoiceOver, JAWS)
- **Contrastes de couleur 4.5:1+** respectés
- **Touch targets 44x44px minimum** sur mobile

### 🌍 Support Multilingue
- **5 langues incluses** : EN, FR, ES, DE, JA
- **Support RTL** pour langues droite-à-gauche
- **Formatage automatique** des devises par région
- **Shopify Markets** prêt à l'emploi

### 🛒 E-commerce Avancé
- **Cart Drawer** coulissant avec mise à jour temps réel
- **Quick View Modal** pour aperçu rapide produits
- **Product Recommendations** intelligentes
- **Cross-selling** et upselling automatiques

---

## 📋 Prérequis

- **Shopify Plan** : De base ou supérieur
- **Navigateurs supportés** : Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Résolution minimum** : 320px (mobile) à 1920px+ (desktop)

---

## 🚀 Installation Rapide

### Méthode Standard (Recommandée)

1. **Télécharger le thème**
   ```
   Téléchargez le fichier taiga-bubbly-theme.zip
   ```

2. **Installer dans Shopify**
   - Admin Shopify → Boutique en ligne → Thèmes
   - "Ajouter un thème" → "Télécharger un fichier zip"
   - Sélectionner `taiga-bubbly-theme.zip`

3. **Configuration initiale**
   - Cliquer "Personnaliser"
   - Configurer logo, couleurs, et contenu
   - Prévisualiser puis Publier

### Installation Développeur

```bash
# Via Shopify CLI
git clone https://github.com/[repo]/taiga-bubbly-theme.git
cd taiga-bubbly-theme
shopify theme serve
```

**Guide complet** : [`docs/installation-guide.md`](docs/installation-guide.md)

---

## 🎨 Configuration du Design Bubbly

### Paramètres Animations

```css
/* Configuration des bulles */
Nombre de bulles: 12 (0-20)
Vitesse animation: 1x (0.5x-2x)
Respect motion preferences: Activé
```

### Palette de Couleurs

```css
:root {
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --gradient-tertiary: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --border-radius-forms: 50px;
  --border-radius-cards: 30px;
  --border-radius-elements: 20px;
}
```

### Breakpoints Responsive

```css
/* Mobile First Design */
@media (min-width: 480px) { /* Mobile Large */ }
@media (min-width: 750px) { /* Tablet */ }
@media (min-width: 990px) { /* Desktop */ }
@media (min-width: 1200px) { /* Large Desktop */ }
```

---

## 📁 Structure du Projet

```
taiga-bubbly-theme/
├── 📁 assets/                    # Assets statiques
│   ├── 📁 css/
│   │   ├── base.css              # Styles de base
│   │   ├── accessibility.css    # Styles accessibilité
│   │   └── performance-optimization.css
│   ├── 📁 js/
│   │   ├── global.js             # JavaScript global
│   │   ├── cart-drawer.js        # Panier coulissant
│   │   ├── quick-view-modal.js   # Modal aperçu rapide
│   │   └── bubble-animation.js   # Animations bulles
│   └── 📁 images/
├── 📁 sections/                  # Sections modulaires
│   ├── header.liquid             # En-tête du site
│   ├── footer.liquid             # Pied de page
│   ├── hero-banner.liquid        # Bannière principale
│   └── product-recommendations.liquid
├── 📁 snippets/                  # Composants réutilisables
│   ├── product-card.liquid       # Carte produit
│   ├── price.liquid              # Affichage prix
│   └── bubble-container.liquid   # Conteneur bulles
├── 📁 templates/                 # Templates de pages
│   ├── product.json              # Page produit
│   ├── collection.json           # Page collection
│   └── cart.json                 # Page panier
├── 📁 locales/                   # Traductions
│   ├── en.default.json           # Anglais (défaut)
│   ├── fr.json                   # Français
│   ├── es.json                   # Espagnol
│   ├── de.json                   # Allemand
│   └── ja.json                   # Japonais
├── 📁 config/                    # Configuration
│   └── settings_schema.json      # Paramètres thème
├── 📁 layout/                    # Layouts de base
│   └── theme.liquid              # Layout principal
├── 📁 docs/                      # Documentation
│   ├── merchant-guide.md         # Guide marchand
│   ├── installation-guide.md     # Guide installation
│   ├── troubleshooting-guide.md  # Dépannage
│   └── internationalization-guide.md
└── 📁 scripts/                   # Scripts de développement
    ├── cross-browser-testing.js  # Tests cross-browser
    ├── i18n-testing.js           # Tests internationalisation
    └── accessibility-audit.js    # Audit accessibilité
```

---

## 🛠️ Développement

### Environnement Local

```bash
# Installation dépendances
npm install

# Développement avec hot reload
npm run dev

# Build pour production
npm run build

# Tests
npm run test:all
npm run test:accessibility
npm run test:performance
npm run test:cross-browser
npm run test:i18n
```

### Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement avec hot reload |
| `npm run build` | Build de production optimisé |
| `npm run test:all` | Suite complète de tests |
| `npm run test:accessibility` | Tests d'accessibilité WCAG 2.1 |
| `npm run test:performance` | Audit performance Lighthouse |
| `npm run test:cross-browser` | Tests compatibilité navigateurs |
| `npm run test:i18n` | Tests internationalisation |
| `npm run lint` | Vérification qualité du code |

### Outils de Développement

```javascript
// Debug mode
window.TAIGA_DEBUG = true;

// API interne
window.TaigaAPI = {
  cart: { add, update, get },
  product: { fetchRecommendations, getVariant },
  ui: { showNotification, openQuickView, toggleCartDrawer }
};
```

---

## 📊 Performance et Métriques

### Scores Lighthouse Cibles

| Métrique | Mobile | Desktop |
|----------|---------|---------|
| **Performance** | 90+ | 95+ |
| **Accessibilité** | 95+ | 95+ |
| **Best Practices** | 90+ | 95+ |
| **SEO** | 95+ | 95+ |

### Core Web Vitals

- **LCP (Largest Contentful Paint)** : < 2.5s
- **FID (First Input Delay)** : < 100ms
- **CLS (Cumulative Layout Shift)** : < 0.1

### Optimisations Implémentées

- ✅ **Lazy loading** images et composants
- ✅ **Code splitting** JavaScript modulaire
- ✅ **Critical CSS** inline
- ✅ **WebP** support avec fallback
- ✅ **Service Worker** pour cache intelligent
- ✅ **Preload** ressources critiques

---

## 🌍 Internationalisation

### Langues Supportées

| Langue | Code | Status | RTL |
|--------|------|--------|-----|
| Anglais | `en` | ✅ Défaut | Non |
| Français | `fr` | ✅ Complet | Non |
| Espagnol | `es` | ✅ Complet | Non |
| Allemand | `de` | ✅ Complet | Non |
| Japonais | `ja` | ✅ Complet | Non |

### Support RTL

Le thème supporte les langues droite-à-gauche avec :
- **CSS logiques** (margin-inline, padding-inline)
- **Direction automatique** selon la langue
- **Tests inclus** pour Arabe, Hébreu, Farsi

### Ajout de Nouvelles Langues

```bash
# Copier le fichier de traduction
cp locales/en.default.json locales/[langue].json

# Traduire les chaînes
# Activer dans Shopify Admin
```

**Guide complet** : [`docs/internationalization-guide.md`](docs/internationalization-guide.md)

---

## ♿ Accessibilité

### Standards Respectés

- **WCAG 2.1 AA** : Conformité complète
- **Section 508** : Compatible
- **ADA** : Conforme pour sites web

### Fonctionnalités Accessibilité

- **Navigation clavier** : Tab, Enter, Escape, Arrow keys
- **Screen readers** : ARIA labels, descriptions, live regions
- **Contrastes** : 4.5:1 minimum (texte), 3:1 (UI)
- **Focus visible** : Indicateurs clairs pour tous éléments
- **Texte redimensionnable** : 200% sans perte fonctionnalité
- **Animation respect** : prefers-reduced-motion

### Tests Inclus

```bash
# Audit automatisé
npm run test:accessibility

# Tests manuels recommandés
# - Navigation complète au clavier
# - Test screen reader (NVDA/VoiceOver)
# - Contraste couleurs
# - Resize texte 200%
```

---

## 🆘 Support et Documentation

### Documentation Complète

- 📖 **[Guide Marchand](docs/merchant-guide.md)** - Configuration et utilisation
- 🔧 **[Guide Installation](docs/installation-guide.md)** - Installation détaillée
- 🚨 **[Guide Dépannage](docs/troubleshooting-guide.md)** - Résolution problèmes
- 🌍 **[Guide I18n](docs/internationalization-guide.md)** - Internationalisation
- ♿ **[Guide Accessibilité](docs/accessibility.md)** - Standards et tests

### Support Technique

- **Email** : support@taiga-theme.com
- **Délai** : 24h en semaine (9h-17h GMT+1)
- **Discord** : [Communauté Taiga](https://discord.gg/taiga-theme)
- **Documentation** : [docs.taiga-theme.com](https://docs.taiga-theme.com)

### FAQ Rapide

<details>
<summary><strong>Les bulles ne s'affichent pas ?</strong></summary>

Vérifiez dans Personnaliser > Paramètres > Animations que les bulles sont activées et le nombre > 0. Testez aussi sans mode "prefers-reduced-motion".
</details>

<details>
<summary><strong>Comment changer les couleurs des gradients ?</strong></summary>

Allez dans Personnaliser > Paramètres du thème > Couleurs. Modifiez les couleurs principales et secondaires pour ajuster les gradients automatiquement.
</details>

<details>
<summary><strong>Le panier coulissant ne fonctionne pas ?</strong></summary>

Vérifiez dans Paramètres > Panier que "Panier coulissant" est activé. Videz le cache navigateur et testez en mode incognito.
</details>

<details>
<summary><strong>Comment ajouter une nouvelle langue ?</strong></summary>

Copiez le fichier `locales/en.default.json` vers `locales/[code-langue].json`, traduisez les chaînes, puis activez la langue dans Admin Shopify > Paramètres > Langues.
</details>

---

## 🔄 Mises à Jour et Changelog

### Version Actuelle : 1.0.0

**Date de sortie** : Juin 2024

#### ✨ Nouvelles Fonctionnalités
- Design Bubbly avec 12 bulles flottantes animées
- Support complet WCAG 2.1 AA
- Système d'internationalisation 5 langues
- Cart Drawer avec recommandations
- Quick View Modal optimisé
- Performance Lighthouse 90+

#### 🐛 Corrections
- Optimisation animations sur mobile
- Fix compatibilité Safari backdrop-filter
- Amélioration navigation clavier
- Correction formatage devises RTL

#### 📈 Améliorations
- Lazy loading intelligent
- Code splitting modulaire
- CSS logiques pour RTL
- Tests automatisés complets

### Roadmap

- **v1.1.0** - Widgets de personnalisation avancés
- **v1.2.0** - Integration AR/VR pour produits
- **v1.3.0** - AI-powered recommendations
- **v2.0.0** - Shopify 3.0 compatibility

---

## 🤝 Contribution

### Guidelines

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commiter** les changements (`git commit -m 'feat: ajouter nouvelle fonctionnalité'`)
4. **Pousser** la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Créer** une Pull Request

### Standards

- **CSS** : BEM methodology
- **JavaScript** : ES6+ modules, JSDoc
- **Liquid** : Indentation 2 spaces
- **Commits** : [Conventional Commits](https://conventionalcommits.org/)

### Tests Requis

```bash
# Avant contribution
npm run test:all
npm run lint
npm run build
```

---

## 📄 Licence

Ce thème est sous licence propriétaire. L'utilisation est limitée à une boutique Shopify par licence achetée.

**Licence complète** : [LICENSE.md](LICENSE.md)

---

## 🏷️ Tags

`shopify` `theme` `e-commerce` `responsive` `accessibility` `performance` `bubbly` `animations` `gradients` `multilingual` `wcag` `lighthouse`

---

## 🌟 Crédits

**Développé par** : [Équipe Taiga Theme](https://taiga-theme.com)  
**Design inspiré par** : Aesthetic moderne bubbly et tendances UI 2024  
**Remerciements** : Communauté Shopify pour les retours et contributions

---

*Dernière mise à jour : Juin 2024 - Version 1.0.0* 