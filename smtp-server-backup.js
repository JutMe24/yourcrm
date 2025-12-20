const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jsPDF = require('jspdf');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Augmenter la limite pour les devis
app.use(express.static(path.join(__dirname)));

// Fonction pour générer le PDF avec jsPDF (identique au formulaire)
function generateFormPDF(devisData, devisId) {
    return new Promise((resolve, reject) => {
        try {
            // Créer un nouveau document PDF avec jsPDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - 2 * margin;
            let yPos = margin;
            
            // 1. EN-TÊTE DU DOCUMENT
            const headerHeight = 20;
            
            // Fond bleu foncé en haut de page (#001E50)
            pdf.setFillColor(0, 30, 80);
            pdf.rect(0, 0, pageWidth, headerHeight, 'F');
            
            // Logo GPA à gauche (texte simple car pas d'image sur serveur)
            const logoSize = 15;
            const logoX = margin;
            const logoY = (headerHeight - logoSize) / 2;
            
            pdf.setFontSize(12);
            pdf.setTextColor(255, 255, 255);
            pdf.text('GPA', logoX, logoY + 10);
            
            // Texte "GPA ASSURANCES" à côté du logo
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(255, 255, 255);
            pdf.text('GPA ASSURANCES', logoX + logoSize + 10, logoY + 10);
            
            // Ligne verticale de séparation
            pdf.setDrawColor(255, 255, 255);
            pdf.setLineWidth(0.3);
            pdf.line(logoX + logoSize + 100, logoY, logoX + logoSize + 100, logoY + logoSize);
            
            // Informations de contact à droite
            const contactX = logoX + logoSize + 120;
            
            // Téléphone
            pdf.setFontSize(10);
            pdf.text('01 23 45 67 89', contactX, logoY + 10);
            
            // Email
            pdf.text('contact@gpa-assurances.fr', contactX + 80, logoY + 10);
            
            // 2. INFORMATIONS CLIENT
            const clientY = headerHeight + 20;
            
            // Titre "INFORMATIONS CLIENT"
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(0, 30, 80);
            pdf.text('INFORMATIONS CLIENT', margin, clientY);
            
            // Ligne sous le titre
            pdf.setDrawColor(0, 30, 80);
            pdf.setLineWidth(0.5);
            pdf.line(margin, clientY + 3, margin + 80, clientY + 3);
            
            // Données du client
            const client = devisData.client || {};
            const infoClientY = clientY + 20;
            
            // Nom et prénom en plus grand
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text(`${client.nom || 'NOM'} ${client.prenom || 'Prénom'}`.toUpperCase(), margin, infoClientY);
            
            // Adresse
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            if (client.adresse) {
                pdf.text(client.adresse, margin, infoClientY + 8);
                if (client.codePostal || client.ville) {
                    pdf.text(`${client.codePostal || ''} ${client.ville || ''}`.trim(), margin, infoClientY + 15);
                }
            }
            
            // Téléphone et email
            if (client.telephone || client.email) {
                let contactY = infoClientY + 8;
                if (client.adresse) contactY += 15;
                
                if (client.telephone) {
                    pdf.text(`Téléphone: ${client.telephone}`, margin, contactY);
                }
                if (client.email) {
                    pdf.text(`Email: ${client.email}`, margin + 100, contactY);
                }
            }
            
            // Calcul de la position Y pour la section suivante
            yPos = infoClientY + 35;
            if (client.telephone || client.email) {
                yPos += 10;
            }
            
            // 3. BLOC INFORMATIONS VÉHICULE
            // Titre de la section
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(0, 30, 80);
            pdf.text('INFORMATIONS VÉHICULE', margin, yPos);
            
            // Ligne sous le titre
            pdf.setDrawColor(0, 30, 80);
            pdf.setLineWidth(0.5);
            pdf.line(margin, yPos + 2, margin + 80, yPos + 2);
            
            yPos += 10;
            
            // Carte d'information véhicule (fond gris)
            pdf.setFillColor(240, 240, 240);
            pdf.roundedRect(margin, yPos, contentWidth, 60, 5, 'F');
            
            // Icône véhicule
            pdf.setFontSize(24);
            pdf.setTextColor(0, 30, 80);
            pdf.text('🚗', margin + 10, yPos + 20);
            
            // Informations du véhicule
            const vehicule = devisData.vehicule || {};
            pdf.setFont('helvetica');
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            
            // Données du véhicule
            const vehicleData = [
                { 
                    label: 'Marque / Modèle', 
                    value: `${vehicule.marque || ''} ${vehicule.modele || ''}`.trim() || 'Non renseigné' 
                },
                { 
                    label: 'Immatriculation', 
                    value: vehicule.immatriculation || 'Non renseignée' 
                },
                { 
                    label: 'Date 1ère mise en circ.', 
                    value: vehicule.dateMec || 'Non renseignée' 
                },
                { 
                    label: 'Puissance (CV)', 
                    value: vehicule.puissance || 'Non renseignée' 
                },
                { 
                    label: 'Valeur à neuf', 
                    value: vehicule.valeurNeuve ? `${vehicule.valeurNeuve} €` : 'Non renseignée' 
                }
            ];
            
            // Afficher les données du véhicule sur 2 colonnes
            vehicleData.forEach((item, index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);
                const x = margin + 30 + (col * (contentWidth / 2 - 10));
                const y = yPos + 15 + (row * 8);
                
                pdf.setFont('helvetica', 'bold');
                pdf.text(item.label + ' :', x, y);
                pdf.setFont('helvetica', 'normal');
                pdf.text(item.value, x + 50, y);
            });
            
            yPos += 70;
            
            // 4. BLOC GARANTIES INCLUSES
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(0, 30, 80);
            pdf.text('GARANTIES INCLUSES', margin, yPos);
            
            // Ligne sous le titre
            pdf.setDrawColor(0, 30, 80);
            pdf.setLineWidth(0.5);
            pdf.line(margin, yPos + 2, margin + 70, yPos + 2);
            
            yPos += 10;
            
            // Liste des garanties avec icônes
            const garanties = [
                { icon: '🛡️', text: 'Responsabilité Civile' },
                { icon: '🔥', text: 'Incendie et Explosion' },
                { icon: '💥', text: 'Bris de Glace' },
                { icon: '🚗', text: 'Vol et Tentative de Vol' },
                { icon: '⚖️', text: 'Défense Pénale et Recours' },
                { icon: '🚑', text: 'Assistance 0km' },
                { icon: '👥', text: 'Conducteur désigné illimité' },
                { icon: '🌍', text: 'Extension de garantie Europe' }
            ];
            
            // Dessiner les garanties sur 2 colonnes
            garanties.forEach((garantie, index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);
                const x = margin + (col * (contentWidth / 2 + 5));
                const y = yPos + (row * 8);
                
                pdf.setFontSize(10);
                pdf.setTextColor(0, 30, 80);
                pdf.text(garantie.icon, x, y);
                pdf.setTextColor(0, 0, 0);
                pdf.text(garantie.text, x + 15, y);
                
                // Mettre à jour yPos pour la section suivante
                if (index === garanties.length - 1) {
                    yPos = y + 15;
                }
            });
            
            // 5. BLOC TARIFICATION
            yPos += 10;
            
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(0, 30, 80);
            pdf.text('TARIFICATION', margin, yPos);
            
            // Ligne sous le titre
            pdf.setDrawColor(0, 30, 80);
            pdf.setLineWidth(0.5);
            pdf.line(margin, yPos + 2, margin + 50, yPos + 2);
            
            yPos += 10;
            
            // Carte de tarification
            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(margin, yPos, contentWidth, 60, 5, 'F');
            pdf.setDrawColor(0, 30, 80);
            pdf.setLineWidth(1);
            pdf.roundedRect(margin, yPos, contentWidth, 60, 5);
            
            // Détails de la tarification
            const cotisation = devisData.cotisation || 0;
            const fraisDossier = devisData.fraisDossier || 30;
            const total = parseFloat(cotisation) + parseFloat(fraisDossier);
            
            const tarifs = [
                { label: 'Cotisation mensuelle', value: `${(cotisation / 12).toFixed(2)} €` },
                { label: 'Frais de dossier', value: `${fraisDossier.toFixed(2)} €` },
                { label: 'Total à la souscription', value: `${total.toFixed(2)} €` }
            ];
            
            // Afficher les tarifs
            tarifs.forEach((item, index) => {
                const isTotal = index === tarifs.length - 1;
                const y = yPos + 15 + (index * 15);
                
                pdf.setFont('helvetica', isTotal ? 'bold' : 'normal');
                pdf.setFontSize(isTotal ? 14 : 10);
                pdf.setTextColor(0, 0, 0);
                pdf.text(item.label, margin + 10, y);
                
                pdf.setFont('helvetica', isTotal ? 'bold' : 'normal');
                pdf.setFontSize(isTotal ? 18 : 12);
                pdf.setTextColor(0, 30, 80);
                pdf.text(item.value, contentWidth - 10, y, { align: 'right' });
                
                if (!isTotal) {
                    pdf.setDrawColor(150, 150, 150);
                    pdf.setLineWidth(0.2);
                    pdf.line(margin + 10, y + 5, contentWidth - 10, y + 5);
                }
            });
            
            yPos += 70;
            
            // 6. BLOC DOCUMENTS À FOURNIR
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(0, 30, 80);
            pdf.text('DOCUMENTS À FOURNIR', margin, yPos);
            
            // Ligne sous le titre
            pdf.setDrawColor(0, 30, 80);
            pdf.setLineWidth(0.5);
            pdf.line(margin, yPos + 2, margin + 90, yPos + 2);
            
            yPos += 10;
            
            // Liste des documents
            const documents = [
                { icon: '📝', text: 'Formulaire de souscription dûment rempli et signé' },
                { icon: '📄', text: 'Copie recto-verso de la carte grise du véhicule' },
                { icon: '🪪', text: 'Copie recto-verso du permis de conduire' },
                { icon: '💳', text: 'RIB pour le prélèvement automatique' },
                { icon: '📋', text: 'Relevé d\'informations (si disponible)' }
            ];
            
            // Afficher les documents
            documents.forEach((doc, index) => {
                const y = yPos + (index * 7);
                pdf.setFontSize(10);
                pdf.setTextColor(0, 30, 80);
                pdf.text(doc.icon, margin + 5, y);
                pdf.setTextColor(0, 0, 0);
                pdf.text(doc.text, margin + 20, y);
                
                if (index === documents.length - 1) {
                    yPos = y + 15;
                }
            });
            
            // 7. PIED DE PAGE
            const footerHeight = 25;
            const footerY = pageHeight - footerHeight;
            
            // Bande bleue en bas
            pdf.setFillColor(0, 30, 80);
            pdf.rect(0, footerY, pageWidth, footerHeight, 'F');
            
            // Logo GPA en blanc à gauche
            pdf.setFontSize(10);
            pdf.setTextColor(255, 255, 255);
            pdf.text('GPA - Groupe Partenaire des Assurances', margin, footerY + 15);
            
            // Mentions légales à droite
            pdf.setFontSize(8);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'normal');
            
            const legalText = `Cabinet GPA – Groupe Partenaire des Assurances, courtier agréé. Tous droits réservés. | Édité le ${new Date().toLocaleDateString('fr-FR')}`;
            
            pdf.text(legalText, pageWidth - margin, footerY + 10, { align: 'right' });
            
            // Numéro de page
            pdf.text(`Page 1/1`, pageWidth / 2, footerY + 20, { align: 'center' });
            
            // Sauvegarder le PDF
            const pdfPath = path.join(__dirname, `devis-${devisId}.pdf`);
            pdf.save(pdfPath);
            
            console.log('✅ PDF jsPDF généré:', pdfPath);
            resolve(pdfPath);
            
        } catch (error) {
            console.error('❌ Erreur génération PDF jsPDF:', error);
            reject(error);
        }
    });
}

