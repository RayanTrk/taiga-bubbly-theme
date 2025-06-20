# Guide d'Installation - Thème Taiga Bubbly

## 📋 Prérequis

Avant de commencer l'installation, assurez-vous d'avoir :

- ✅ **Boutique Shopify active** (plan de base minimum)
- ✅ **Accès administrateur** à votre boutique
- ✅ **Navigateur moderne** (Chrome, Firefox, Safari, Edge - dernières versions)
- ✅ **Fichier zip du thème** `taiga-bubbly-theme.zip`

---

## 🚀 Installation Standard (Recommandée)

### Étape 1 : Accéder à l'Administration Shopify

1. **Connexion à l'Admin**
   - Ouvrez votre navigateur
   - Allez sur `https://[votre-boutique].myshopify.com/admin`
   - Connectez-vous avec vos identifiants

2. **Navigation vers les Thèmes**
   - Dans le menu latéral, cliquez sur **"Boutique en ligne"**
   - Puis cliquez sur **"Thèmes"**

### Étape 2 : Sauvegarde du Thème Actuel

⚠️ **Important** : Sauvegardez toujours votre thème actuel avant installation

1. **Localiser le Thème Actuel**
   - Repérez le thème marqué **"Publié"** (avec une étiquette verte)

2. **Créer une Sauvegarde**
   - Cliquez sur **"Actions"** à côté du thème publié
   - Sélectionnez **"Dupliquer"**
   - Renommez la copie : `[Nom du thème] - Sauvegarde [Date]`

### Étape 3 : Installation du Thème Taiga Bubbly

1. **Ajouter un Nouveau Thème**
   - Dans la section **"Bibliothèque de thèmes"**
   - Cliquez sur **"Ajouter un thème"**
   - Sélectionnez **"Télécharger un fichier zip"**

2. **Télécharger le Fichier**
   - Cliquez sur **"Choisir un fichier"**
   - Sélectionnez `taiga-bubbly-theme.zip` sur votre ordinateur
   - Cliquez sur **"Télécharger"**

3. **Attendre l'Installation**
   - Le téléchargement peut prendre 1-3 minutes
   - Ne fermez pas la fenêtre pendant le processus
   - Le thème apparaîtra dans votre bibliothèque une fois installé

### Étape 4 : Configuration Initiale

1. **Prévisualiser le Thème**
   - Localisez **"Taiga Bubbly"** dans votre bibliothèque
   - Cliquez sur **"Prévisualiser"**
   - Testez la navigation et les fonctionnalités de base

2. **Personnaliser Avant Publication**
   - Depuis la prévisualisation, cliquez sur **"Personnaliser"**
   - Ou depuis la bibliothèque : **"Actions"** > **"Personnaliser"**

---

## 🎨 Configuration Initiale Rapide

### Configuration Logo et Branding (5 minutes)

1. **Ajouter votre Logo**
   - Dans l'éditeur de thème : **"Paramètres du thème"** (en bas à gauche)
   - Section **"Logo"**
   - Cliquez **"Sélectionner une image"**
   - Téléchargez votre logo (format recommandé : SVG, PNG transparent, 300x100px)

2. **Couleurs de Marque**
   - Section **"Couleurs"**
   - **Couleur principale** : Pour boutons et liens
   - **Couleur secondaire** : Pour accents et hover
   - **Couleur d'arrière-plan** : Généralement blanc ou gris très clair

### Configuration Navigation (10 minutes)

1. **Menu Principal**
   - Sortez de l'éditeur de thème
   - Allez dans **"Navigation"** (menu latéral)
   - Cliquez sur **"Menu principal"**
   - Ajoutez vos catégories :
     ```
     Accueil -> [URL de votre boutique]
     Boutique -> /collections/all
     [Nom de Collection] -> /collections/[handle-collection]
     À Propos -> /pages/about
     Contact -> /pages/contact
     ```

