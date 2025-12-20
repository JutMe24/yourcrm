/**
 * Classe pour générer un devis PDF professionnel
 */

// Vérifier si jsPDF est disponible
if (typeof jspdf === 'undefined') {
    console.error('Erreur: jsPDF n\'est pas chargé correctement');
    document.write('<div style="color:red;padding:20px;font-family:Arial;">Erreur: La bibliothèque jsPDF n\'est pas chargée correctement. Veuillez vérifier votre connexion Internet.</div>');
}

// Déclarer la classe DevisGenerator dans la portée globale
class DevisGenerator {
    constructor() {
        this.doc = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        // Définir les couleurs de la marque
        this.colors = {
            primary: '#1a365d',    // Bleu marine
            secondary: '#ed8936',  // Orange
            accent: '#2c5282',     // Bleu plus clair
            text: '#2d3748',       // Gris foncé
            lightGray: '#f7fafc',  // Gris très clair
            border: '#e2e8f0',     // Gris clair pour les bordures
            success: '#38a169',    // Vert
            danger: '#e53e3e',     // Rouge
            white: '#ffffff',      // Blanc
            black: '#000000',      // Noir
            darkGray: '#4a5568'    // Gris foncé
        };
        
        // Polices
        this.fonts = {
            normal: 'helvetica',
            bold: 'helvetica',
            italic: 'helvetica',
            boldItalic: 'helvetica'
        };
        
        // Marges
        this.margins = {
            top: 15,
            left: 15,
            right: 15,
            bottom: 20,
            header: 20,
            footer: 15
        };
        
        // Dimensions de la page
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
        
        // Compteur de pages
        this.pageNumber = 1;
        
        // Position Y actuelle
        this.currentY = this.margins.top;
        
        // Numéro de devis
        this.devisNumber = this.generateDevisNumber();
    }
    
    /**
     * Génère un devis PDF à partir des données fournies
     * @param {Object} client - Informations du client
     * @param {Array} prestations - Liste des prestations à facturer
     * @param {Object} infosComplementaires - Informations complémentaires (véhicule, date d'effet, etc.)
     */
    generateDevis(client, prestations, infosComplementaires = {}) {
        try {
            // Réinitialiser la position Y
            this.currentY = this.margins.top;
            
            // Ajouter l'en-tête
            this.addHeader();
            
            // Ajouter les informations du client
            this.addClientInfo(client);
            
            // Ajouter les informations du véhicule si disponibles
            if (infosComplementaires.vehicule) {
                this.addVehicleInfo(infosComplementaires.vehicule);
            }
            
            // Ajouter les antécédents d'assurance si disponibles
            if (client.antecedentsAssurance) {
                this.addAntecedentsInfo(client.antecedentsAssurance);
            }
            
            // Ajouter les prestations
            this.addPrestations(prestations);
            
            // Ajouter les conditions générales
            this.addConditionsGenerales(infosComplementaires);
            
            // Ajouter les signatures
            this.addSignatures();
            
            // Ajouter le pied de page
            this.addFooter();
            
            // Enregistrer le PDF
            const fileName = `Devis_${client.nom}_${this.devisNumber}.pdf`;
            this.doc.save(fileName);
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la génération du devis :', error);
            throw new Error('Une erreur est survenue lors de la génération du devis : ' + error.message);
        }
    }
    
    /**
     * Ajoute l'en-tête du document avec le logo et les informations de l'entreprise
     */
    addHeader() {
        // Code de l'en-tête...
    }
    
    /**
     * Ajoute les informations du client au document
     * @param {Object} client - Informations du client
     */
    addClientInfo(client) {
        // Code des informations client...
    }
    
    /**
     * Ajoute les informations du véhicule au document
     * @param {Object} vehicule - Informations du véhicule
     */
    addVehicleInfo(vehicule) {
        // Code des informations du véhicule...
    }
    
    /**
     * Ajoute les antécédents d'assurance au document
     * @param {Object} antecedents - Informations sur les antécédents d'assurance
     */
    addAntecedentsInfo(antecedents) {
        // Code des antécédents d'assurance...
    }
    
    /**
     * Ajoute les prestations au document
     * @param {Array} prestations - Liste des prestations
     */
    addPrestations(prestations) {
        // Code des prestations...
    }
    
