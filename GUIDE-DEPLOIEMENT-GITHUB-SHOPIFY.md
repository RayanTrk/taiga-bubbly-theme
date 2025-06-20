# 🚀 Guide de Déploiement GitHub → Shopify

## 📋 Vue d'ensemble

Cette méthode est **plus fiable** que le téléchargement de fichiers ZIP et offre plusieurs avantages :
- ✅ **Versioning** : Historique complet des modifications
- ✅ **Collaboration** : Travail en équipe facilité
- ✅ **Déploiement continu** : Mises à jour automatiques
- ✅ **Backup automatique** : Sauvegarde sur GitHub
- ✅ **Shopify CLI** : Outils de développement avancés

## 🔧 Prérequis

### 1. **Comptes requis :**
- ✅ Compte GitHub (gratuit)
- ✅ Accès admin à votre boutique Shopify
- ✅ Node.js installé (pour Shopify CLI)

### 2. **Outils à installer :**
```bash
# Installer Shopify CLI
npm install -g @shopify/cli @shopify/theme
```

## 📁 Étape 1 : Préparation du Repository

### **Nettoyer le projet :**
```bash
# Supprimer les fichiers temporaires
git add .
git commit -m "feat: Thème Taiga Bubbly complet avec toutes les sections"
```

### **Structure finale du thème :**
```
shopi/
├── assets/          # CSS, JS, images
├── config/          # Configuration du thème
├── layout/          # theme.liquid (obligatoire)
├── locales/         # Traductions
├── sections/        # Sections Liquid
├── snippets/        # Composants réutilisables
├── templates/       # Templates de pages
└── README.md        # Documentation
```

## 📤 Étape 2 : Pousser sur GitHub

### **Option A : Repository existant**
```bash
# Ajouter tous les fichiers
git add .

# Commit avec message descriptif
git commit -m "feat: Thème Taiga Bubbly - Version finale pour Shopify

- Design énergique avec palette Bubbly officielle
- 9 sections de page d'accueil complètes
- Navigation IA et performance optimisée
- Fonctionnalités e-commerce avancées
- Responsive design et SEO optimisé"

# Pousser vers GitHub
git push origin main
```

### **Option B : Nouveau repository**
```bash
# Initialiser git (si pas déjà fait)
git init

# Ajouter remote GitHub
git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git

# Premier push
git add .
git commit -m "feat: Thème Taiga Bubbly initial"
git branch -M main
git push -u origin main
```

## 🔗 Étape 3 : Connecter GitHub à Shopify

### **Méthode 1 : Shopify CLI (Recommandée)**

#### **1. Installation et authentification :**
```bash
# Installer Shopify CLI
npm install -g @shopify/cli

# Se connecter à Shopify
shopify auth login
```

#### **2. Connecter le thème :**
```bash
# Aller dans le dossier du thème
cd C:\Users\AZ\OneDrive - Collège la Cité\Bureau\shopi

# Connecter au store Shopify
shopify theme init

# Ou pousser directement
shopify theme push --store=VOTRE-STORE.myshopify.com
```

#### **3. Développement en temps réel :**
```bash
# Mode développement avec sync automatique
shopify theme dev --store=VOTRE-STORE.myshopify.com

# Cela va :
# - Créer un thème de développement
# - Synchroniser les changements en temps réel
# - Ouvrir une URL de prévisualisation
```

### **Méthode 2 : GitHub Integration (Alternative)**

#### **1. Dans l'admin Shopify :**
1. Allez dans **Boutique en ligne > Thèmes**
2. Cliquez sur **Ajouter un thème**
3. Sélectionnez **Connecter depuis GitHub**

#### **2. Autoriser GitHub :**
1. Connectez votre compte GitHub
2. Sélectionnez le repository `shopi`
3. Choisissez la branche `main`
4. Confirmez la connexion

#### **3. Synchronisation automatique :**
- Chaque `git push` mettra à jour le thème
- Les changements apparaîtront dans l'admin Shopify
- Possibilité de publier depuis l'interface

