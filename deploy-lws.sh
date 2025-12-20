#!/bin/bash

# Script de déploiement pour LWS
echo "Déploiement de GPA Assurance sur LWS..."

# Variables
REMOTE_HOST="votredomaine.lws.fr"
REMOTE_USER="votre-utilisateur-ftp"
REMOTE_PATH="/www"
LOCAL_PATH="./"

# Fichiers à exclure
EXCLUDE_FILES="--exclude=node_modules --exclude=.git --exclude=*.log --exclude=temp --exclude=debug*"

# Synchronisation avec rsync (si disponible) ou FTP
echo "Transfert des fichiers..."

# Créer l'archive de déploiement
tar -czf gpa-assurance-deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    --exclude=temp \
    --exclude=debug* \
    --exclude=devis-dev-*.pdf \
    --exclude=logo.txt \
    .

echo "Archive créée: gpa-assurance-deploy.tar.gz"

# Instructions pour le déploiement manuel sur LWS
echo ""
echo "=== INSTRUCTIONS DE DÉPLOIEMENT LWS ==="
echo ""
echo "1. Connectez-vous à votre panneau LWS"
echo "2. Allez dans 'Gestionnaire de fichiers'"
echo "3. Uploadez le fichier 'gpa-assurance-deploy.tar.gz'"
echo "4. Décompressez l'archive dans le répertoire principal"
echo "5. Renommez '.env.production' en '.env'"
echo "6. Modifiez le fichier .env avec vos vraies informations:"
echo "   - votre-domaine.lws.fr → votre vrai domaine"
echo "   - votre-email@votredomaine.fr → votre vrai email"
echo "   - votre-mot-de-passe-email → votre vrai mot de passe"
echo ""
echo "7. Dans le panneau LWS, allez dans 'Node.js':"
echo "   - Activez Node.js"
echo "   - Sélectionnez la version 18.x ou 20.x"
echo "   - Pointez sur 'server.js' comme fichier de démarrage"
echo "   - Configurez le port 3000"
echo ""
echo "8. Redémarrez le service Node.js"
echo "9. Testez votre application sur https://votredomaine.lws.fr"
echo ""
echo "=== FIN DES INSTRUCTIONS ==="
