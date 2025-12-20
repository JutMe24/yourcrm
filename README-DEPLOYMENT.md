# Déploiement GPA Assurance sur LWS

## Prérequis
- Un hébergement LWS avec support Node.js
- Un domaine configuré
- Accès FTP ou au gestionnaire de fichiers LWS

## Étapes de déploiement

### 1. Préparation locale
```bash
# Installer les dépendances
npm install

# Créer l'archive de déploiement
npm run deploy
```

### 2. Configuration sur LWS

#### a) Transfert des fichiers
1. Connectez-vous au panneau LWS
2. Allez dans "Gestionnaire de fichiers"
3. Uploadez `gpa-assurance-deploy.tar.gz`
4. Décompressez l'archive dans le répertoire principal

#### b) Configuration des variables d'environnement
1. Renommez `.env.production` en `.env`
2. Modifiez les valeurs suivantes:
   ```
   BASE_URL=https://votredomaine.lws.fr
   SMTP_USER=votre-email@votredomaine.fr
   SMTP_PASS=votre-mot-de-passe-email
   COMPANY_EMAIL=contact@votredomaine.fr
   ```

#### c) Configuration Node.js
1. Dans le panneau LWS, allez dans "Node.js"
2. Activez Node.js
3. Sélectionnez la version 18.x ou supérieure
4. Fichier de démarrage: `server.js`
5. Port: 3000
6. Cliquez sur "Redémarrer"

### 3. Vérification
1. Testez l'accès à: `https://votredomaine.lws.fr`
2. Vérifiez que l'interface fonctionne
3. Testez la génération de devis PDF
4. Testez l'envoi d'emails

## Fichiers importants

- `server.js` - Serveur principal Express
- `config-production.js` - Configuration production
- `.env` - Variables d'environnement
- `public/` - Fichiers statiques
- `smtp-server.js` - Serveur SMTP pour les emails

## Dépannage

### Le serveur ne démarre pas
- Vérifiez que Node.js est activé dans LWS
- Vérifiez les logs dans le panneau LWS
- Assurez-vous que le port 3000 est disponible

### Les emails ne s'envoient pas
- Vérifiez la configuration SMTP dans `.env`
- Testez avec les identifiants LWS fournis
- Vérifiez que le serveur SMTP tourne

### Les PDF ne se génèrent pas
- Vérifiez que le dossier `pdfs` existe et est writable
- Vérifiez les permissions des fichiers

## Support LWS
- Documentation: https://docs.lws.fr/
- Support: support@lws.fr
