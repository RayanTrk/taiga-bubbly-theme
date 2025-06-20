# Guide d'Internationalisation - Thème Taiga Bubbly

## Vue d'ensemble

Le thème Taiga Bubbly prend en charge l'internationalisation complète avec des traductions pour 5 langues principales et un système extensible pour ajouter d'autres langues.

## Langues Supportées par Défaut

- **Anglais (en)** - Langue par défaut
- **Français (fr)** - France et régions francophones
- **Espagnol (es)** - Espagne et Amérique latine
- **Allemand (de)** - Allemagne, Autriche, Suisse
- **Japonais (ja)** - Japon

## Structure des Fichiers de Traduction

Les fichiers de traduction sont situés dans le dossier `/locales/` :

```
locales/
├── en.default.json    # Anglais (par défaut)
├── fr.json           # Français
├── es.json           # Espagnol
├── de.json           # Allemand
└── ja.json           # Japonais
```

## Ajouter une Nouvelle Langue

### Étape 1 : Créer le Fichier de Traduction

1. Créez un nouveau fichier dans `/locales/` avec le code de langue ISO (ex: `it.json` pour l'italien)
2. Copiez la structure du fichier `en.default.json`
3. Traduisez toutes les chaînes de caractères

### Étape 2 : Structure du Fichier JSON

```json
{
  "general": {
    "accessibility": {
      "skip_to_content": "Traduction ici",
      "close": "Traduction ici"
    },
    "search": {
      "search": "Traduction ici"
    }
  },
  "products": {
    "product": {
      "add_to_cart": "Traduction ici",
      "price": {
        "regular_price": "Traduction ici"
      }
    }
  }
}
```

### Étape 3 : Sections Critiques à Traduire

#### Navigation et Interface
- `sections.header.menu`
- `sections.header.cart_count`
- `general.search.search`

#### Produits et Commerce
- `products.product.add_to_cart`
- `products.product.price.*`
- `products.product.quantity.*`
- `sections.cart.*`

#### Compte Client
- `customer.login_page.*`
- `customer.register.*`
- `customer.orders.*`

#### Accessibilité
- `accessibility.*`
- `general.accessibility.*`

## Support RTL (Droite-à-Gauche)

### Langues RTL Supportées

Le thème détecte automatiquement les langues RTL comme :
- Arabe (ar)
- Hébreu (he)
- Farsi/Persan (fa)

### Configuration RTL

Ajoutez l'attribut `dir="rtl"` aux éléments HTML pour les langues RTL :

```liquid
<html dir="{{ localization.language.direction | default: 'ltr' }}">
```

### CSS pour RTL

Utilisez les propriétés logiques CSS :
```css
.element {
  margin-inline-start: 1rem;  /* au lieu de margin-left */
  padding-inline-end: 0.5rem; /* au lieu de padding-right */
  border-inline-start: 1px solid; /* au lieu de border-left */
}
```

## Formatage des Devises

### Configuration par Défaut

```javascript
const currencyFormats = {
  'en': { code: 'USD', symbol: '$', position: 'before' },
  'fr': { code: 'EUR', symbol: '€', position: 'after' },
  'es': { code: 'EUR', symbol: '€', position: 'after' },
  'de': { code: 'EUR', symbol: '€', position: 'after' },
  'ja': { code: 'JPY', symbol: '¥', position: 'before' }
};
```

### Personnaliser le Format de Devise

Dans vos templates Liquid :
```liquid
{{ product.price | money_with_currency }}
{{ product.price | money }}
```

## Formatage des Dates

### Utilisation dans Liquid

```liquid
{{ article.published_at | date: "%B %d, %Y" }}
{{ order.created_at | date: "%d/%m/%Y" }}
```

### Formats par Langue

- **Anglais** : March 15, 2024
- **Français** : 15 mars 2024
- **Espagnol** : 15 de marzo de 2024
- **Allemand** : 15. März 2024
- **Japonais** : 2024年3月15日

## Tests d'Internationalisation

### Script de Test Automatisé

Utilisez le script `/scripts/i18n-testing.js` pour valider :

```javascript
// Dans la console du navigateur
window.testI18n().then(report => {
  console.log('Rapport de test I18n:', report);
});
```

### Tests Manuels

1. **Test de Complétude des Traductions**
   - Vérifiez que toutes les clés sont traduites
   - Testez les textes longs dans les layouts

2. **Test RTL**
   - Activez une langue RTL
   - Vérifiez l'alignement des éléments
   - Testez la navigation

3. **Test de Devise**
   - Changez la devise du magasin
   - Vérifiez le formatage des prix
   - Testez les calculs de panier

## Bonnes Pratiques

### 1. Cohérence des Traductions
- Utilisez un glossaire de termes techniques
- Maintenez le même ton et style
- Respectez les conventions culturelles

### 2. Gestion des Espaces
- Prévoyez 30-50% d'espace supplémentaire pour les traductions
- Testez avec des textes longs
- Utilisez des ellipsis si nécessaire

### 3. Caractères Spéciaux
- Supportez les accents et diacritiques
- Testez les caractères Unicode
- Vérifiez l'encodage UTF-8

### 4. Contexte Culturel
- Adaptez les images si nécessaire
- Respectez les formats de date/heure locaux
- Considérez les préférences de couleur

## Shopify Markets Integration

### Configuration des Markets

1. Activez Shopify Markets dans l'admin
2. Configurez les devises par marché
3. Assignez les langues aux marchés

### Code Liquid pour Markets

```liquid
{% for localization in localization.available_languages %}
  <option value="{{ localization.iso_code }}"
          {% if localization.iso_code == localization.language.iso_code %}selected{% endif %}>
    {{ localization.endonym_name }}
  </option>
{% endfor %}
```

## Dépannage

### Problèmes Courants

1. **Traductions Manquantes**
   - Vérifiez la syntaxe JSON
   - Confirmez les clés de traduction
   - Videz le cache du thème

2. **Problèmes RTL**
   - Vérifiez les propriétés CSS logiques
   - Testez la direction du texte
   - Contrôlez l'ordre des éléments flex

3. **Formatage des Devises**
   - Vérifiez la configuration des marchés
   - Contrôlez les paramètres de localisation
   - Testez avec différentes devises

### Outils de Debug

```javascript
// Vérifier la langue active
console.log('Langue active:', document.documentElement.lang);

// Tester une traduction
console.log('Traduction:', theme.strings.add_to_cart);

// Vérifier la direction du texte
console.log('Direction:', getComputedStyle(document.body).direction);
```

## Ressources Supplémentaires

- [Documentation Shopify Markets](https://shopify.dev/themes/markets)
- [Guide des Traductions Liquid](https://shopify.dev/themes/architecture/locales)
- [Standards Unicode](https://unicode.org/)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)

## Support

Pour toute question concernant l'internationalisation du thème Taiga Bubbly, consultez la documentation complète ou contactez l'équipe de support technique. 