## ⚙️ Étape 4 : Configuration Shopify CLI

### **Fichier de configuration `.shopifyignore` :**
```bash
# Créer le fichier .shopifyignore
cat > .shopifyignore << 'EOF'
# Fichiers de développement
node_modules/
.git/
.github/
.vscode/
.cursor/

# Fichiers temporaires
*.zip
temp-*/
reports/
scripts/

# Documentation
docs/
*.md
!README.md

# Fichiers de configuration
package*.json
*.js
!assets/*.js
lighthouserc.js
performance-budget.json
EOF
```

### **Configuration du projet :**
```bash
# Créer shopify.theme.toml
cat > shopify.theme.toml << 'EOF'
[environments.development]
store = "VOTRE-STORE.myshopify.com"
theme = "THEME-ID"

[environments.production]
store = "VOTRE-STORE.myshopify.com"
theme = "THEME-ID"
EOF
```

## 🚀 Étape 5 : Déploiement et Tests

### **1. Déploiement initial :**
```bash
# Pousser le thème vers Shopify
shopify theme push --allow-live

# Ou créer un thème de développement
shopify theme push --development
```

### **2. Prévisualisation :**
```bash
# Lancer le serveur de développement
shopify theme dev

# Cela ouvrira automatiquement :
# https://VOTRE-STORE.myshopify.com/?preview_theme_id=THEME_ID
```

### **3. Publication :**
```bash
# Publier le thème en live
shopify theme publish --theme=THEME_ID
```

## 📋 Workflow de Développement Recommandé

### **1. Développement local :**
```bash
# Créer une branche pour les modifications
git checkout -b feature/nouvelle-fonctionnalite

# Modifier les fichiers
# Tester avec shopify theme dev

# Commit et push
git add .
git commit -m "feat: Nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite
```

### **2. Déploiement :**
```bash
# Merger dans main
git checkout main
git merge feature/nouvelle-fonctionnalite

# Pousser vers Shopify
shopify theme push --allow-live

# Ou automatiquement via GitHub Actions
git push origin main
```

## 🔧 Dépannage

### **Erreurs communes :**

#### **"Theme not found"**
```bash
# Lister les thèmes disponibles
shopify theme list

# Utiliser l'ID correct
shopify theme push --theme=123456789
```

#### **"Authentication failed"**
```bash
# Se reconnecter
shopify auth logout
shopify auth login
```

#### **"Invalid theme structure"**
```bash
# Vérifier la structure
shopify theme check

# Corriger les erreurs Liquid
shopify theme check --fail-level=error
```

## 📊 Avantages de cette Méthode

### **Pour le développement :**
- ✅ **Hot reload** : Changements instantanés
- ✅ **Validation** : Vérification automatique du code
- ✅ **Backup** : Sauvegarde automatique sur GitHub
- ✅ **Collaboration** : Travail en équipe facilité

### **Pour la production :**
- ✅ **Déploiement rapide** : Push en une commande
- ✅ **Rollback facile** : Retour à une version précédente
- ✅ **CI/CD** : Intégration continue possible
- ✅ **Monitoring** : Suivi des performances

## 🎯 Prochaines Étapes

1. **Installer Shopify CLI** : `npm install -g @shopify/cli`
2. **Pousser sur GitHub** : `git push origin main`
3. **Connecter à Shopify** : `shopify theme push`
4. **Tester le thème** : `shopify theme dev`
5. **Publier** : `shopify theme publish`

---

## 🎉 Résultat Final

Avec cette méthode, vous aurez :
- 🔄 **Synchronisation automatique** GitHub ↔ Shopify
- ⚡ **Développement en temps réel** avec hot reload
- 📱 **Prévisualisation instantanée** sur mobile et desktop
- 🛡️ **Backup automatique** de tous vos changements
- 🚀 **Déploiement professionnel** en une commande

**Cette approche est utilisée par tous les développeurs Shopify professionnels !** 