    /**
     * Ajoute les conditions générales au document
     * @param {Object} infosComplementaires - Informations complémentaires
     */
    addConditionsGenerales(infosComplementaires) {
        // Code des conditions générales...
    }
    
    /**
     * Ajoute les signatures au document
     */
    addSignatures() {
        // Code des signatures...
    }
    
    /**
     * Ajoute le pied de page avec les informations de l'entreprise
     */
    addFooter() {
        const footerY = this.pageHeight - this.margins.footer;
        
        // Ajouter le numéro de devis juste au-dessus du pied de page
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.setFontSize(8);
        this.doc.setTextColor(...this.hexToRgb(this.colors.darkGray));
        this.doc.text(`Devis n°${this.devisNumber}`, this.pageWidth - this.margins.right - 10, footerY - 8, { align: 'right' });
        
        // Couleur de fond pour le pied de page
        this.doc.setFillColor(...this.hexToRgb(this.colors.primary));
        this.doc.rect(0, footerY - 5, this.pageWidth, this.margins.footer + 5, 'F');
        
        // Texte du pied de page
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.setFontSize(7);
        this.doc.setTextColor(...this.hexToRgb(this.colors.white));
        
        // Informations de l'entreprise
        const footerText = [
            'GPA ASSURANCE AUTO - Siège social : 123 Avenue des Champs-Élysées, 75008 Paris',
            'Tél : 01 23 45 67 89 • Email : contact@gpa-assurance.fr • SIRET : 123 456 789 00012 • RCS Paris B 123 456 789',
            'Ce document est établi à titre informatif et ne constitue pas une police d\'assurance.'
        ];
        
        // Afficher le texte du pied de page
        footerText.forEach((line, index) => {
            this.doc.text(line, this.pageWidth / 2, footerY + (index * 3.5), { align: 'center' });
        });
        
        // Numéro de page
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text(`Page ${this.pageNumber}`, this.margins.left + this.contentWidth - 5, footerY + 3, { align: 'right' });
        
        // Réinitialiser la couleur du texte
        this.doc.setTextColor(...this.hexToRgb(this.colors.text));
    }
    
    /**
     * Ajoute un nouveau numéro de page
     */
    addPage() {
        // Ajouter une nouvelle page
        this.doc.addPage();
        
        // Incrémenter le numéro de page
        this.pageNumber++;
        
        // Réinitialiser la position Y
        this.currentY = this.margins.top;
        
        // Ajouter l'en-tête sur la nouvelle page
        this.addHeader();
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
        const random = Math.floor(1000 + Math.random() * 9000);
        return `DEV-${year}${month}${day}-${random}`;
    }
    
    /**
     * Convertit une couleur hexadécimale en RGB
     * @param {string} hex - Couleur au format hexadécimal (#RRGGBB)
     * @returns {Array} Tableau [R, G, B]
     */
    hexToRgb(hex) {
        // Supprimer le # s'il est présent
        hex = hex.replace('#', '');
        
        // Convertir en valeurs R, G, B
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return [r, g, b];
    }
    
    /**
     * Formate un nombre en devise (euros)
     * @param {number} amount - Montant à formater
     * @returns {string} Montant formaté (ex: "123,45 €")
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    
    /**
     * Formate une date au format JJ/MM/AAAA
     * @param {Date} date - Date à formater
     * @returns {string} Date formatée
     */
    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    }
    
    /**
     * Formate un numéro de téléphone
     * @param {string} phone - Numéro de téléphone à formater
     * @returns {string} Numéro formaté (ex: "01 23 45 67 89")
     */
    formatPhoneNumber(phone) {
        // Supprimer tous les caractères non numériques
        const cleaned = ('' + phone).replace(/\D/g, '');
        
        // Vérifier si c'est un numéro français (10 chiffres)
        const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
        
        if (match) {
            return match[1] + ' ' + match[2] + ' ' + match[3] + ' ' + match[4] + ' ' + match[5];
        }
        
        // Retourner le numéro original si le format n'est pas reconnu
        return phone;
    }
}

// Exporter la classe DevisGenerator
try {
    if (typeof module !== 'undefined' && module.exports) {
        // Pour Node.js
        module.exports = DevisGenerator;
    } else if (typeof window !== 'undefined') {
        // Pour le navigateur
        window.DevisGenerator = DevisGenerator;
    }
} catch (e) {
    console.error('Erreur lors de l\'export de la classe DevisGenerator:', e);
}