// Route pour envoyer des emails via SMTP
app.post('/send-email', async (req, res) => {
    try {
        console.log('📥 Requête reçue sur /send-email');
        console.log('📥 Corps de la requête (keys):', Object.keys(req.body));
        // Récupérer les données du devis et les pièces jointes utilisateur
        const { devisId, devisData, pdfGenerated, attachments: userAttachments, ...emailData } = req.body;
        
        console.log('📥 devisId présent:', !!devisId);
        console.log('📥 devisData présent:', !!devisData);
        console.log('📥 pdfGenerated présent:', !!pdfGenerated);
        
        if (devisId) {
            console.log('📥 devisId valeur:', devisId);
        }
        
        if (devisData) {
            console.log('📥 devisData type:', typeof devisData);
            console.log('📥 devisData length:', devisData.length);
        }
        
        if (pdfGenerated) {
            console.log('📥 PDF généré par le formulaire:', pdfGenerated);
        }
        
        // Configuration du transport SMTP
        const transporter = nodemailer.createTransport({
            host: emailData.host,
            port: emailData.port,
            secure: emailData.port === 465, // true pour 465, false pour autres ports
            auth: {
                user: emailData.username,
                pass: emailData.password
            },
            debug: true, // Activer le debug
            logger: true // Activer les logs
        });
        
        console.log('📧 Tentative d\'envoi SMTP:', {
            host: emailData.host,
            port: emailData.port,
            username: emailData.username,
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            secure: emailData.port === 465,
            hasDevisId: !!devisId,
            hasDevisData: !!devisData,
            pdfGenerated: pdfGenerated
        });
        
        // Vérifier la connexion SMTP
        console.log('🔍 Vérification de la connexion SMTP...');
        await transporter.verify();
        console.log('✅ Connexion SMTP vérifiée');
        
        // Préparer les pièces jointes
        let attachments = [];
        
        // Si le PDF a été généré par le formulaire, chercher le fichier
        if (pdfGenerated && devisId) {
            console.log('📄 Recherche du PDF généré par le formulaire:', devisId);
            
            // Chercher dans le dossier de téléchargement par défaut
            const downloadPath = path.join(__dirname, `devis-${devisId}.pdf`);
            console.log('🔍 Chemin recherché:', downloadPath);
            console.log('🔍 Fichier existe?', fs.existsSync(downloadPath));
            
            if (fs.existsSync(downloadPath)) {
                console.log('✅ PDF généré trouvé et utilisé:', downloadPath);
                attachments.push({
                    filename: `devis-${devisId}.pdf`,
                    path: downloadPath
                });
            } else {
                console.log('⚠️ PDF généré non trouvé, génération d\'un PDF avec structure formulaire');
                try {
                    const generatedPdfPath = await generateFormPDF(devisData, devisId);
                    console.log('✅ PDF structure formulaire généré:', generatedPdfPath);
                    attachments.push({
                        filename: `devis-${devisId}.pdf`,
                        path: generatedPdfPath
                    });
                } catch (pdfError) {
                    console.error('❌ Erreur génération PDF fallback:', pdfError);
                    // Continuer sans PDF
                }
            }
        }
        // Sinon, chercher un PDF existant
        else if (devisId) {
            console.log('📄 Recherche du PDF existant pour le devis:', devisId);
            const existingPdfPath = path.join(__dirname, `devis-${devisId}.pdf`);
            console.log('🔍 Chemin recherché:', existingPdfPath);
            console.log('🔍 Fichier existe?', fs.existsSync(existingPdfPath));
            
            if (fs.existsSync(existingPdfPath)) {
                console.log('✅ PDF existant trouvé et utilisé:', existingPdfPath);
                attachments.push({
                    filename: `devis-${devisId}.pdf`,
                    path: existingPdfPath
                });
            } else {
                console.log('⚠️ PDF existant non trouvé, génération d\'un PDF avec structure formulaire');
                try {
                    const generatedPdfPath = await generateFormPDF(devisData, devisId);
                    console.log('✅ PDF structure formulaire généré:', generatedPdfPath);
                    attachments.push({
                        filename: `devis-${devisId}.pdf`,
                        path: generatedPdfPath
                    });
                } catch (pdfError) {
                    console.error('❌ Erreur génération PDF fallback:', pdfError);
                    // Continuer sans PDF
                }
            }
        }
        
        // Envoyer l'email
        const mailOptions = {
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            text: emailData.body,
            html: emailData.body.replace(/\n/g, '<br>'),
            attachments: attachments.length > 0 ? attachments : undefined
        };
        
        console.log('📧 Options email:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            hasAttachments: attachments.length > 0,
            attachmentsCount: attachments.length
        });
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email envoyé avec succès:', info.messageId);
        console.log('📧 Email envoyé avec', attachments.length, 'pièce(s) jointe(s)');
        
        res.status(200).json({
            success: true,
            message: 'Email envoyé avec succès',
            messageId: info.messageId,
            attachments: attachments.length
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi de l\'email',
            error: error.message
        });
    }
});

// Servir les fichiers statiques
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-pdf-liste.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur SMTP démarré sur http://localhost:${PORT}`);
    console.log(`📧 Route d'envoi: http://localhost:${PORT}/send-email`);
});

module.exports = app;
