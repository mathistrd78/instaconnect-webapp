# InstaConnect WebApp

🚀 **InstaConnect** - Votre CRM Instagram professionnel construit avec React

## 📱 À propos

InstaConnect est une application web moderne de gestion de contacts Instagram (CRM) permettant de :
- 👥 Gérer vos contacts Instagram de manière organisée
- 📊 Visualiser des statistiques détaillées
- 🔍 Rechercher et filtrer vos contacts
- 🌙 Mode sombre/clair
- 🔒 Authentification sécurisée avec Firebase
- 💾 Synchronisation cloud automatique

## 🛠️ Technologies

- **React 18** - Framework UI
- **Vite** - Build tool ultra-rapide
- **React Router** - Navigation
- **Firebase** - Authentication & Firestore Database
- **Context API** - State Management
- **CSS Modules** - Styling

## 🚀 Installation

### Prérequis

- Node.js 16+ et npm

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/instaconnect-webapp.git
cd instaconnect-webapp
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer l'application en développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📦 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run preview` - Prévisualise le build de production
- `npm run lint` - Vérifie le code avec ESLint

## 🏗️ Structure du projet

```
instaconnect-webapp/
├── public/              # Fichiers statiques
│   └── icon.png
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── BottomNav.jsx
│   │   ├── ContactCard.jsx
│   │   ├── ContactModal.jsx
│   │   ├── EmptyState.jsx
│   │   ├── FilterBar.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── SearchBar.jsx
│   ├── contexts/        # Context API providers
│   │   ├── AuthContext.jsx
│   │   └── AppContext.jsx
│   ├── pages/          # Pages de l'application
│   │   ├── AuthPage.jsx
│   │   ├── ContactsPage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── MainApp.jsx
│   │   ├── ProfilePage.jsx
│   │   └── StatsPage.jsx
│   ├── services/       # Services externes
│   │   └── firebase.js
│   ├── styles/         # Fichiers CSS
│   ├── App.jsx         # Composant racine
│   └── main.jsx        # Point d'entrée
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🔥 Configuration Firebase

L'application utilise Firebase pour l'authentification et la base de données Firestore.

La configuration est déjà incluse dans `src/services/firebase.js`.

## 🎨 Fonctionnalités principales

### Authentification
- ✅ Inscription / Connexion
- ✅ Réinitialisation du mot de passe
- ✅ Déconnexion automatique après inactivité (10 minutes)
- ✅ Persistence de session

### Gestion des contacts
- ✅ Ajout de contacts avec champs personnalisables
- ✅ Modification et suppression
- ✅ Recherche en temps réel
- ✅ Filtres multiples (sexe, relation, lieu, statut)
- ✅ Champs dynamiques configurables

### Statistiques
- ✅ Nombre total de contacts
- ✅ Répartition par sexe
- ✅ Répartition par type de relation
- ✅ Répartition par lieu de rencontre
- ✅ Répartition par statut de discussion
- ✅ Profils complets vs incomplets

### Paramètres
- ✅ Mode sombre / clair
- ✅ Informations utilisateur
- ✅ Déconnexion

## 📱 PWA (Progressive Web App)

L'application est configurée comme une PWA et peut être installée sur mobile et desktop pour une expérience native.

## 🔄 Migration depuis l'ancienne version

Si vous migrez depuis l'ancienne version HTML/JS, vos données Firebase restent compatibles. L'application React utilisera automatiquement votre base de données existante.

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`.

### Déploiement recommandé

- **Vercel** (recommandé)
- **Netlify**
- **Firebase Hosting**
- **GitHub Pages**

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails

## 🎯 Roadmap

- [ ] Mode hors-ligne avec synchronisation
- [ ] Export des données (CSV, JSON)
- [ ] Import de contacts depuis Instagram
- [ ] Notifications push
- [ ] Champs personnalisés avancés
- [ ] Application mobile React Native

## 👨‍💻 Auteur

InstaConnect - Votre CRM Instagram professionnel

---

⭐ Si vous aimez ce projet, n'hésitez pas à lui donner une étoile sur GitHub !
