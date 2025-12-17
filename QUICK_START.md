# ⚡ Quick Start - InstaConnect WebApp

**Démarrez en 5 minutes !**

## 🚀 Installation ultra-rapide

### 1️⃣ Prérequis (une seule fois)

**Vérifiez Node.js :**
```bash
node --version
# Si ça affiche v16+ → Parfait !
# Sinon → Installez depuis https://nodejs.org
```

### 2️⃣ Installation (2 minutes)

```bash
# 1. Ouvrir le dossier du projet
cd instaconnect-webapp

# 2. Installer les dépendances
npm install
# ⏳ Attendez 1-2 minutes...

# 3. Lancer l'application
npm run dev
```

### 3️⃣ C'est prêt ! 🎉

Ouvrez votre navigateur sur : **http://localhost:3000**

## 🎯 Premiers pas

### Créer un compte
1. Cliquez sur "S'inscrire"
2. Entrez votre email et mot de passe
3. C'est tout ! Vous êtes connecté

### Ajouter votre premier contact
1. Cliquez sur le bouton **➕** en bas à droite
2. Remplissez les informations :
   - Instagram (obligatoire) : `@username`
   - Prénom (obligatoire) : `Jean`
   - Sexe : `👨 Homme` ou `👩 Femme`
   - Type de relation : `👥 Ami`
   - Lieu : `🌍 IRL`
   - Statut : `💬 Déjà parlé`
3. Cliquez sur "Ajouter"

### Explorer l'application
- **👥 Contacts** : Liste de tous vos contacts
- **📊 Stats** : Statistiques détaillées
- **⚙️ Profil** : Paramètres et déconnexion

## 🎨 Personnalisation rapide

### Activer le mode sombre
1. Allez dans **⚙️ Profil**
2. Activez le switch **🌙 Mode sombre**

### Filtrer vos contacts
1. Sur la page **👥 Contacts**
2. Cliquez sur un filtre (Sexe, Type de relation, etc.)
3. Cochez les options voulues

### Rechercher un contact
Tapez directement dans la barre de recherche 🔍

## 🔧 Commandes essentielles

```bash
# Lancer en développement
npm run dev

# Arrêter le serveur
Ctrl + C

# Construire pour production
npm run build

# Voir le build de production
npm run preview
```

## 📱 Utilisation

### Sur ordinateur
- URL : http://localhost:3000
- Rechargement automatique à chaque modification

### Sur mobile (même réseau WiFi)
1. Trouvez votre IP locale :
   - Windows : `ipconfig`
   - Mac/Linux : `ifconfig`
2. Lancez avec : `npm run dev -- --host`
3. Accédez depuis mobile : `http://[votre-ip]:3000`

## 🚀 Déployer en ligne (optionnel)

### Option 1 : Vercel (recommandé - 2 minutes)

1. Créez un compte sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre dépôt GitHub
4. Cliquez sur "Deploy"
5. ✅ Votre app est en ligne !

URL automatique : `https://votre-app.vercel.app`

### Option 2 : Netlify (alternatif - 2 minutes)

1. Créez un compte sur [netlify.com](https://netlify.com)
2. Glissez-déposez le dossier `dist/` après `npm run build`
3. ✅ En ligne !

## 📚 Documentation complète

Si vous voulez plus de détails :

1. **README.md** - Vue d'ensemble
2. **SETUP_GUIDE.md** - Guide détaillé
3. **MIGRATION_GUIDE.md** - Migration depuis l'ancienne version
4. **PROJECT_SUMMARY.md** - Résumé complet du projet

## ❓ Problèmes fréquents

### ❌ "npm: command not found"
→ Installez Node.js depuis [nodejs.org](https://nodejs.org)

### ❌ Port 3000 déjà utilisé
```bash
# Utilisez un autre port
npm run dev -- --port 3001
```

### ❌ "Cannot find module"
```bash
# Réinstallez les dépendances
rm -rf node_modules
npm install
```

### ❌ Page blanche
→ Ouvrez la console du navigateur (F12) et vérifiez les erreurs

## 🎯 Prochaines étapes

✅ **Maintenant que ça fonctionne :**
1. Ajoutez quelques contacts
2. Explorez les statistiques
3. Testez les filtres
4. Activez le mode sombre

📖 **Pour aller plus loin :**
1. Lisez le README.md complet
2. Explorez le code dans `src/`
3. Personnalisez les couleurs dans `src/styles/index.css`
4. Ajoutez vos propres fonctionnalités

🚀 **Pour déployer :**
1. Suivez SETUP_GUIDE.md section "Déploiement"
2. Choisissez Vercel pour la simplicité
3. Partagez votre app avec le monde !

## 💡 Conseils

- **Sauvegarde automatique** : Toutes vos données sont dans Firebase
- **Mode hors ligne** : Les données se synchronisent automatiquement
- **Multi-appareils** : Connectez-vous sur n'importe quel appareil
- **Sécurité** : Vos données sont privées et cryptées

## 🎉 C'est parti !

Vous êtes prêt à utiliser InstaConnect !

**Commande magique :**
```bash
cd instaconnect-webapp && npm install && npm run dev
```

**Puis ouvrez** : http://localhost:3000

---

**Besoin d'aide ?** Consultez les autres fichiers de documentation ou créez une issue sur GitHub.

**Bon développement ! 🚀**