2. **Vérification Navigation**
   - Retournez à la prévisualisation du thème
   - Testez chaque lien du menu
   - Vérifiez que le menu mobile fonctionne (< 990px)

### Configuration Homepage (15 minutes)

1. **Section Hero Banner**
   - Dans l'éditeur : cliquez sur la section hero (bannière principale)
   - **Image de fond** : 1920x1080px minimum, haute qualité
   - **Titre principal** : Message clair et accrocheur (max 60 caractères)
   - **Sous-titre** : Complément d'information (max 120 caractères)
   - **Bouton** : Texte court ("Découvrir", "Acheter maintenant") + lien

2. **Section Produits Vedettes**
   - Sélectionnez la section **"Featured Products"** ou **"Product Grid"**
   - Choisissez une collection existante ou créez-en une nouvelle
   - Définissez le nombre de produits à afficher (4, 6, 8, ou 12)

3. **Section Collections**
   - Section **"Collection List"** ou **"Collection Showcase"**
   - Sélectionnez 3-4 collections principales
   - Assurez-vous que chaque collection a une image attractive

---

## 🔧 Installation Avancée (Développeurs)

### Installation via CLI Shopify

```bash
# Prérequis : Shopify CLI installé
npm install -g @shopify/cli @shopify/theme

# Cloner le repository (si disponible)
git clone [repository-url] taiga-bubbly-theme
cd taiga-bubbly-theme

# Authentification Shopify
shopify auth login

# Configuration de la boutique
shopify theme init

# Upload du thème
shopify theme push --unpublished
```

### Installation via GitHub

```bash
# Si le thème est hébergé sur GitHub
git clone https://github.com/[username]/taiga-bubbly-theme.git
cd taiga-bubbly-theme

# Installation dépendances (si applicable)
npm install

# Build du thème (si nécessaire)
npm run build

# Création du zip pour upload
zip -r taiga-bubbly-theme.zip . -x "node_modules/*" ".git/*" "*.md"
```

### Structure des Fichiers

```
taiga-bubbly-theme/
├── assets/                 # CSS, JS, images
│   ├── css/
│   ├── js/
│   └── images/
├── config/                 # Paramètres du thème
│   └── settings_schema.json
├── layout/                 # Templates de base
│   └── theme.liquid
├── locales/                # Traductions
│   ├── en.default.json
│   ├── fr.json
│   └── ...
├── sections/               # Sections modulaires
├── snippets/               # Composants réutilisables
├── templates/              # Templates de pages
└── docs/                   # Documentation
```

---

## 🔍 Vérification Post-Installation

### Checklist de Validation

#### ✅ Fonctionnalité de Base
- [ ] **Navigation principale** fonctionne
- [ ] **Menu mobile** s'affiche correctement (< 990px)
- [ ] **Panier** ajoute/supprime des produits
- [ ] **Recherche** retourne des résultats
- [ ] **Footer** affiche les liens

#### ✅ Design Bubbly
- [ ] **Bulles animées** apparaissent (12 par défaut)
- [ ] **Gradients** s'affichent correctement
- [ ] **Bordures arrondies** présentes
- [ ] **Animations** fluides (respectent motion preferences)

#### ✅ Pages Essentielles
- [ ] **Homepage** : sections configurées
- [ ] **Page produit** : images, prix, bouton d'achat
- [ ] **Page collection** : filtres, pagination
- [ ] **Panier** : modification quantités, codes promo
- [ ] **Checkout** : processus complet

#### ✅ Responsive Design
- [ ] **Desktop** (1200px+) : expérience complète
- [ ] **Tablet** (750-1199px) : navigation adaptée
- [ ] **Mobile** (< 750px) : optimisé tactile

#### ✅ Performance
- [ ] **Vitesse de chargement** : < 3 secondes
- [ ] **Images** : lazy loading actif
- [ ] **JavaScript** : pas d'erreurs console
- [ ] **CSS** : styles appliqués correctement

### Tests Recommandés

