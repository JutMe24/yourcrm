const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configuration du transporteur SMTP
const createTransporter = (config) => {
    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465, // true pour 465, false pour autres ports
        auth: {
            user: config.username,
            pass: config.password
        }
    });
};

// Route pour envoyer l'email
app.post('/send-email', async (req, res) => {
    try {
        // Récupérer les paramètres depuis le corps de la requête
        const {
            host,
            port,
            username,
            password,
            from,
            to,
            subject,
            body,
            attachments,
            metadata
        } = req.body;

        console.log('Configuration SMTP reçue:', { host, port, username });
        console.log('Destinataire:', to);
        console.log('Sujet:', subject);
        console.log('Données brutes reçues:', JSON.stringify(req.body, null, 2));

        // Utiliser la configuration SMTP reçue du frontend
        const smtpConfig = {
            host: host || 'localhost',
            port: port || 1025,
            secure: port === 465 || port === 587, // SSL pour 465/587, sinon false
            auth: {
                user: username || '',
                pass: password || ''
            }
        };

        console.log('Configuration SMTP utilisée:', { 
            host: smtpConfig.host, 
            port: smtpConfig.port, 
            secure: smtpConfig.secure,
            user: smtpConfig.auth.user 
        });

        // Créer le transporteur avec la configuration reçue
        const transporter = nodemailer.createTransport(smtpConfig);

        // Configuration de l'email avec valeurs par défaut si undefined
        const mailOptions = {
            from: from || 'test@gpa-assurance.com',
            to: to || 'test@gpa-assurance.com',
            subject: subject || 'Test Email - Devis GPA Assurance',
            html: body ? `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #0066cc; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">GPA Assurance</h1>
                        <p style="color: white; margin: 5px 0 0 0;">Votre devis d'assurance auto</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f9f9f9;">
                        <div style="color: #333; line-height: 1.6; white-space: pre-wrap;">
                            ${body.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    
                    <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
                        <p style="margin: 0;">© 2025 GPA Assurance - Tous droits réservés</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px;">
                            Contact : contact@partenaireassurances.com | Tel : 01 23 45 67 89
                        </p>
                    </div>
                </div>
            ` : `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #0066cc; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">GPA Assurance</h1>
                        <p style="color: white; margin: 5px 0 0 0;">Votre devis d'assurance auto</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f9f9f9;">
                        <h2 style="color: #333; margin-bottom: 20px;">Email de test</h2>
                        
                        <p style="color: #666; line-height: 1.6;">
                            Ceci est un email de test envoyé depuis le système GPA Assurance.<br><br>
                            <strong>Date d'envoi :</strong> ${new Date().toLocaleDateString('fr-FR')}<br>
                            <strong>Heure d'envoi :</strong> ${new Date().toLocaleTimeString('fr-FR')}<br><br>
                            N'hésitez pas à nous contacter pour toute question.
                        </p>
                    </div>
                    
                    <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
                        <p style="margin: 0;">© 2025 GPA Assurance - Tous droits réservés</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px;">
                            Contact : contact@partenaireassurances.com | Tel : 01 23 45 67 89
                        </p>
                    </div>
                </div>
            `,
            attachments: attachments || []
        };

        // Envoyer l'email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé avec succès:', info.messageId);

        res.json({
            success: true,
            message: 'Email envoyé avec succès',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi de l\'email',
            error: error.message
        });
    }
});

// Route de test
app.get('/test', (req, res) => {
    res.json({ message: 'Serveur d\'email fonctionne correctement' });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur d'email démarré sur http://localhost:${PORT}`);
    console.log(`Route d'envoi d'email: http://localhost:${PORT}/send-email`);
});
