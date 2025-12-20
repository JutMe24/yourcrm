/**
 * Classe pour générer un devis PDF professionnel
 */

// Vérifier si jsPDF est disponible
if (typeof jspdf === 'undefined') {
    console.error('Erreur: jsPDF n\'est pas chargé correctement');
    document.write('<div style="color:red;padding:20px;font-family:Arial;">Erreur: La bibliothèque jsPDF n\'est pas chargée correctement. Veuillez vérifier votre connexion Internet.</div>');
    throw new Error('jsPDF n\'est pas chargé');
}

// Vérifier si jsPDF est correctement initialisé
if (typeof jspdf === 'object' && !window.jsPDF && jspdf.jsPDF) {
    window.jsPDF = jspdf.jsPDF;
}

// Déclarer la classe DevisGenerator dans la portée globale
class DevisGenerator {
    constructor() {
        // Initialiser le document
        this.doc = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        // Définir les marges (en mm)
        this.margins = {
            top: 30,    // Augmenté pour l'en-tête
            right: 15,
            bottom: 25, // Augmenté pour le pied de page
            left: 15
        };
        
        // Dimensions de la page
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        
        // Position Y courante
        this.currentY = this.margins.top;
        
        // Numéro de page
        this.pageNumber = 1;
        
        // Numéro de devis
        this.devisNumber = this.generateDevisNumber();
        
        // Polices
        this.fonts = {
            normal: 'helvetica',
            bold: 'helvetica',
            italic: 'helvetica'
        };
        
        // Couleurs
        this.colors = {
            primary: '#1a365d',    // Bleu marine
            secondary: '#2c5282',  // Bleu plus clair
            text: '#2d3748',       // Texte principal
            lightText: '#718096',  // Texte secondaire
            border: '#e2e8f0',     // Bordures
            white: '#ffffff',      // Blanc
            lightGray: '#f7fafc',  // Arrière-plan
            success: '#38a169',    // Succès
            danger: '#e53e3e'      // Erreur
        };
        
        // Initialiser les en-têtes et pieds de page
        this.initializeHeaderFooter();
    }

