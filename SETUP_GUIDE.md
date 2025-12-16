# 🚀 Guide de Configuration - InstaConnect WebApp

Ce guide vous accompagne pas à pas pour mettre en place votre application React InstaConnect.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation initiale](#installation-initiale)
3. [Structure du projet](#structure-du-projet)
4. [Lancement de l'application](#lancement-de-lapplication)
5. [Déploiement](#déploiement)
6. [Migration React Native](#migration-react-native)
7. [Résolution des problèmes](#résolution-des-problèmes)

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

### Node.js et npm
- **Node.js** version 16 ou supérieure
- Vérifiez votre version :
  ```bash
  node --version  # devrait afficher v16.x.x ou supérieur
  npm --version   # devrait afficher 8.x.x ou supérieur
  ```

**Installation Node.js :**
- Windows/Mac : Téléchargez depuis [nodejs.org](https://nodejs.org)
- Linux : `sudo apt install nodejs npm` ou équivalent

### Git (optionnel mais recommandé)
```bash
git --version
```

## 📦 Installation initiale

### 1. Récupérer le projet

**Option A : Avec Git**
```bash
git clone https://github.com/votre-username/instaconnect-webapp.git
cd instaconnect-webapp
```

**Option B : Sans Git**
- Téléchargez et décompressez le dossier `instaconnect-webapp`
- Ouvrez un terminal dans ce dossier

### 2. Installer les dépendances

```bash
npm install
```

Cette commande va installer toutes les dépendances nécessaires (React, Firebase, etc.). Cela peut prendre quelques minutes.

**Que fait cette commande ?**
- Lit le fichier `package.json`
- Télécharge tous les packages nécessaires dans `node_modules/`
- Crée un fichier `package-lock.json` pour verrouiller les versions

### 3. Vérifier l'installation

```bash
npm run dev
```

Si tout fonctionne, vous devriez voir :
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Ouvrez votre navigateur sur `http://localhost:3000` 🎉

## 🏗️ Structure du projet

```
instaconnect-webapp/
│
├── public/                    # Fichiers statiques
│   └── icon.png              # Icône de l'application
│
├── src/                       # Code source principal
│   │
│   ├── components/           # Composants réutilisables
│   │   ├── BottomNav.jsx           # Navigation en bas
│   │   ├── ContactCard.jsx         # Carte d'un contact
│   │   ├── ContactModal.jsx        # Modal d'ajout/édition
│   │   ├── EmptyState.jsx          # État vide (pas de contacts)
│   │   ├── FilterBar.jsx           # Barre de filtres
│   │   ├── LoadingSpinner.jsx      # Spinner de chargement
│   │   ├── ProtectedRoute.jsx      # Protection des routes
│   │   └── SearchBar.jsx           # Barre de recherche
│   │
│   ├── contexts/             # Gestion de l'état global
│   │   ├── AuthContext.jsx         # État d'authentification
│   │   └── AppContext.jsx          # État de l'application
│   │
│   ├── pages/                # Pages de l'application
│   │   ├── AuthPage.jsx            # Page de connexion/inscription
│   │   ├── ContactsPage.jsx        # Page des contacts
│   │   ├── LandingPage.jsx         # Page d'accueil animée
│   │   ├── MainApp.jsx             # Container principal
│   │   ├── ProfilePage.jsx         # Page de profil
│   │   └── StatsPage.jsx           # Page des statistiques
│   │
│   ├── services/             # Services externes
│   │   └── firebase.js             # Configuration Firebase
│   │
│   ├── styles/               # Fichiers CSS
│   │   ├── index.css               # Styles globaux
│   │   ├── Landing.css             # Styles page d'accueil
│   │   ├── Auth.css                # Styles authentification
│   │   ├── MainApp.css             # Styles app principale
│   │   ├── Contacts.css            # Styles page contacts
│   │   ├── ContactCard.css         # Styles carte contact
│   │   ├── ContactModal.css        # Styles modal
│   │   ├── Stats.css               # Styles statistiques
│   │   ├── Profile.css             # Styles profil
│   │   ├── BottomNav.css           # Styles navigation
│   │   ├── FilterBar.css           # Styles filtres
│   │   ├── SearchBar.css           # Styles recherche
│   │   ├── EmptyState.css          # Styles état vide
│   │   └── Loading.css             # Styles chargement
│   │
│   ├── App.jsx               # Composant racine avec routes
│   └── main.jsx              # Point d'entrée de l'app
│
├── index.html                # HTML de base
├── package.json              # Dépendances et scripts
├── vite.config.js            # Configuration Vite
├── .eslintrc.cjs             # Configuration ESLint
├── .gitignore                # Fichiers à ignorer par Git
└── README.md                 # Documentation

```

## 🚀 Lancement de l'application

### Mode développement

```bash
npm run dev
```

**Avantages :**
- ⚡ Rechargement automatique à chaque modification
- 🐛 Messages d'erreur détaillés
- 🔍 Source maps pour déboguer

**Accès :**
- Local : `http://localhost:3000`
- Réseau : `http://[votre-ip]:3000` (avec `--host`)

### Build de production

```bash
npm run build
```

**Que fait cette commande ?**
- Compile et optimise tous les fichiers
- Minifie le code (le rend plus petit)
- Génère les fichiers dans `dist/`

**Tester le build :**
```bash
npm run preview
```

## 🌐 Déploiement

### Option 1 : Vercel (Recommandé - le plus simple)

1. **Créer un compte** sur [vercel.com](https://vercel.com)

2. **Importer depuis GitHub**
   - Connectez votre dépôt GitHub
   - Vercel détecte automatiquement Vite
   - Cliquez sur "Deploy"

3. **Configuration automatique** ✅
   - Build Command : `npm run build`
   - Output Directory : `dist`
   - Deployé en quelques secondes !

**Votre app sera sur** : `https://votre-app.vercel.app`

### Option 2 : Netlify

1. **Créer un compte** sur [netlify.com](https://netlify.com)

2. **Deploy depuis GitHub**
   - Connectez votre dépôt
   - Build command : `npm run build`
   - Publish directory : `dist`

3. **Deployment automatique** à chaque push Git !

### Option 3 : Firebase Hosting

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser Firebase dans le projet
firebase init hosting

# Configurer :
# - Public directory : dist
# - Single-page app : Yes
# - GitHub deployment : Optional

# Build et déployer
npm run build
firebase deploy
```

### Option 4 : Serveur manuel

Après `npm run build`, uploadez le contenu de `dist/` sur votre serveur web.

**Important :** Configurez votre serveur pour rediriger toutes les requêtes vers `index.html` (pour React Router).

## 📱 Migration React Native

Votre code React est déjà structuré pour faciliter la migration vers React Native :

### Avantages de cette architecture

✅ **Logique métier réutilisable**
- Les Context (AuthContext, AppContext) peuvent être réutilisés tel quel
- Les fonctions de gestion de données sont identiques

✅ **Structure de composants claire**
- Séparation entre logique et présentation
- Facile à adapter pour React Native

### Étapes pour créer l'app mobile

1. **Créer le projet React Native**
```bash
npx react-native init InstaConnectMobile
```

2. **Réutiliser les contextes**
- Copiez `/src/contexts/` → fonctionne tel quel !
- Même Firebase, même logique

3. **Adapter les composants**
- Remplacez `<div>` par `<View>`
- Remplacez `<input>` par `<TextInput>`
- Remplacez CSS par StyleSheet

4. **Réutiliser la navigation**
- Remplacez React Router par React Navigation
- Même structure de navigation

**Exemple de conversion :**

**React Web :**
```jsx
<div className="contact-card">
  <input type="text" value={name} onChange={handleChange} />
</div>
```

**React Native :**
```jsx
<View style={styles.contactCard}>
  <TextInput value={name} onChangeText={handleChange} />
</View>
```

## 🔧 Résolution des problèmes

### Erreur : "Cannot find module"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur : Port 3000 déjà utilisé

```bash
# Option 1 : Tuer le processus
lsof -ti:3000 | xargs kill -9

# Option 2 : Utiliser un autre port
npm run dev -- --port 3001
```

### Firebase : "Permission denied"

Vérifiez vos règles Firestore :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Build échoue

```bash
# Vérifier ESLint
npm run lint

# Build avec logs détaillés
npm run build -- --debug
```

### App lente en développement

C'est normal ! Le mode dev inclut beaucoup d'outils de debug.
Le build de production (`npm run build`) est optimisé et rapide.

## 📚 Ressources utiles

- **React Documentation** : [react.dev](https://react.dev)
- **Vite Guide** : [vitejs.dev](https://vitejs.dev)
- **Firebase Docs** : [firebase.google.com/docs](https://firebase.google.com/docs)
- **React Router** : [reactrouter.com](https://reactrouter.com)

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez que vous avez la bonne version de Node.js
2. Essayez `npm install` à nouveau
3. Consultez les logs d'erreur complets
4. Cherchez l'erreur sur Google ou Stack Overflow
5. Créez une issue sur GitHub avec les détails

---

**Bon développement ! 🚀**

Si vous avez des questions, n'hésitez pas à ouvrir une issue sur GitHub.
