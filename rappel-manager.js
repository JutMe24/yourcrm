class RappelManager {
    constructor() {
        this.rappels = this.chargerRappels();
        this.verifierRappels();
        setInterval(() => this.verifierRappels(), 60000); // Vérifie toutes les minutes
        
        // Enregistrement du Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/'
                    });
                    console.log('ServiceWorker enregistré avec succès:', registration);
                    
                    // Vérification de l'état du Service Worker
                    if (registration.installing) {
                        console.log('Service Worker en cours d\'installation');
                    } else if (registration.waiting) {
                        console.log('Service Worker installé');
                    } else if (registration.active) {
                        console.log('Service Worker actif');
                    }
                    
                    this.serviceWorkerRegistration = registration;
                } catch (error) {
                    console.error("Erreur d'enregistrement du ServiceWorker:", error);
                }
            });
        }
        
        // Forcer la demande de permission au démarrage
        this.demanderPermissionNotifications();
    }

    chargerRappels() {
        return JSON.parse(localStorage.getItem('gpa_rappels') || '[]');
    }

    sauvegarderRappels() {
        localStorage.setItem('gpa_rappels', JSON.stringify(this.rappels));
    }

    ajouterRappel(rappel) {
        // Utiliser directement la date locale sans conversion problématique
        const dateRappel = new Date(rappel.dateRappel);
        
        const nouveauRappel = {
            id: 'rappel-' + Date.now(),
            dateCreation: new Date().toISOString(),
            dateRappel: dateRappel.toISOString(), // Stocker en ISO standard
            statut: 'planifie',
            notificationEnvoyee: false,
            devisId: rappel.devisId,
            notes: rappel.notes
        };
        
        this.rappels.push(nouveauRappel);
        this.sauvegarderRappels();
        return nouveauRappel;
    }

    verifierRappels() {
        const maintenant = new Date();
        const dans15min = new Date(maintenant.getTime() + 15 * 60000);
        
        // Rappels en retard
        const rappelsDeclenches = this.rappels.filter(r => 
            r.statut === 'planifie' && 
            new Date(r.dateRappel) <= maintenant
        );

        // Rappels dans les 15 prochaines minutes (pas encore notifiés)
        const rappelsAVenir = this.rappels.filter(r => 
            r.statut === 'planifie' && 
            new Date(r.dateRappel) > maintenant && 
            new Date(r.dateRappel) <= dans15min &&
            !r.notificationEnvoyee
        );

        // Gérer les rappels à venir (notification 15min avant)
        rappelsAVenir.forEach(rappel => {
            this.envoyerNotificationAvantRappel(rappel);
            rappel.notificationEnvoyee = true;
        });

        // Gérer les rappels en retard
        rappelsDeclenches.forEach(rappel => {
            this.declencherRappel(rappel);
            rappel.statut = 'declenche';
        });

        if (rappelsDeclenches.length > 0 || rappelsAVenir.length > 0) {
            this.sauvegarderRappels();
        }
    }

    async declencherRappel(rappel) {
        console.log('🔔 Déclenchement du rappel:', rappel);
        
        // Mettre à jour le statut du rappel
        rappel.statut = 'termine';
        rappel.dateDernierDeclenchement = new Date().toISOString();
        this.sauvegarderRappels();

        // Préparer les données de notification
        const notificationData = {
            title: `⏰ Rappel Devis #${rappel.devisId}`,
            body: rappel.notes || 'Rappel de suivi',
            icon: '/icon-192x192.png',
            data: {
                url: window.location.href,
                devisId: rappel.devisId,
                timestamp: Date.now()
            },
            tag: `rappel-${rappel.id}`,
            renotify: true,
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200, 100, 200]
        };

        // Essayer d'utiliser le service worker pour les notifications push
        try {
            // Vérifier si le service worker est prêt
            const registration = await navigator.serviceWorker.ready;
            
            // Envoyer la notification via le service worker
            await registration.showNotification(notificationData.title, {
                body: notificationData.body,
                icon: notificationData.icon,
                data: notificationData.data,
                tag: notificationData.tag,
                renotify: notificationData.renotify,
                requireInteraction: notificationData.requireInteraction,
                vibrate: notificationData.vibrate
            });
            
            console.log('✅ Notification push envoyée avec succès');
        } catch (error) {
            console.error('❌ Erreur avec la notification push, tentative avec Notification API:', error);
            
            // Fallback à l'API Notification standard
            if (Notification.permission === 'granted' || localStorage.getItem('notificationPermission') === 'granted') {
                try {
                    const notification = new Notification(notificationData.title, {
                        body: notificationData.body,
                        icon: notificationData.icon,
                        tag: notificationData.tag,
                        requireInteraction: true
                    });
                    console.log('✅ Notification standard affichée');
                    setTimeout(() => notification.close(), 10000);
                } catch (err) {
                    console.error('❌ Erreur avec la notification standard:', err);
                }
            } else {
                console.warn('⚠️ Permission de notification non accordée');
            }
        }

        // Envoyer un email de rappel
        await this.envoyerEmailRappel(rappel);
    }
    
    afficherNotificationStandard(options) {
        if (Notification.permission === 'granted' || localStorage.getItem('notificationPermission') === 'granted') {
            try {
                const notification = new Notification('⏰ Rappel', options);
                console.log('✅ Notification standard affichée');
                setTimeout(() => notification.close(), 10000);
            } catch (error) {
                console.error('❌ Erreur avec la notification standard:', error);
            }
        } else {
            console.warn('⚠️ Permission de notification non accordée');
        }
    }

    async envoyerNotificationAvantRappel(rappel) {
        console.log('⏰ Notification avant rappel:', rappel);
        
        // Notification navigateur 15 minutes avant
        if (Notification.permission === 'granted' || localStorage.getItem('notificationPermission') === 'granted') {
            try {
                const notification = new Notification('⏰ Rappel imminent', {
                    body: `Devis #${rappel.devisId}: ${rappel.notes || 'Rappel prévu dans 15 minutes'}`,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF9800"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/></svg>',
                    requireInteraction: false,
                    tag: `avant-rappel-${rappel.id}`
                });
                
                console.log('✅ Notification avant rappel affichée');
                setTimeout(() => notification.close(), 5000);
            } catch (error) {
                console.error('❌ Erreur lors de la notification avant rappel:', error);
            }
        } else {
            console.warn('⚠️ Permission de notification non accordée pour avant-rappel:', Notification.permission);
        }

        // Email de rappel 15 minutes avant
        await this.envoyerEmailRappel(rappel, true);
    }

    async envoyerEmailRappel(rappel, estAvantRappel = false) {
        console.log('📧 Envoi d\'email de rappel:', { rappel, estAvantRappel });
        
        try {
            // Récupérer la configuration email avec gestion d'erreur robuste
            let emailConfig = {};
            try {
                const configStr = localStorage.getItem('gpa_email_config');
                if (configStr) {
                    // Vérifier si la chaîne commence par "{" (JSON valide)
                    if (configStr.trim().startsWith('{')) {
                        emailConfig = JSON.parse(configStr);
                    } else {
                        console.warn('⚠️ Configuration email corrompue, nettoyage et utilisation du mode démo');
                        localStorage.removeItem('gpa_email_config');
                    }
                }
            } catch (parseError) {
                console.warn('⚠️ Erreur parsing configuration email, nettoyage:', parseError.message);
                localStorage.removeItem('gpa_email_config');
            }
            
            if (!emailConfig || !emailConfig.smtp) {
                console.warn('⚠️ Configuration email non trouvée, utilisation du mode démo');
                // Mode démo : afficher une alerte au lieu d'envoyer un email
                const sujet = estAvantRappel 
                    ? `[Rappel 15min] Suivi devis #${rappel.devisId}`
                    : `[Rappel] Suivi devis #${rappel.devisId}`;
                
                const devisInfo = this.getDevisInfo(rappel.devisId);
                const message = this.formaterMessageEmail(rappel, devisInfo, estAvantRappel);
                
                alert(`📧 EMAIL SIMULÉ:\n\n${sujet}\n\n${message}`);
                console.log('📧 Email simulé affiché:', { sujet, message });
                
                // Stocker l'email simulé
                this.stockerEmailEnvoye(rappel, sujet, message, estAvantRappel);
                return;
            }

            const devisInfo = this.getDevisInfo(rappel.devisId);
            const sujet = estAvantRappel 
                ? `[Rappel 15min] Suivi devis #${rappel.devisId}`
                : `[Rappel] Suivi devis #${rappel.devisId}`;
            
            const message = this.formaterMessageEmail(rappel, devisInfo, estAvantRappel);
            const destinataire = 'contact@partenaireassurances.com';

            // Envoyer l'email via le serveur SMTP
            try {
                const response = await fetch('http://localhost:3001/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: destinataire,
                        subject: sujet,
                        text: message.trim(),
                        from: emailConfig.from || 'noreply@partenaireassurances.com'
                    })
                });

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }

                console.log('📧 Email envoyé avec succès à:', destinataire, { sujet });
            } catch (error) {
                console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
                throw error; // Propage l'erreur pour être gérée par le bloc catch parent
            }

            // Stocker l'email envoyé
            this.stockerEmailEnvoye(rappel, sujet, message, estAvantRappel);

        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
            // En cas d'erreur, afficher un message à l'utilisateur
            alert(`❌ Erreur lors de l'envoi de l'email: ${error.message}`);
        }
    }
    
    formaterMessageEmail(rappel, devisInfo, estAvantRappel) {
        return `
Bonjour,

${estAvantRappel ? 'Rappel dans 15 minutes' : 'Rappel'} pour le suivi du devis #${rappel.devisId}.

${devisInfo ? `
Informations du devis:
- Client: ${devisInfo.client}
- Véhicule: ${devisInfo.vehicule}
- Montant: ${devisInfo.montant}€
` : ''}

Notes: ${rappel.notes || 'Aucune note spécifiée'}

Date du rappel: ${new Date(rappel.dateRappel).toLocaleString('fr-FR')}

Cordialement,
GPA - Groupe Partenaire des Assurances
        `.trim();
    }
    
    stockerEmailEnvoye(rappel, sujet, message, estAvantRappel) {
        try {
            const emailEnvoye = {
                id: 'email-' + Date.now(),
                sujet,
                message,
                dateEnvoi: new Date().toISOString(),
                rappelId: rappel.id,
                type: estAvantRappel ? 'avant-rappel' : 'rappel'
            };

            const emailsEnvoyes = JSON.parse(localStorage.getItem('gpa_emails_envoyes') || '[]');
            emailsEnvoyes.push(emailEnvoye);
            localStorage.setItem('gpa_emails_envoyes', JSON.stringify(emailsEnvoyes));
            
            console.log('✅ Email stocké:', emailEnvoye);
        } catch (error) {
            console.error('❌ Erreur lors du stockage de l\'email:', error);
        }
    }
    
    async demanderPermissionNotifications() {
        console.log('🔔 Vérification des permissions de notification...');
        
        // Vérifier d'abord si on a déjà une permission enregistrée
        const savedPermission = localStorage.getItem('notificationPermission');
        
        if (savedPermission === 'granted' || savedPermission === 'denied') {
            console.log('📋 Permission déjà définie:', savedPermission);
            return savedPermission;
        }

        if (Notification.permission === 'default') {
            console.log('📤 Demande de permission de notification...');
            try {
                const permission = await Notification.requestPermission();
                localStorage.setItem('notificationPermission', permission);
                console.log('✅ Permission de notification:', permission);
                
                if (permission === 'granted') {
                    new Notification('✅ Notifications activées', {
                        body: 'Les notifications de rappel sont maintenant actives',
                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234CAF50"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>'
                    });
                }
                return permission;
            } catch (error) {
                console.error('❌ Erreur lors de la demande de permission:', error);
                return 'denied';
            }
        } else {
            console.log('ℹ️ Permission de notification déjà:', Notification.permission);
            localStorage.setItem('notificationPermission', Notification.permission);
        }
    }

    getDevisInfo(devisId) {
        try {
            const devis = JSON.parse(localStorage.getItem('gpa_devis') || '[]');
            const devisTrouve = devis.find(d => d.id === devisId);
            
            if (devisTrouve) {
                return {
                    client: `${devisTrouve.nom} ${devisTrouve.prenom || ''}`.trim(),
                    vehicule: `${devisTrouve.marque} ${devisTrouve.modele}`,
                    montant: devisTrouve.cotisation
                };
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des infos du devis:', error);
        }
        return null;
    }

    // Méthode pour l'interface utilisateur
    creerInterfaceRappel(devisId) {
        // Vérifier s'il existe déjà un rappel pour ce devis
        const rappelExistant = this.rappels.find(r => r.devisId === devisId && r.statut === 'planifie');
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; 
            transform: translate(-50%, -50%);
            background: white; padding: 20px; 
            border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000; width: 90%; max-width: 500px;
        `;

        // Formater la date pour l'input datetime-local
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            // Ajuster pour le fuseau horaire local
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60000));
            return localDate.toISOString().slice(0, 16);
        };

        modal.innerHTML = `
            <h3>${rappelExistant ? 'Modifier le rappel' : 'Planifier un rappel'}</h3>
            <div style="margin: 15px 0;">
                <label style="display: block; margin-bottom: 5px;">Date et heure du rappel</label>
                <input type="datetime-local" id="rappel-date" 
                       value="${rappelExistant ? formatDateForInput(rappelExistant.dateRappel) : ''}" 
                       min="${new Date().toISOString().slice(0, 16)}"
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="margin: 15px 0;">
                <label style="display: block; margin-bottom: 5px;">Notes (optionnel)</label>
                <textarea id="rappel-notes" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-height: 100px;">${rappelExistant?.notes || ''}</textarea>
            </div>
            ${rappelExistant ? `
            <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px; font-size: 0.9em;">
                <strong>Créé le :</strong> ${new Date(rappelExistant.dateCreation).toLocaleString()}
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <div>
                    ${rappelExistant ? `
                    <button id="supprimer-rappel" style="padding: 8px 16px; background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 4px; cursor: pointer;">
                        Supprimer le rappel
                    </button>` : ''}
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="annuler-rappel" style="padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;">
                        Annuler
                    </button>
                    <button id="valider-rappel" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        ${rappelExistant ? 'Mettre à jour' : 'Planifier'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fermer la modale
        modal.querySelector('#annuler-rappel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Gérer la suppression d'un rappel existant
        if (rappelExistant) {
            const supprimerBtn = modal.querySelector('#supprimer-rappel');
            if (supprimerBtn) {
                supprimerBtn.addEventListener('click', () => {
                    if (confirm('Voulez-vous vraiment supprimer ce rappel ?')) {
                        this.rappels = this.rappels.filter(r => r.id !== rappelExistant.id);
                        this.sauvegarderRappels();
                        alert('Rappel supprimé avec succès');
                        document.body.removeChild(modal);
                    }
                });
            }
        }

        // Valider ou mettre à jour le rappel
        modal.querySelector('#valider-rappel').addEventListener('click', () => {
            const dateInput = modal.querySelector('#rappel-date');
            const notes = modal.querySelector('#rappel-notes').value;
            
            if (!dateInput.value) {
                alert('Veuillez sélectionner une date et une heure');
                return;
            }

            // Si c'est une mise à jour, supprimer l'ancien rappel
            if (rappelExistant) {
                this.rappels = this.rappels.filter(r => r.id !== rappelExistant.id);
            }

            const action = rappelExistant ? 'mis à jour' : 'planifié';
            const rappel = this.ajouterRappel({
                devisId,
                dateRappel: dateInput.value,
                notes,
                // Conserver l'ID existant pour les mises à jour
                ...(rappelExistant && { id: rappelExistant.id })
            });

            alert(`Rappel ${action} pour le ${new Date(rappel.dateRappel).toLocaleString()}`);
            document.body.removeChild(modal);
        });
    }
}

// Gestion des autorisations de notification
const initNotifications = () => {
    // Ne demander la permission que si ce n'est pas déjà fait et si ce n'est pas déjà refusé
    if (Notification.permission === 'default' && !localStorage.getItem('notificationPermissionRequested')) {
        Notification.requestPermission().then(permission => {
            localStorage.setItem('notificationPermission', permission);
            console.log('Permission de notification:', permission);
        });
        localStorage.setItem('notificationPermissionRequested', 'true');
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.rappelManager = new RappelManager();
    
    // Ajouter un bouton de test dans la console
    window.testRappelSystem = () => {
        console.log('🧪 Test du système de rappels...');
        
        // Test notification
        if (Notification.permission === 'granted') {
            new Notification('🧪 Test Notification', {
                body: 'Ceci est un test de notification',
                icon: 'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%234CAF50\"><path d=\"M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z\"/></svg>',
                requireInteraction: false
            });
            console.log('✅ Test notification envoyé');
        } else {
            console.warn('❌ Permission de notification non accordée');
        }
        
        // Test email
        const testRappel = {
            id: 'test-' + Date.now(),
            devisId: 'TEST-001',
            notes: 'Ceci est un rappel de test',
            dateRappel: new Date().toISOString()
        };
        
        window.rappelManager.envoyerEmailRappel(testRappel, false);
    };
    
    console.log('🔧 Système de rappels initialisé');
    console.log('💡 Pour tester: tapez testRappelSystem() dans la console');
});