#### Test Cross-Browser
```bash
# Si outils développeur installés
npm run test:cross-browser

# Ou tests manuels sur :
# - Chrome (dernière version)
# - Firefox (dernière version)
# - Safari (si Mac/iOS)
# - Edge (dernière version)
```

#### Test Performance
```bash
# Lighthouse audit
npx lighthouse https://[votre-boutique].myshopify.com --output=html

# Ou utiliser Google PageSpeed Insights
# https://pagespeed.web.dev/
```

---

## 🆘 Résolution de Problèmes

### Problèmes d'Installation Courants

#### ❌ "Erreur lors du téléchargement du thème"

**Causes possibles :**
- Fichier zip corrompu
- Connexion internet instable
- Taille de fichier trop importante
- Format de fichier incorrect

**Solutions :**
1. Re-téléchargez le fichier zip original
2. Vérifiez votre connexion internet
3. Essayez depuis un autre navigateur
4. Contactez le support si le problème persiste

#### ❌ "Le thème ne s'affiche pas correctement"

**Vérifications :**
1. **Cache navigateur** : Ctrl+F5 (PC) ou Cmd+R (Mac)
2. **Mode incognito** : Testez dans une fenêtre privée
3. **JavaScript activé** : Vérifiez les paramètres du navigateur
4. **Ad-blockers** : Désactivez temporairement

#### ❌ "Les bulles ne s'affichent pas"

**Solutions :**
1. Vérifiez les paramètres animations dans l'éditeur de thème
2. Testez sur un autre appareil/navigateur
3. Vérifiez que "Respect Motion Preferences" n'est pas en conflit

#### ❌ "Menu mobile non fonctionnel"

**Diagnostic :**
1. Ouvrez les outils développeur (F12)
2. Vérifiez les erreurs JavaScript dans la console
3. Testez la largeur d'écran (< 990px pour activation mobile)

### Contacts Support

#### Support Technique
- **Email** : support@taiga-theme.com
- **Délai de réponse** : 24h en semaine
- **Heures support** : 9h-17h (GMT+1)

#### Documentation
- **Guide complet** : `/docs/theme-documentation.md`
- **FAQ** : `/docs/faq.md`
- **Vidéos** : [Lien vers vidéos tutoriels]

#### Communauté
- **Discord** : [Lien serveur Discord]
- **Forum** : [Lien forum communauté]

---

## 📝 Post-Installation

### Prochaines Étapes Recommandées

1. **Personnalisation Avancée** (1-2 heures)
   - Couleurs et typographie détaillées
   - Configuration sections homepage
   - Paramétrage footer et newsletter

2. **Configuration E-commerce** (2-3 heures)
   - Setup pages produit
   - Configuration panier et checkout
   - Apps recommandées

3. **SEO et Performance** (1 heure)
   - Meta tags et descriptions
   - Google Analytics
   - Optimisation images

4. **Tests Complets** (1 heure)
   - Parcours d'achat complet
   - Tests multi-appareils
   - Validation formulaires

### Sauvegarde Finale

Une fois tout configuré :
1. **Dupliquez le thème** configuré
2. **Nommez la sauvegarde** : "Taiga Bubbly - Config Finale [Date]"
3. **Publiez le thème** quand satisfait

---

## 📊 Métriques de Succès

Après installation, surveillez :

### Performance
- **Lighthouse Score** : 90+ performance
- **Temps de chargement** : < 3 secondes
- **Core Web Vitals** : Tous verts

### Conversion
- **Taux de conversion** : Baseline vs après installation
- **Temps sur site** : Amélioration attendue
- **Pages par session** : Augmentation espérée

### Accessibilité
- **Score accessibilité** : 95+ Lighthouse
- **Navigation clavier** : 100% fonctionnelle
- **Screen readers** : Compatible

---

*Guide d'installation - Version 1.0 - Juin 2024*
*Pour les mises à jour : [lien documentation en ligne]* 