    /**
     * Génère un numéro de devis unique
     * @returns {string} Numéro de devis formaté
     */
    generateDevisNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        return `DEV-${year}${month}${day}-${hours}${minutes}${seconds}`;
    }

    /**
     * Ajoute le pied de page avec les informations de l'entreprise
     */
    addFooter() {
        const pageNumber = this.doc.internal.getNumberOfPages();
        const footerY = this.pageHeight - 10;
        
        // Sauvegarder l'état du document
        const currentTextColor = this.doc.getTextColor();
        const currentFont = this.doc.getFont();
        const currentFontSize = this.doc.getFontSize();
        
        // Ligne de séparation
        this.doc.setDrawColor(200);
        this.doc.line(
            this.margins.left,
            footerY - 12,
            this.pageWidth - this.margins.right,
            footerY - 12
        );
        
        // Informations de l'entreprise
        this.doc.setFontSize(8);
        this.doc.setTextColor(100);
        
        // Numéro de page et de devis
        this.doc.text(
            `Page ${pageNumber} • Devis n° ${this.devisNumber}`, 
            this.pageWidth - this.margins.right, 
            footerY - 8,
            { align: 'right' }
        );
        
        // Informations de contact
        this.doc.setFontSize(7);
        this.doc.text('GPA ASSURANCE AUTO • 123 Avenue des Assurances • 75000 Paris', this.margins.left, footerY - 8);
        this.doc.text(`Tél: 01 23 45 67 89 • Email: contact@gpa-assurance.fr • SIRET: 123 456 789 00012`, this.margins.left, footerY - 4);
        
        // Restaurer l'état du document
        this.doc.setTextColor(currentTextColor);
        this.doc.setFont(currentFont.fontName, currentFont.fontStyle);
        this.doc.setFontSize(currentFontSize);
    }

    /**
     * Convertit une couleur hexadécimale en RGB
     * @param {string} hex - Couleur au format hexadécimal (#RRGGBB)
     * @returns {Array} Tableau [R, G, B]
     */
    hexToRgb(hex) {
        // Supprimer le # s'il est présent
        hex = hex.replace(/^#/, '');
        
        // Convertir en valeurs RGB
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        
        return [r, g, b];
    }

    /**
     * Formate une date au format JJ/MM/AAAA
     * @param {Date|string} date - Date à formater (objet Date ou chaîne de caractères)
     * @returns {string} Date formatée
     */
    formatDate(date) {
        if (!date) return 'Non renseignée';
        
        try {
            // Si la date est déjà un objet Date
            let d = date;
            
            // Si c'est une chaîne, essayer de la convertir en Date
            if (typeof date === 'string') {
                d = new Date(date);
                // Vérifier si la conversion a réussi
                if (isNaN(d.getTime())) {
                    // Si la chaîne est déjà au format JJ/MM/AAAA, la retourner telle quelle
                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
                        return date;
                    }
                    return date; // Retourner la chaîne d'origine si la conversion échoue
                }
            }
            
            // Formater la date en JJ/MM/AAAA
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            
            return `${day}/${month}/${year}`;
        } catch (e) {
            console.error('Erreur de formatage de date :', e);
            return 'Format invalide';
        }
    }

    /**
     * Initialise les en-têtes et pieds de page
     */
    initializeHeaderFooter() {
        // Ajouter les gestionnaires d'événements pour les en-têtes et pieds de page
        this.doc.autoTableAddPage({
            beforePageContent: (data) => {
                this.addHeader();
            },
            afterPageContent: (data) => {
                this.addFooter();
            },
            margin: { top: this.margins.top, bottom: this.margins.bottom }
        });
    }
    
    /**
     * Ajoute une nouvelle page avec en-tête et pied de page
     */
    addPage() {
        // Ajouter une nouvelle page
        this.doc.addPage();
        
        // Mettre à jour le compteur de pages
        this.pageNumber = this.doc.internal.getNumberOfPages();
        this.currentY = this.margins.top;
        
        // Ajouter l'en-tête et le pied de page
        this.addHeader();
        this.addFooter();
        
        return this.currentY;
    }

    /**
     * Ajoute un en-tête au document
     */
    addHeader() {
        const headerY = 15; // Position Y fixe pour l'en-tête
        
        // Sauvegarder l'état du document
        const currentTextColor = this.doc.getTextColor();
        const currentFont = this.doc.getFont();
        const currentFontSize = this.doc.getFontSize();
        
        // Logo et nom de l'entreprise
        this.doc.setFontSize(16);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(...this.hexToRgb(this.colors.primary));
        this.doc.text('GPA ASSURANCE AUTO', this.margins.left, headerY);
        
        // Numéro de devis et date
        this.doc.setFontSize(10);
        this.doc.text(`Devis N°: ${this.devisNumber}`, this.pageWidth - this.margins.right, headerY - 5, { align: 'right' });
        this.doc.text(`Date: ${this.formatDate(new Date())}`, this.pageWidth - this.margins.right, headerY + 3, { align: 'right' });
        
        // Ligne de séparation
        this.doc.setDrawColor(200);
        this.doc.line(this.margins.left, headerY + 8, this.pageWidth - this.margins.right, headerY + 8);
        
        // Restaurer l'état du document
        this.doc.setTextColor(currentTextColor);
        this.doc.setFont(currentFont.fontName, currentFont.fontStyle);
        this.doc.setFontSize(currentFontSize);
        
        // Mettre à jour la position Y courante
        this.currentY = headerY + 20;
    }

    /**
     * Vérifie si une nouvelle page est nécessaire et l'ajoute si besoin
     * @param {number} lines - Nombre de lignes à ajouter
     * @returns {boolean} true si une nouvelle page a été ajoutée
     */
    checkPageBreak(lines = 1) {
        const lineHeight = 8; // Hauteur approximative d'une ligne
        const neededSpace = lineHeight * lines + 20; // 20px de marge
        
        if (this.currentY + neededSpace > this.pageHeight - 40) {
            this.addPage();
            return true;
        }
        return false;
    }

    /**
     * Ajoute une section avec un titre
     * @param {string} title - Titre de la section
     */
    addSection(title) {
        this.checkPageBreak(3); // Vérifier l'espace pour le titre et une ligne
        
        // Ajouter un espace avant la section sauf si c'est le début de la page
        if (this.currentY > this.margins.top + 30) {
            this.currentY += 10;
        }
        
        // Titre de la section
        this.doc.setFontSize(12);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(...this.hexToRgb(this.colors.primary));
        this.doc.text(title.toUpperCase(), this.margins.left, this.currentY);
        
        // Ligne de soulignement
        this.doc.setDrawColor(...this.hexToRgb(this.colors.primary));
        this.doc.setLineWidth(0.5);
        this.doc.line(
            this.margins.left,
            this.currentY + 2,
            this.margins.left + 50,
            this.currentY + 2
        );
        
        this.currentY += 12;
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.setTextColor(...this.hexToRgb(this.colors.text));
    }

    /**
     * Affiche une paire clé/valeur
     * @param {string} label - Libellé
     * @param {string} value - Valeur
     * @param {number} x - Position X
     * @param {number} y - Position Y
     */
    addKeyValue(label, value, x, y) {
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text(`${label} :`, x, y);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(value, x + 30, y);
    }

    /**
     * Génère un devis PDF complet
     * @param {Object} client - Informations du client
     * @param {Array} prestations - Liste des prestations
     * @param {Object} infosComplementaires - Informations complémentaires
     */
    generateDevis(client, prestations, infosComplementaires) {
        try {
            // Réinitialiser le document
            this.doc = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });
            
            // Mettre à jour les dimensions
            this.pageWidth = this.doc.internal.pageSize.getWidth();
            this.pageHeight = this.doc.internal.pageSize.getHeight();
            
            // Réinitialiser le compteur de pages
            this.pageNumber = 1;
            this.currentY = this.margins.top;
            
            // Ajouter la première page avec en-tête et pied de page
            this.addHeader();
            this.addFooter();
            
            // Générer le contenu du devis
            this.generateDevisContent(client, prestations, infosComplementaires);
            
            // Enregistrer le PDF
            const fileName = `devis-${this.devisNumber}.pdf`;
            this.doc.save(fileName);
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la génération du devis :', error);
            throw new Error('Une erreur est survenue lors de la génération du devis : ' + error.message);
        }
    }
    
    /**
     * Génère le contenu du devis
     */
    generateDevisContent(client, prestations, infosComplementaires) {
            
            // Section Informations du client
            this.addSection('Informations du client');
            
            // Colonnes pour les informations du client
            const col1 = this.margins.left;
            const col2 = this.margins.left + 90;
            let currentY = this.currentY;
            
            // Première colonne
            this.addKeyValue('Nom', client.nom || 'Non renseigné', col1, currentY);
            this.addKeyValue('Prénom', client.prenom || 'Non renseigné', col1, currentY + 8);
            this.addKeyValue('Date de naissance', client.dateNaissance || 'Non renseignée', col1, currentY + 16);
            
            // Deuxième colonne
            this.addKeyValue('Téléphone', client.telephone || 'Non renseigné', col2, currentY);
            this.addKeyValue('Email', client.email || 'Non renseigné', col2, currentY + 8);
            
            // Adresse sur toute la largeur
            this.currentY = currentY + 30;
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Adresse :', this.margins.left, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(client.adresse || 'Non renseignée', this.margins.left + 30, this.currentY);
            
            if (client.codePostal || client.ville) {
                this.currentY += 8;
                const adresse2 = [client.codePostal, client.ville].filter(Boolean).join(' ');
                this.doc.text(adresse2 || 'Non renseignée', this.margins.left + 30, this.currentY);
            }
            
            // Permis
            this.currentY += 15;
            this.addSection('Permis de conduire');
            
            this.addKeyValue('Numéro', client.permisNumero || 'Non renseigné', this.margins.left, this.currentY);
            this.addKeyValue(
                'Date d\'obtention', 
                client.permisDate ? this.formatDate(client.permisDate) : 'Non renseignée', 
                this.margins.left, 
                this.currentY + 8
            );
            
            // Informations du véhicule
            if (infosComplementaires.vehicule) {
                this.currentY += 20;
                const v = infosComplementaires.vehicule;
                this.addSection('Véhicule à assurer');
                
                currentY = this.currentY;
                
                // Première colonne
                this.addKeyValue('Marque', v.marque || 'Non renseignée', col1, currentY);
                this.addKeyValue('Modèle', v.modele || 'Non renseigné', col1, currentY + 8);
                this.addKeyValue('Immatriculation', v.immatriculation || 'Non renseignée', col1, currentY + 16);
                
                // Deuxième colonne
                this.addKeyValue('Mise en circulation', v.dateMiseCirculation || 'Non renseignée', col2, currentY);
                this.addKeyValue('Valeur à neuf', v.valeurNeuve ? `${v.valeurNeuve} €` : 'Non renseignée', col2, currentY + 8);
                
                this.currentY = currentY + 30;
            }
            
            // Détails de l'assurance
            if (infosComplementaires.typeAssurance) {
                this.addSection('Détails de la proposition d\'assurance');
                
                currentY = this.currentY;
                
                // Première colonne
                this.addKeyValue('Type d\'assurance', infosComplementaires.typeAssurance || 'Non renseigné', col1, currentY);
                this.addKeyValue('Date d\'effet', infosComplementaires.dateEffet || 'Non renseignée', col1, currentY + 8);
                
                // Deuxième colonne
                this.addKeyValue('Fractionnement', infosComplementaires.fractionnement || 'Non renseigné', col2, currentY);
                this.addKeyValue('Assistance 0km', infosComplementaires.assistance ? 'Oui' : 'Non', col2, currentY + 8);
                
                // Montants
                this.currentY = currentY + 25;
                this.doc.setFont(this.fonts.bold, 'bold');
                this.doc.text('RÉCAPITULATIF DES MONTANTS', this.margins.left, this.currentY);
                this.currentY += 10;
                
                this.doc.setFont(this.fonts.normal, 'normal');
                this.doc.text('Cotisation annuelle :', this.margins.left, this.currentY);
                this.doc.text(infosComplementaires.cotisation ? `${infosComplementaires.cotisation.toFixed(2)} €` : '0,00 €', this.pageWidth - this.margins.right, this.currentY, { align: 'right' });
                
                this.currentY += 8;
                this.doc.text('Frais de dossier :', this.margins.left, this.currentY);
                this.doc.text(infosComplementaires.fraisDossier ? `${infosComplementaires.fraisDossier.toFixed(2)} €` : '0,00 €', this.pageWidth - this.margins.right, this.currentY, { align: 'right' });
                
                // Ligne de séparation
                this.currentY += 8;
                this.doc.setDrawColor(200);
                this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY);
                
                // Total
                this.currentY += 5;
                this.doc.setFont(this.fonts.bold, 'bold');
                this.doc.setFontSize(14);
                const total = (infosComplementaires.cotisation || 0) + (infosComplementaires.fraisDossier || 0);
                this.doc.text('TOTAL :', this.margins.left, this.currentY);
                this.doc.text(`${total.toFixed(2)} €`, this.pageWidth - this.margins.right, this.currentY, { align: 'right' });
                
                // Mention TVA
                this.currentY += 10;
                this.doc.setFont(this.fonts.normal, 'italic');
                this.doc.setFontSize(8);
                this.doc.text('* TVA non applicable, art. 293 B du CGI', this.margins.left, this.currentY);
            }
            
            // Conditions générales
            this.currentY += 20;
            this.addSection('Conditions générales');
            
            const conditions = [
                'Le présent devis est valable 30 jours à compter de sa date d\'émission.',
                'La police d\'assurance prendra effet à la date convenue, sous réserve de paiement de la prime.',
                'Toute déclaration inexacte ou omission peut entraîner la nullité du contrat.',
                'Les garanties sont accordées dans les conditions et limites prévues au contrat.'
            ];
            
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.setFontSize(9);
            
            conditions.forEach(condition => {
                this.checkPageBreak(1);
                this.doc.text('• ' + condition, this.margins.left + 5, this.currentY);
                this.currentY += 6;
            });
            
            // Signature
            this.currentY += 15;
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text('Fait à Paris, le ' + this.formatDate(new Date()), this.margins.left, this.currentY);
            this.currentY += 20;
            
            this.doc.text('Le client', this.margins.left, this.currentY);
            this.doc.text('Le représentant GPA ASSURANCE', this.pageWidth - this.margins.right - 50, this.currentY);
            this.currentY += 30;
            
            this.doc.line(this.margins.left, this.currentY, this.margins.left + 80, this.currentY);
            this.doc.line(this.pageWidth - this.margins.right - 80, this.currentY, this.pageWidth - this.margins.right, this.currentY);
            
            // Le contenu du devis a été généré avec succès
        } catch (error) {
            console.error('Erreur lors de la génération du devis :', error);
            throw new Error('Une erreur est survenue lors de la génération du devis : ' + error.message);
        }
    }
    
    // Autres méthodes de la classe...
    
}

// Exporter la classe pour une utilisation globale
if (typeof window !== 'undefined') {
    window.DevisGenerator = DevisGenerator;
}

// Exporter pour les modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DevisGenerator };
}
