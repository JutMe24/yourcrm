# GPA Assurance Auto - Application Web

Application web professionnelle pour la génération de devis d'assurance automobile avec gestion du serveur SMTP intégrée.

## 🚀 Démarrage Rapide

### Option 1: Avec le bouton dans l'interface (Recommandé)

1. **Lancer le serveur API** :
   ```bash
   npm run dev
   ```
2. **Ouvrir votre navigateur** : `http://localhost:3000`
3. **Utiliser le bouton "Démarrer le serveur SMTP"** dans la barre de navigation

### Option 2: Lancement manuel

1. **Lancer le serveur SMTP** :
   ```bash
   npm run smtp
   ```
2. **Ouvrir l'interface web** : `http://localhost:3001`

## 📋 Scripts disponibles

- `npm run dev` - Démarre le serveur API avec interface web (port 3000)
- `npm run api` - Démarre uniquement le serveur API
- `npm run smtp` - Démarre uniquement le serveur SMTP (port 3001)
- `npm start` - Démarre le serveur SMTP (alias pour `npm run smtp`)

## 🖥️ Interface Web

### Bouton du Serveur SMTP

L'interface inclut un bouton dans la barre de navigation pour gérer le serveur SMTP :

- **État "Arrêté"** (rouge) : Le serveur SMTP n'est pas en cours d'exécution
- **État "Démarrage"** (orange) : Le serveur est en cours de démarrage
- **État "En cours d'exécution"** (vert) : Le serveur fonctionne correctement

### Fonctionnalités

- **Génération de devis PDF** professionnels
- **Gestion des clients** et des véhicules
- **Formules d'assurance** multiples (Tiers, Tiers+, Tous Risques)
- **Envoi d'emails** via le serveur SMTP intégré
- **Interface responsive** pour mobile et desktop

## 📧 Configuration SMTP

Le serveur SMTP est configuré pour fonctionner localement et permettre l'envoi d'emails de test depuis l'application.

## 🔧 Dépendances

```bash
npm install
```

Principales dépendances :
- `express` - Serveur web
- `nodemailer` - Envoi d'emails
- `jspdf` - Génération de PDF
- `cors` - Partage de ressources cross-origin

## 📁 Structure du Projet

```
gpa-assurance-auto/
├── index.html                 # Page principale
├── smtp-server.js            # Serveur SMTP
├── server-api.js             # Serveur API avec gestion SMTP
├── js/
│   ├── smtp-server-manager.js # Gestionnaire du serveur SMTP
│   ├── script.js             # Scripts principaux
│   └── pdf-utils.js          # Utilitaires PDF
├── css/
│   └── style.css             # Styles de l'application
└── package.json              # Configuration du projet
```

## 🌐 Ports Utilisés

- **Port 3000** : Serveur API avec interface web
- **Port 3001** : Serveur SMTP

## 📱 Utilisation

1. **Remplir le formulaire** avec les informations client et véhicule
2. **Sélectionner la formule** d'assurance souhaitée
3. **Générer le devis** en PDF
4. **Envoyer par email** (serveur SMTP requis)

## 🔍 Dépannage

### Le serveur SMTP ne démarre pas

1. Vérifiez que Node.js est installé : `node --version`
2. Vérifiez les dépendances : `npm install`
3. Essayez le lancement manuel : `npm run smtp`

### L'interface ne se charge pas

1. Vérifiez que le serveur API tourne : `npm run dev`
2. Accédez à `http://localhost:3000`
3. Vérifiez la console du navigateur pour les erreurs

### Le bouton SMTP ne fonctionne pas

Si le bouton ne parvient pas à démarrer le serveur SMTP, un modal vous proposera la commande manuelle à exécuter dans un terminal.

## 📞 Support

Pour toute question ou problème, consultez les logs dans la console du terminal où vous avez lancé le serveur.
