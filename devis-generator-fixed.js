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

/**
 * Classe pour générer des devis PDF
 */
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
            danger: '#e53e3e',     // Erreur
            orange: '#F97316'      // Orange pour l'icône de voiture
        };
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
     * Ajoute un en-tête au document avec logo, informations du devis et du client
     */
    addHeader() {
        const headerY = 15; // Position Y fixe pour l'en-tête
        
        // Sauvegarder l'état du document
        const currentTextColor = this.doc.getTextColor();
        const currentFont = this.doc.getFont();
        const currentFontSize = this.doc.getFontSize();
        
        // Fond d'en-tête avec dégradé
        this.doc.setFillColor(...this.hexToRgb(this.colors.primary));
        this.doc.rect(0, 0, this.pageWidth, 25, 'F');
        
        // Logo texte simple et fiable
        try {
            // Sauvegarder le style actuel
            const originalTextColor = this.doc.getTextColor();
            const originalFontSize = this.doc.getFontSize();
            
            // Définir le style du logo
            this.doc.setFontSize(16);
            this.doc.setFont('helvetica', 'bold');
            
            // Couleurs qui s'adaptent au thème
            const headerColor = this.hexToRgb(this.colors.primary);
            
            // Calculer une couleur de texte contrastée (blanc ou noir selon la luminosité)
            const brightness = (headerColor[0] * 299 + headerColor[1] * 587 + headerColor[2] * 114) / 1000;
            const textColor = brightness > 125 ? [0, 0, 0] : [255, 255, 255]; // Noir ou blanc
            
            // Définir la couleur de l'accent (orange plus visible)
            const accentColor = [255, 140, 0]; // Orange vif
            
            // Ajouter le texte avec la couleur calculée
            this.doc.setTextColor(...textColor);
            this.doc.text('GPA', this.margins.left + 10, 15);
            
            // Ajouter une barre d'accent sous le texte
            this.doc.setDrawColor(...accentColor);
            this.doc.setLineWidth(1);
            this.doc.line(
                this.margins.left, 18,
                this.margins.left + 20, 18
            );
            
            // Restaurer le style original
            this.doc.setTextColor(originalTextColor);
            this.doc.setFontSize(originalFontSize);
            
            console.log('Logo texte simple généré avec succès');
        } catch (e) {
            console.log('Logo non trouvé, utilisation du texte par défaut');
            
            // Texte de remplacement si le logo n'est pas trouvé
            const logoText = 'GPA';
            const logoFontSize = 14;
            const maxWidth = 30;
            
            // Ajuster la taille du texte si nécessaire
            const textWidth = this.doc.getStringUnitWidth(logoText) * logoFontSize / this.doc.internal.scaleFactor;
            const finalFontSize = textWidth > maxWidth - 5 
                ? (maxWidth - 5) * this.doc.internal.scaleFactor / this.doc.getStringUnitWidth(logoText) 
                : logoFontSize;
            
            // Afficher le texte du logo
            this.doc.setFontSize(finalFontSize);
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.setTextColor(255, 255, 255);
            this.doc.text(logoText, this.margins.left, 15);
            
            // Ajout de l'icône de voiture (caractère unicode de voiture simple)
            this.doc.setFontSize(14);
            this.doc.setTextColor(...this.hexToRgb(this.colors.orange));
            // Utilisation d'un caractère de voiture plus simple (Unicode: U+1F697)
            this.doc.text('🚗', this.margins.left + 25, 15);
            // Essayer avec un autre caractère si le premier ne fonctionne pas
            // this.doc.text('🚘', this.margins.left + 25, 15); // Autre variante de voiture
            this.doc.setTextColor(255, 255, 255); // Réinitialisation en blanc pour le reste du texte
            
            // Encadré autour du logo texte et de l'icône
            this.doc.setDrawColor(255, 255, 255);
            this.doc.setLineWidth(0.5);
            this.doc.rect(this.margins.left - 2, 5, maxWidth + 15, 15);
        }
        
        // Titre du document
        this.doc.setFontSize(16);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(255, 255, 255);
        this.doc.text('DEVIS D\'ASSURANCE AUTO', this.margins.left + 40, headerY);
        
        // Boîte d'informations à droite
        const infoBoxX = this.pageWidth - 70;
        const infoBoxY = 10;
        
        // Fond de la boîte d'informations
        this.doc.setFillColor(255, 255, 255, 0.9);
        this.doc.roundedRect(infoBoxX - 5, infoBoxY - 5, 65, 25, 2, 2, 'F');
        
        // Contenu de la boîte d'informations
        this.doc.setFontSize(8);
        this.doc.setTextColor(...this.hexToRgb(this.colors.white));
        this.doc.text(`N°: ${this.devisNumber}`, infoBoxX, infoBoxY + 5);
        this.doc.text(`Date: ${this.formatDate(new Date())}`, infoBoxX, infoBoxY + 10);
        this.doc.text(`Page: ${this.doc.internal.getCurrentPageInfo().pageNumber}`, infoBoxX, infoBoxY + 15);
        
        // Informations du client (si disponibles)
        if (this.currentClient) {
            this.doc.setFontSize(9);
            this.doc.setTextColor(255, 255, 255);
            this.doc.text(`Client: ${this.currentClient.nom} ${this.currentClient.prenom}`, this.margins.left + 40, headerY + 8);
        }
        
        // Restaurer l'état du document
        this.doc.setTextColor(currentTextColor);
        this.doc.setFont(currentFont.fontName, currentFont.fontStyle);
        this.doc.setFontSize(currentFontSize);
        
        // Mettre à jour la position Y courante
        this.currentY = headerY + 30;
    }

    /**
     * Ajoute un pied de page professionnel avec informations légales et de contact
     */
    addFooter() {
        const currentPage = this.doc.internal.getCurrentPageInfo().pageNumber;
        const totalPages = this.doc.internal.getNumberOfPages();
        
        // Sauvegarder l'état du document
        const currentTextColor = this.doc.getTextColor();
        const currentFont = this.doc.getFont();
        const currentFontSize = this.doc.getFontSize();
        
        // Configuration
        const footerHeight = 30; // Hauteur totale du pied de page
        const footerY = this.pageHeight - footerHeight; // Position Y du haut du pied de page
        
        // Fond du pied de page avec couleur unie (solution de repli pour la compatibilité)
        this.doc.setFillColor(...this.hexToRgb(this.colors.primary));
        this.doc.rect(0, footerY, this.pageWidth, footerHeight, 'F');
        
        // Informations de contact
        this.doc.setFontSize(7);
        this.doc.setTextColor(255, 255, 255);
        
        // Colonne 1 : Coordonnées
        this.doc.text('GPA ASSURANCE AUTO', this.margins.left, footerY + 5);
        this.doc.text('69003 Lyon - France', this.margins.left, footerY + 11);
        this.doc.text('Tél: 04 81 91 28 80', this.margins.left, footerY + 16);
        this.doc.text('Email: contact@partenaireassurances.com', this.margins.left, footerY + 19);
        
        // Colonne 2 : Informations légales
        
        // Colonne 3 : Mentions légales
        const col3X = (this.pageWidth / 3) * 2;
        this.doc.text('© ' + new Date().getFullYear() + ' GPA Assurance Auto', col3X, footerY + 5);
        this.doc.text('Tous droits réservés', col3X, footerY + 8);
        this.doc.text('Version du document : 1.0', col3X, footerY + 11);
        this.doc.text('Généré le : ' + new Date().toLocaleDateString('fr-FR'), col3X, footerY + 14);
        
        // Numéro de page
        this.doc.setFontSize(8);
        this.doc.text(
            `Page ${currentPage} / ${totalPages}`, 
            this.pageWidth - this.margins.right, 
            this.pageHeight - 5, 
            { align: 'right' }
        );
        
        // Ligne de séparation
        this.doc.setDrawColor(255, 255, 255, 0.5);
        this.doc.setLineWidth(0.2);
        this.doc.line(this.margins.left, footerY, this.pageWidth - this.margins.right, footerY);
        
        // Restaurer l'état du document
        this.doc.setTextColor(currentTextColor);
        this.doc.setFont(currentFont.fontName, currentFont.fontStyle);
        this.doc.setFontSize(currentFontSize);
    }

    /**
     * Convertit une couleur hexadécimale en RGB
     * @param {string} hex - Couleur au format hexadécimal (#RRGGBB)
     * @returns {number[]} Tableau [R, G, B]
     */
    hexToRgb(hex) {
        if (!hex || typeof hex !== 'string') return [0, 0, 0];
        
        // Supprimer le # s'il est présent
        hex = hex.replace('#', '');
        
        // Convertir en RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return [r, g, b];
    }

    /**
     * Formate une date au format JJ/MM/AAAA
     * @param {Date|string} date - Date à formater
     * @returns {string} Date formatée
     */
    formatDate(date) {
        if (!date) return '';
        
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';
            
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            
            return `${day}/${month}/${year}`;
        } catch (e) {
            console.error('Erreur de formatage de date :', e);
            return '';
        }
    }

    /**
     * Ajoute une nouvelle page avec en-tête et pied de page
     * @returns {number} Nouvelle position Y
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
     * Vérifie si une nouvelle page est nécessaire avant d'ajouter du contenu
     * @param {number} height - Hauteur du contenu à ajouter
     * @returns {boolean} true si une nouvelle page a été ajoutée
     */
    checkPageBreak(height) {
        if (this.currentY + height > this.pageHeight - this.margins.bottom) {
            this.addPage();
            return true;
        }
        return false;
    }

    /**
     * Ajoute une section avec un titre
     * @param {string} title - Titre de la section
     * @param {boolean} [withFrame=false] - Si la section doit avoir un cadre
     */
    addSection(title, withFrame = false) {
        // Vérifier si on doit passer à une nouvelle page
        this.checkPageBreak(20);
        
        // Si withFrame est true, dessiner un cadre autour de la section
        if (withFrame) {
            const frameStartY = this.currentY - 5;
            const frameHeight = 15; // Estimation initiale
            const frameWidth = this.pageWidth - this.margins.left - this.margins.right;
            
            // Dessiner le cadre
            this.doc.setDrawColor(...this.hexToRgb(this.colors.lightGray));
            this.doc.setLineWidth(0.5);
            this.doc.rect(this.margins.left, frameStartY, frameWidth, frameHeight);
            
            // Fond légèrement coloré
            this.doc.setFillColor(248, 249, 250);
            this.doc.rect(this.margins.left, frameStartY, frameWidth, frameHeight, 'F');
        }
        
        // Ajouter le titre de la section
        this.doc.setFontSize(14);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(...this.hexToRgb(this.colors.primary));
        this.doc.text(title, this.margins.left + (withFrame ? 5 : 0), this.currentY);
        
        // Ajouter une ligne de séparation
        this.doc.setDrawColor(200);
        this.doc.line(this.margins.left + (withFrame ? 5 : 0), this.currentY + 2, this.pageWidth - this.margins.right, this.currentY + 2);
        
        // Mettre à jour la position Y
        this.currentY += 12;
    }

    /**
     * Ajoute une paire clé/valeur
     * @param {string} label - Libellé
     * @param {string} value - Valeur
     * @param {boolean} [isBold=false] - Si le libellé doit être en gras
     */
    addKeyValue(label, value, isBold = false) {
        // Vérifier si on doit passer à une nouvelle page
        this.checkPageBreak(10);
        
        // Ajouter le libellé
        this.doc.setFont(this.fonts.bold, isBold ? 'bold' : 'normal');
        this.doc.setFontSize(9); // Police plus petite
        this.doc.text(label, this.margins.left, this.currentY);
        
        // Ajouter la valeur
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.setFontSize(9); // Police plus petite
        this.doc.text(value || '-', this.margins.left + 60, this.currentY);
        
        // Mettre à jour la position Y
        this.currentY += 7;
    }

    /**
     * Retourne le libellé de la formule d'assurance
     * @param {string} codeFormule - Code de la formule
     * @returns {string} Libellé de la formule
     */
    getLibelleFormule(codeFormule) {
        const formules = {
            'tiers': 'Tiers Simple',
            'tiers_etendu': 'Tiers Étendu',
            'tiers_vol_incendie': 'Tiers Vol Incendie',
            'tous_risques': 'Tous Risques',
            'tous_risques_eco': 'Tous Risques Éco',
            'tous_risques_plus': 'Tous Risques +',
            'tous_risques_prestige': 'Tous Risques Prestige'
        };
        return formules[codeFormule] || codeFormule;
    }

    /**
     * Retourne le libellé du fractionnement
     * @param {string} codeFractionnement - Code du fractionnement
     * @returns {string} Libellé du fractionnement
     */
    getLibelleFractionnement(codeFractionnement) {
        const fractionnements = {
            'mensuel': 'Mensuel',
            'trimestriel': 'Trimestriel',
            'semestriel': 'Semestriel',
            'annuel': 'Annuel',
            '1_fois': '1 fois (paiement comptant)',
            '2_fois': '2 fois',
            '3_fois': '3 fois',
            '4_fois': '4 fois'
        };
        return fractionnements[codeFractionnement] || codeFractionnement;
    }

    /**
     * Retourne les garanties en fonction de la formule sélectionnée
     * @param {string} formule - La formule d'assurance (tiers, tier etendu, tout risque, etc.)
     * @returns {Array} Tableau des garanties
     */
    getGarantiesByFormule(formule) {
        // Garanties communes à toutes les formules
        const garantiesCommunes = [
            { 
                nom: 'Responsabilité civile matérielle automobile',
                description: 'Dommages matériels causés aux tiers',
                prix: 'Incluse',
                incluse: true
            },
            { 
                nom: 'Responsabilité civile corporelle automobile',
                description: 'Dommages corporels causés aux tiers',
                prix: 'Incluse',
                incluse: true
            },
            { 
                nom: 'Défense pénale et recours suite à accident',
                description: 'Prise en charge de la défense en justice et des recours',
                prix: 'Incluse',
                incluse: true
            },
            { 
                nom: 'Garantie corporelle du conducteur 300K€',
                description: 'Indemnisation en cas d\'accident corporel du conducteur',
                prix: 'Incluse',
                incluse: true
            }
        ];

        // Garanties spécifiques selon la formule
        let garantiesSpecifiques = [];
        
        // Pour la formule Tiers Simple (on n'ajoute pas de garanties supplémentaires)
        if (formule.toLowerCase() === 'tiers') {
            // Aucune garantie supplémentaire pour le tiers simple
        } 
        // Pour la formule Tiers Plus (tiers_vol_incendie)
        else if (formule.toLowerCase() === 'tiers_vol_incendie' || formule.toLowerCase() === 'tiers etendu') {
            garantiesSpecifiques = [
                { 
                    nom: 'Bris de glace',
                    description: 'Remplacement des vitres et pare-brise',
                    prix: 'Incluse',
                    incluse: true
                },
                { 
                    nom: 'Catastrophes naturelles',
                    description: 'Dommages causés par des catastrophes naturelles',
                    prix: 'Incluse',
                    incluse: true
                },
                { 
                    nom: 'Catastrophes technologiques',
                    description: 'Dommages causés par des catastrophes technologiques',
                    prix: 'Incluse',
                    incluse: true
                },
                { 
                    nom: 'Attentats/Terrorisme',
                    description: 'Dommages causés par des actes de terrorisme',
                    prix: 'Incluse',
                    incluse: true
                },
                { 
                    nom: 'Vol',
                    description: 'Indemnisation en cas de vol du véhicule',
                    prix: 'Incluse',
                    incluse: true
                },
                { 
                    nom: 'Incendie/Événements climatiques',
                    description: 'Dommages causés par incendie ou intempéries',
                    prix: 'Incluse',
                    incluse: true
                }
            ];
        } 
        // Pour la formule Tous Risques
        else if (formule.toLowerCase() === 'tous_risques' || formule.toLowerCase() === 'tous risques') {
            garantiesSpecifiques = [
                { 
                    nom: 'Bris de glace',
                    description: 'Remplacement des vitres et pare-brise',
                    prix: 'Incluse',
                    incluse: true
                },
                { 
                    nom: 'Catastrophes naturelles',
                    description: 'Dommages causés par des catastrophes naturelles',
                    prix: 'Incluse',
                    incluse: true
                },
                { 
                    nom: 'Catastrophes technologiques',
                    description: 'Dommages causés par des catastrophes technologiques',
                    prix: 'Incluse',
                    incluse: true
                },
                { 
                    nom: 'Attentats/Terrorisme',
                    description: 'Dommages causés par des actes de terrorisme',
                    prix: 'Incluse',
                    incluse: true
                },
                { 
                    nom: 'Vol',
                    description: 'Indemnisation en cas de vol du véhicule',
                    prix: 'Incluse',
                    incluse: true
                },
                { 
                    nom: 'Incendie/Événements climatiques',
                    description: 'Dommages causés par incendie ou intempéries',
                    prix: 'Incluse',
                    incluse: true
                },
                { 
                    nom: 'Dommages tous accidents',
                    description: 'Prise en charge des dommages même sans tiers identifié',
                    prix: 'Incluse',
                    incluse: true
                }
            ];
        }
        
        // Fusionner les garanties communes et spécifiques
        return [...garantiesCommunes, ...garantiesSpecifiques];
    }

    /**
     * Génère un tableau comparatif des garanties pour les 3 formules
     * @param {string} formuleChoisie - La formule sélectionnée
     */
    addTableauComparatifGaranties(formuleChoisie) {
        this.addSection('3. TABLEAU COMPARATIF DES GARANTIES');
        
        // Définition des garanties et leur disponibilité par formule
        const garantiesFormules = [
            { garantie: 'Responsabilité Civile Matérielle', tiers: true, bris: true, tousRisques: true },
            { garantie: 'Responsabilité Civile Corporelle', tiers: true, bris: true, tousRisques: true },
            { garantie: 'Défense Pénale et Recours', tiers: true, bris: true, tousRisques: true },
            { garantie: 'Garantie Corporelle Conducteur 300K€', tiers: true, bris: true, tousRisques: true },
            { garantie: 'Bris de Glace', tiers: false, bris: true, tousRisques: true },
            { garantie: 'Catastrophes Naturelles', tiers: false, bris: true, tousRisques: true },
            { garantie: 'Catastrophes Technologiques', tiers: false, bris: true, tousRisques: true },
            { garantie: 'Vol et Tentative de Vol', tiers: false, bris: true, tousRisques: true },
            { garantie: 'Incendie/Événements Climatiques', tiers: false, bris: true, tousRisques: true },
            { garantie: 'Attentats/Terrorisme', tiers: false, bris: true, tousRisques: true },
            { garantie: 'Dommages Tous Accidents', tiers: false, bris: false, tousRisques: true },
            { garantie: 'Assistance 0km', tiers: true, bris: true, tousRisques: true },
            { garantie: 'Extension Garantie Europe', tiers: true, bris: true, tousRisques: true }
        ];
        
        // Dimensions du tableau
        const tableX = this.margins.left;
        const tableY = this.currentY;
        const tableWidth = this.pageWidth - this.margins.left - this.margins.right;
        const cellHeight = 7;
        const tableHeaderHeight = 10;
        
        // Largeurs des colonnes
        const colGarantie = tableWidth * 0.45;
        const colFormule = tableWidth * 0.18;
        
        // En-tête du tableau
        this.doc.setFillColor(...this.hexToRgb(this.colors.primary));
        this.doc.setTextColor(...this.hexToRgb(this.colors.white));
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setFontSize(9);
        this.doc.rect(tableX, tableY, tableWidth, tableHeaderHeight, 'F');
        
        this.doc.text('GARANTIES', tableX + 5, tableY + 6);
        this.doc.text('TIERS SIMPLE', tableX + colGarantie + 5, tableY + 6);
        this.doc.text('TIERS PLUS', tableX + colGarantie + colFormule + 5, tableY + 6);
        this.doc.text('TOUS RISQUES', tableX + colGarantie + (2 * colFormule) + 5, tableY + 6);
        
        // Lignes verticales de l'en-tête
        this.doc.setDrawColor(200, 200, 200);
        this.doc.setLineWidth(0.3);
        this.doc.line(tableX + colGarantie, tableY, tableX + colGarantie, tableY + tableHeaderHeight);
        this.doc.line(tableX + colGarantie + colFormule, tableY, tableX + colGarantie + colFormule, tableY + tableHeaderHeight);
        this.doc.line(tableX + colGarantie + (2 * colFormule), tableY, tableX + colGarantie + (2 * colFormule), tableY + tableHeaderHeight);
        
        let currentY = tableY + tableHeaderHeight;
        
        // Lignes de garanties
        garantiesFormules.forEach((item, index) => {
            // Couleur de fond alternée
            if (index % 2 === 0) {
                this.doc.setFillColor(248, 249, 250);
                this.doc.rect(tableX, currentY, tableWidth, cellHeight, 'F');
            }
            
            // Bordure de la ligne
            this.doc.setDrawColor(200, 200, 200);
            this.doc.setLineWidth(0.3);
            this.doc.rect(tableX, currentY, tableWidth, cellHeight);
            
            // Texte de la garantie
            this.doc.setTextColor(...this.hexToRgb(this.colors.text));
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.setFontSize(8);
            const garantieLines = this.doc.splitTextToSize(item.garantie, colGarantie - 10);
            garantieLines.forEach((line, lineIndex) => {
                this.doc.text(line, tableX + 5, currentY + 4 + (lineIndex * 3));
            });
            
            // Cases à cocher
            const checkboxSize = 4;
            const checkboxY = currentY + (cellHeight - checkboxSize) / 2;
            
            // Fonction pour dessiner une case
            const drawCheckbox = (x, checked) => {
                if (checked) {
                    this.doc.setFillColor(...this.hexToRgb(this.colors.success));
                    this.doc.rect(x, checkboxY, checkboxSize, checkboxSize, 'F');
                    // Croix dans la case
                    this.doc.setDrawColor(255, 255, 255);
                    this.doc.setLineWidth(0.5);
                    this.doc.line(x + 1, checkboxY + 1, x + checkboxSize - 1, checkboxY + checkboxSize - 1);
                    this.doc.line(x + checkboxSize - 1, checkboxY + 1, x + 1, checkboxY + checkboxSize - 1);
                } else {
                    this.doc.setFillColor(240, 240, 240);
                    this.doc.rect(x, checkboxY, checkboxSize, checkboxSize, 'F');
                }
            };
            
            // Cases pour chaque formule
            drawCheckbox(tableX + colGarantie + (colFormule - checkboxSize) / 2, item.tiers);
            drawCheckbox(tableX + colGarantie + colFormule + (colFormule - checkboxSize) / 2, item.bris);
            drawCheckbox(tableX + colGarantie + (2 * colFormule) + (colFormule - checkboxSize) / 2, item.tousRisques);
            
            // Lignes verticales de séparation
            this.doc.setDrawColor(200, 200, 200);
            this.doc.setLineWidth(0.3);
            this.doc.line(tableX + colGarantie, currentY, tableX + colGarantie, currentY + cellHeight);
            this.doc.line(tableX + colGarantie + colFormule, currentY, tableX + colGarantie + colFormule, currentY + cellHeight);
            this.doc.line(tableX + colGarantie + (2 * colFormule), currentY, tableX + colGarantie + (2 * colFormule), currentY + cellHeight);
            
            currentY += cellHeight;
        });
        
        // Bordure extérieure
        this.doc.setDrawColor(...this.hexToRgb(this.colors.primary));
        this.doc.setLineWidth(0.5);
        this.doc.rect(tableX, tableY, tableWidth, currentY - tableY);
        
        // Mettre à jour currentY
        this.currentY = currentY + 15;
        
        // Indiquer la formule choisie
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setFontSize(10);
        this.doc.setTextColor(...this.hexToRgb(this.colors.primary));
        const texteFormule = `Formule sélectionnée: ${formuleChoisie.replace('-', ' ').toUpperCase()}`;
        this.doc.text(texteFormule, this.margins.left, this.currentY);
        
        this.currentY += 10;
    }

    /**
     * Génère le contenu du devis
     * @param {Object} client - Informations du client
     * @param {Array} prestations - Liste des prestations
     * @param {Object} infosComplementaires - Informations complémentaires
     */
    generateDevisContent(client, prestations, infosComplementaires) {
        try {
            // Texte d'introduction
            this.doc.setFontSize(12);
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.setTextColor(...this.hexToRgb(this.colors.text));
            
            const introText1 = 'Nous avons le plaisir de vous remettre votre PROPOSITION D\'ASSURANCE AUTOMOBILE';
            const introText2 = `Devis n°${this.devisNumber}`;
            const introText3 = 'Les prix indiqués sont établis en fonction des réponses aux questions qui vous ont été posées, des informations communiquées ainsi que des garanties choisies.';
            
            this.doc.text(introText1, this.margins.left, this.currentY);
            this.currentY += 8;
            
            this.doc.text(introText2, this.margins.left, this.currentY);
            this.currentY += 8;
            
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.setFontSize(10);
            const introLines = this.doc.splitTextToSize(introText3, this.pageWidth - this.margins.left - this.margins.right);
            introLines.forEach(line => {
                this.doc.text(line, this.margins.left, this.currentY);
                this.currentY += 5;
            });
            
            this.currentY += 10;
            
            // Section 1: Informations du véhicule
            this.addSection('1. INFORMATIONS DU VÉHICULE', true);
            
            // Ajouter un espacement avant le cadre
            this.currentY += 10;
            
            // Cadre pour les informations du véhicule
            const vehicleFrameStartY = this.currentY - 10;
            
            // Informations du véhicule en deux colonnes
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.setFontSize(9);
            
            // Colonne de gauche
            const leftColumnX = this.margins.left + 5;
            const rightColumnX = this.margins.left + (this.pageWidth - this.margins.left - this.margins.right) / 2 + 5;
            
            // Ligne 1: Marque (gauche) et Modèle (droite)
            this.doc.text('Marque:', leftColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(infosComplementaires.vehicule?.marque || infosComplementaires.marque || '-', leftColumnX + 35, this.currentY);
            
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Modèle:', rightColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(infosComplementaires.vehicule?.modele || infosComplementaires.modele || '-', rightColumnX + 35, this.currentY);
            this.currentY += 6;
            
            // Ligne 2: Immatriculation (gauche) et Année (droite)
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Immatriculation:', leftColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(infosComplementaires.vehicule?.immatriculation || 'Non renseignée', leftColumnX + 35, this.currentY);
            
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Année:', rightColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(infosComplementaires.vehicule?.annee || infosComplementaires.annee || '-', rightColumnX + 35, this.currentY);
            this.currentY += 6;
            
            // Ligne 3: Puissance (gauche) et Carburant (droite)
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Puissance:', leftColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(infosComplementaires.vehicule?.puissance ? 
                `${infosComplementaires.vehicule.puissance} CV` : 
                (infosComplementaires.puissance ? `${infosComplementaires.puissance} CV` : '-'), leftColumnX + 35, this.currentY);
            
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Carburant:', rightColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(infosComplementaires.vehicule?.carburant || 'Non spécifié', rightColumnX + 35, this.currentY);
            this.currentY += 6;
            
            // Ligne 4: 1ère mise en circulation (centré)
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('1ère mise en circ.:', leftColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(infosComplementaires.vehicule?.dateMec || infosComplementaires.vehicule?.dateMiseCirculation || 'Non spécifiée', leftColumnX + 35, this.currentY);
            this.currentY += 6;
            
            // Fermer le cadre du véhicule
            const vehicleFrameEndY = this.currentY + 5;
            const vehicleFrameWidth = this.pageWidth - this.margins.left - this.margins.right;
            this.doc.setDrawColor(...this.hexToRgb(this.colors.primary));
            this.doc.setLineWidth(1);
            this.doc.rect(this.margins.left, vehicleFrameStartY, vehicleFrameWidth, vehicleFrameEndY - vehicleFrameStartY);
            
            this.currentY += 20;
            
            // Section 2: Informations du conducteur
            this.addSection('2. INFORMATIONS DU CONDUCTEUR', true);
            
            // Ajouter un espacement avant le cadre
            this.currentY += 10;
            
            // Cadre pour les informations du conducteur
            const driverFrameStartY = this.currentY - 10;
            
            // Informations du conducteur en deux colonnes
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.setFontSize(9);
            
            // Colonne de gauche
            const driverLeftColumnX = this.margins.left + 5;
            const driverRightColumnX = this.margins.left + (this.pageWidth - this.margins.left - this.margins.right) / 2 + 5;
            
            // Ligne 1: Nom (gauche) et Prénom (droite)
            this.doc.text('Nom:', driverLeftColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(client.nom || '-', driverLeftColumnX + 35, this.currentY);
            
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Prénom:', driverRightColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(client.prenom || '-', driverRightColumnX + 35, this.currentY);
            this.currentY += 6;
            
            // Ligne 2: Date de naissance (gauche) et Téléphone (droite)
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Date de naissance:', driverLeftColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(client.dateNaissance ? this.formatDate(new Date(client.dateNaissance)) : '-', driverLeftColumnX + 35, this.currentY);
            
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Téléphone:', driverRightColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(client.telephone || '-', driverRightColumnX + 35, this.currentY);
            this.currentY += 6;
            
            // Ligne 3: Email (gauche) et Permis N° (droite)
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Email:', driverLeftColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(client.email || '-', driverLeftColumnX + 35, this.currentY);
            
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Permis N°:', driverRightColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(client.permisNumero || 'Non spécifié', driverRightColumnX + 35, this.currentY);
            this.currentY += 6;
            
            // Ligne 4: Obtenu le (gauche) et Code postal (droite)
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Obtenu le:', driverLeftColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(client.permis?.dateObtention || client.permisDateObtention || client.permis ? this.formatDate(new Date(client.permis?.dateObtention || client.permisDateObtention || client.permisDate)) : '-', driverLeftColumnX + 35, this.currentY);
            
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Code postal:', driverRightColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(client.codePostal || '-', driverRightColumnX + 35, this.currentY);
            this.currentY += 6;
            
            // Ligne 5: Adresse (centré sur toute la largeur)
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Adresse:', driverLeftColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(client.adresse || '-', driverLeftColumnX + 35, this.currentY);
            this.currentY += 6;
            
            // Ligne 6: Ville (centré sur toute la largeur)
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Ville:', driverLeftColumnX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(client.ville || '-', driverLeftColumnX + 35, this.currentY);
            this.currentY += 6;
            
            // Fermer le cadre du conducteur
            const driverFrameEndY = this.currentY + 5;
            const driverFrameWidth = this.pageWidth - this.margins.left - this.margins.right;
            this.doc.setDrawColor(...this.hexToRgb(this.colors.primary));
            this.doc.setLineWidth(1);
            this.doc.rect(this.margins.left, driverFrameStartY, driverFrameWidth, driverFrameEndY - driverFrameStartY);
            
            // Ajouter le pied de page pour la première page
            this.addFooter();
            
            // Nouvelle page pour la section Antécédents
            this.addPage();
            
            // Section 3: Antécédents
            this.addSection('3. ANTÉCÉDENTS');
            
            // Cadre pour les informations antécédents
            const antecedentsFrameStartY = this.currentY - 5;
            this.currentY += 5;
            
            // Antécédents d'assurance
            if (infosComplementaires.antecedentsAssurance) {
                const antecedents = infosComplementaires.antecedentsAssurance;
                
                // Définir la taille de police pour les informations antécédents
                this.doc.setFontSize(9);
                
                // Statut d'assurance
                this.doc.text('Déjà assuré(e):', this.margins.left + 5, this.currentY);
                this.doc.text(antecedents.dejaAssure ? 'Oui' : 'Non', this.margins.left + 40, this.currentY);
                this.currentY += 6;
                
                if (antecedents.dejaAssure) {
                    this.doc.text('Ancienneté d\'assurance:', this.margins.left + 5, this.currentY);
                    this.doc.text(antecedents.moisAssurance ? `${antecedents.moisAssurance} mois sur les 36 derniers mois` : 'Non spécifiée', this.margins.left + 50, this.currentY);
                    this.currentY += 6;
                    
                    this.doc.text('Bonus/Malus:', this.margins.left + 5, this.currentY);
                    this.doc.text(antecedents.bonusMalus ? antecedents.bonusMalus + ' %' : 'Non spécifié', this.margins.left + 40, this.currentY);
                    this.currentY += 6;
                    
                    // Situation du contrat actuel
                    if (antecedents.situationContrat) {
                    }
                }
                
                // Historique des sinistres
                this.doc.text('A déjà eu des sinistres:', this.margins.left + 5, this.currentY);
                this.doc.text(antecedents.aEuSinistres ? 'Oui' : 'Non', this.margins.left + 50, this.currentY);
                this.currentY += 6;
                
                if (antecedents.aEuSinistres && antecedents.sinisters && antecedents.sinisters.length > 0) {
                    this.doc.text('Détail des sinistres déclarés :', this.margins.left + 5, this.currentY);
                    this.currentY += 5;
                    
                    antecedents.sinisters.forEach((sinistre, index) => {
                        if (this.checkPageBreak(20)) this.currentY += 5;
                        
                        this.doc.text(`Sinistre ${index + 1} :`, this.margins.left + 10, this.currentY);
                        this.currentY += 5;
                        
                        const details = `• Date: ${sinistre.date || 'Non spécifiée'} | Nature: ${sinistre.nature || 'Non spécifiée'} | Responsabilité: ${sinistre.responsabilite || 'Non spécifiée'}`;
                        this.doc.text(details, this.margins.left + 15, this.currentY);
                        this.currentY += 8;
                    });
                    
                    // Réinitialiser la police et la couleur
                    this.doc.setFontSize(9);
                    this.doc.setTextColor(...this.hexToRgb(this.colors.text));
                }
            } else {
                this.doc.text('Aucun antécédent d\'assurance déclaré', this.margins.left + 5, this.currentY);
                this.currentY += 6;
            }
            
            // Fermer le cadre des antécédents
            const antecedentsFrameEndY = this.currentY + 5;
            const antecedentsFrameWidth = this.pageWidth - this.margins.left - this.margins.right;
            this.doc.setDrawColor(...this.hexToRgb(this.colors.primary));
            this.doc.setLineWidth(1);
            this.doc.rect(this.margins.left, antecedentsFrameStartY, antecedentsFrameWidth, antecedentsFrameEndY - antecedentsFrameStartY);
            
            // Ajouter le pied de page pour la deuxième page
            this.addFooter();
            
            // Ajouter de l'espace avant le tableau des garanties
            this.currentY += 15;
            
            // Section 3: Tableau comparatif des garanties
            this.addTableauComparatifGaranties(infosComplementaires.typeAssurance);
            
            // Ajouter le pied de page pour la deuxième page
            this.addFooter();
            
            // Nouvelle page pour PRESTATIONS ET MONTANTS
            this.addPage();
                                
            // Section des prestations (si nécessaire)
            if (prestations && prestations.length > 0) {
                this.doc.setFontSize(11);
                this.doc.setFont(this.fonts.bold, 'bold');
                this.doc.text('PRESTATIONS ET MONTANTS', this.margins.left, this.currentY);
                this.currentY += 10;
                
                // En-tête du tableau des prestations
                this.doc.setFillColor(...this.hexToRgb(this.colors.lightGray));
                this.doc.rect(this.margins.left, this.currentY, this.pageWidth - this.margins.left - this.margins.right, 8, 'F');
                this.doc.setFontSize(9);
                this.doc.setTextColor(...this.hexToRgb(this.colors.text));
                this.doc.text('DÉSIGNATION', this.margins.left + 5, this.currentY + 5);
                this.doc.text('MONTANT', this.pageWidth - this.margins.right - 5, this.currentY + 5, { align: 'right' });
                this.currentY += 10;
                
                // Ligne de séparation
                this.doc.setDrawColor(200);
                this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY);
                this.currentY += 5;
                
                // Contenu du tableau
                this.doc.setFont(this.fonts.normal, 'normal');
                let total = 0;
                
                // Afficher le type d'assurance
                if (infosComplementaires && infosComplementaires.typeAssurance) {
                    const typeAssurance = infosComplementaires.typeAssurance === 'tous_risques' ? 'Tous Risques' : 
                                        infosComplementaires.typeAssurance === 'tiers_etendu' ? 'Tiers Étendu' : 'Tiers Simple';
                    this.doc.text('Type d\'assurance', this.margins.left, this.currentY);
                    this.doc.text(typeAssurance, this.pageWidth - this.margins.right, this.currentY, { align: 'right' });
                    this.currentY += 7;
                }
                
                // Afficher le fractionnement
                if (infosComplementaires && infosComplementaires.fractionnement) {
                    const fractionnement = this.getLibelleFractionnement(infosComplementaires.fractionnement);
                    this.doc.text('Mode de règlement', this.margins.left, this.currentY);
                    this.doc.text(fractionnement, this.pageWidth - this.margins.right, this.currentY, { align: 'right' });
                    this.currentY += 7;
                }
                
                // Ligne de séparation fine
                this.doc.setDrawColor(220);
                this.doc.line(this.margins.left + 10, this.currentY, this.pageWidth - this.margins.right - 10, this.currentY);
                this.currentY += 7;
                
                // Afficher la cotisation
                let montantCotisation = 0;
                if (infosComplementaires && infosComplementaires.cotisation) {
                    montantCotisation = parseFloat(infosComplementaires.cotisation) || 0;
                    this.doc.setFont(this.fonts.bold, 'bold');
                    this.doc.text('Montant de la cotisation', this.margins.left, this.currentY);
                    this.doc.text(montantCotisation.toFixed(2) + ' €', this.pageWidth - this.margins.right, this.currentY, { align: 'right' });
                    this.currentY += 7;
                    this.doc.setFont(this.fonts.normal, 'normal');
                }
                
                // Afficher les frais de dossier
                const fraisDossier = infosComplementaires && infosComplementaires.fraisDossier ? 
                    parseFloat(infosComplementaires.fraisDossier) : 0;
                this.doc.text('Frais de dossier', this.margins.left, this.currentY);
                this.doc.text(fraisDossier.toFixed(2) + ' €', this.pageWidth - this.margins.right, this.currentY, { align: 'right' });
                total += fraisDossier;
                this.currentY += 7;

                // Afficher l'option assistance si elle est sélectionnée
                const assistanceMontant = infosComplementaires && infosComplementaires.assistance ? 12.50 : 0;
                if (assistanceMontant > 0) {
                    this.doc.text('Assistance 0km (option)', this.margins.left, this.currentY);
                    this.doc.text(assistanceMontant.toFixed(2) + ' €', this.pageWidth - this.margins.right, this.currentY, { align: 'right' });
                    total += assistanceMontant;
                    this.currentY += 7;
                }
                
                const montantDeuxMois = montantCotisation ? montantCotisation * 2 : 0;
                if (montantDeuxMois > 0) {
                    this.doc.setFont(this.fonts.bold, 'bold');
                    this.doc.text('Montant dû (2 mois de cotisation)', this.margins.left, this.currentY);
                    this.doc.text(montantDeuxMois.toFixed(2) + ' €', this.pageWidth - this.margins.right, this.currentY, { align: 'right' });
                    total += montantDeuxMois;
                    this.currentY += 7;
                    this.doc.setFont(this.fonts.normal, 'normal');
                }
                
                // Ligne de séparation avant le total
                this.doc.setDrawColor(200);
                this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY);
                this.currentY += 5;
                
                // Afficher le total
                this.doc.setFont(this.fonts.bold, 'bold');
                this.doc.text('TOTAL TTC', this.margins.left, this.currentY);
                this.doc.text(total.toFixed(2) + ' €', this.pageWidth - this.margins.right, this.currentY, { align: 'right' });
                this.doc.setFont(this.fonts.normal, 'normal');
                this.currentY += 10;
                
                // Ajouter le choix de fractionnement si disponible
                if (infosComplementaires && infosComplementaires.fractionnement) {
                    this.doc.setFont(this.fonts.normal, 'normal');
                    const libelleFractionnement = this.getLibelleFractionnement(infosComplementaires.fractionnement);
                    this.doc.text('MODE DE RÈGLEMENT : ' + libelleFractionnement, this.margins.left, this.currentY);
                    this.currentY += 10;
                }
                
                // Ligne de séparation
                this.doc.setDrawColor(200);
                this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY);
                this.currentY += 5;
                
                // Total TTC
                this.doc.setFont(this.fonts.bold, 'bold');
                this.doc.text('TOTAL TTC', this.pageWidth - this.margins.right - 70, this.currentY);
                this.doc.text(total.toFixed(2) + ' €', this.pageWidth - this.margins.right, this.currentY, { align: 'right' });
                this.doc.setFont(this.fonts.normal, 'normal');
                
                this.currentY += 15;
            }
            
            // Section Conditions générales
            this.addSection('CONDITIONS GÉNÉRALES');
            this.doc.setFontSize(8);
            this.doc.text(
                'Le présent devis est valable 30 jours à compter de sa date d\'émission. Les conditions générales de vente sont disponibles sur simple demande. En cas de sinistre, veuillez contacter notre service client au 04 81 91 28 80.',
                this.margins.left,
                this.currentY,
                {
                    maxWidth: this.pageWidth - this.margins.left - this.margins.right,
                    align: 'justify'
                }
            );
            
            // Ajouter une nouvelle page pour les déclarations
            this.addPage();
            
            // Section Protection des données personnelles
            this.addSection('DISPOSITIONS RELATIVES À LA PROTECTION DES DONNÉES PERSONNELLES');
            this.doc.setFontSize(8);
            this.doc.setTextColor(...this.hexToRgb(this.colors.text));
            
            const dataProtectionText = `Nous recueillons vos données personnelles et les utilisons pour la gestion de cette demande et pour notre relation commerciale. Elles sont destinées prioritairement à votre courtier et aux entreprises du Groupe Allianz ; mais également aux différents organismes et partenaires directement impliqués dans votre contrat. Ces destinataires se situent parfois en dehors de l'Union européenne. Dans ce cas, nous concevons des garanties spécifiques pour assurer la protection complète de vos données. Vos informations personnelles nous aident à mieux vous connaître et ainsi à vous proposer des solutions et services qui vous correspondent. Nous les conservons tout au long de la vie de votre contrat. Une fois ce dernier fermé, elles sont conservées pendant le délai de prescription. Vous gardez bien sûr tout loisir d'y accéder, de demander leur rectification, portabilité ou effacement et de vous opposer à leur utilisation. Vous pouvez également prendre contact avec le Délégué à la Protection des Données Personnelles (DPO) pour toute information ou contestation (loi « Informatique et Libertés » du 6 janvier 1978). Pour cela, il vous suffit d'adresser une demande écrite à votre courtier dont les coordonnées figurent sur le présent document. Vous pouvez également vous adresser à la CNIL.`;
            
            const dataProtectionLines = this.doc.splitTextToSize(dataProtectionText, this.pageWidth - this.margins.left - this.margins.right - 20);
            dataProtectionLines.forEach(line => {
                this.doc.text(line, this.margins.left + 10, this.currentY);
                this.currentY += 4;
            });
            
            this.currentY += 8;
            
            // Offres commerciales
            const offersText = `J'accepte de recevoir les offres commerciales personnalisées distribuées par mon courtier Non`;
            const offersLines = this.doc.splitTextToSize(offersText, this.pageWidth - this.margins.left - this.margins.right - 20);
            offersLines.forEach(line => {
                this.doc.text(line, this.margins.left + 10, this.currentY);
                this.currentY += 4;
            });
            
            this.currentY += 6;
            
            const targetingText = `Le ciblage des offres commerciales peut être automatisé et basé sur des profils de clients ou de prospects. Pour plus de détails, reportez-vous aux documents contractuels, notamment les dispositions générales ou notices d'information et, de manière générale, aux sites internet d'Allianz et de votre courtier.`;
            const targetingLines = this.doc.splitTextToSize(targetingText, this.pageWidth - this.margins.left - this.margins.right - 20);
            targetingLines.forEach(line => {
                this.doc.text(line, this.margins.left + 10, this.currentY);
                this.currentY += 4;
            });
            
            this.currentY += 6;
            
            const antiFraudText = `Protéger nos clients et nous protéger nous-mêmes est au cœur de la politique de maîtrise des risques d'Allianz et de la lutte anti-fraude. Aussi, nous gardons la possibilité de vérifier ces informations et de saisir, si nécessaire, les autorités compétentes.`;
            const antiFraudLines = this.doc.splitTextToSize(antiFraudText, this.pageWidth - this.margins.left - this.margins.right - 20);
            antiFraudLines.forEach(line => {
                this.doc.text(line, this.margins.left + 10, this.currentY);
                this.currentY += 4;
            });
            
            this.currentY += 15;
            
            // Section Mentions légales
            this.addSection('MENTIONS LÉGALES');
            this.doc.setFontSize(8);
            this.doc.setTextColor(...this.hexToRgb(this.colors.text));
            
            // Compagnie d'assurance
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Compagnie d\'assurance', this.margins.left + 10, this.currentY);
            this.currentY += 6;
            
            this.doc.setFont(this.fonts.normal, 'normal');
            const compagnieText = `Les garanties du contrat sont souscrites auprès d'Allianz IARD, Entreprise régie par le code des assurances. Société anonyme au capital de 991 967 200 euros, dont le siège social est situé : 1 cours Michelet, CS30051, 92076 Paris La Défense cedex. 542 110 291 RCS Nanterre et soumises à l'Autorité de contrôle prudentiel et de résolution (ACPR) sise 4, Place de Budapest-CS 92459-75436 PARIS cedex 09.`;
            const compagnieLines = this.doc.splitTextToSize(compagnieText, this.pageWidth - this.margins.left - this.margins.right - 20);
            compagnieLines.forEach(line => {
                this.doc.text(line, this.margins.left + 10, this.currentY);
                this.currentY += 4;
            });
            
            this.currentY += 8;
            
            // Assisteur
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Assisteur', this.margins.left + 10, this.currentY);
            this.currentY += 6;
            
            this.doc.setFont(this.fonts.normal, 'normal');
            const assisteurText = `FILASSISTANCE, Société Anonyme au capital de 4 100 000 €, entreprise régie par le Code des assurances, inscrite au RCS de Nanterre sous le n° 433 012 689, enregistrée sous l'identifiant unique ADEME : FR329780_01LOPR, dont le siège social se situe au 108 Bureaux de la Colline, 92213 SAINT-CLOUD Cedex`;
            const assisteurLines = this.doc.splitTextToSize(assisteurText, this.pageWidth - this.margins.left - this.margins.right - 20);
            assisteurLines.forEach(line => {
                this.doc.text(line, this.margins.left + 10, this.currentY);
                this.currentY += 4;
            });
            
            this.currentY += 8;
            
            // Protection Juridique
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Protection Juridique', this.margins.left + 10, this.currentY);
            this.currentY += 6;
            
            this.doc.setFont(this.fonts.normal, 'normal');
            const juridiqueText = `SOLUCIA Protection Juridique, 3 Boulevard Diderot – CS31246 – 75590 PARIS Cedex.`;
            const juridiqueLines = this.doc.splitTextToSize(juridiqueText, this.pageWidth - this.margins.left - this.margins.right - 20);
            juridiqueLines.forEach(line => {
                this.doc.text(line, this.margins.left + 10, this.currentY);
                this.currentY += 4;
            });
            
            this.currentY += 15;
            
            // Section Déclarations sur une nouvelle page
            this.addSection('LES DÉCLARATIONS');
            this.doc.setFontSize(8);
            this.doc.setTextColor(...this.hexToRgb(this.colors.text));

            const declarationsSections = [
                {
                    title: 'Déclarations générales',
                    bullets: [
                        `Je soussigné(e) ${client.prenom} ${client.nom}, demeurant ${client.adresse}, ${client.codePostal} ${client.ville}, certifie l'exactitude de toutes les informations fournies.`,
                        'Toute fausse déclaration intentionnelle, omission ou inexactitude peut entraîner les sanctions prévues aux articles L.113-8 et L.113-9 du Code des assurances.',
                        'En cas de résiliation ou suspension d’un contrat suite à un sinistre ou manquement contractuel, cette information peut être portée au fichier central professionnel.'
                    ]
                },
                {
                    title: 'Engagements du souscripteur',
                    bullets: [
                        'Je certifie être titulaire du certificat d’immatriculation (ou mon conjoint) et disposer d’une résidence habituelle fixe.',
                        'Je suis le conducteur habituel du véhicule et j’ai été informé(e) des modalités de réclamation : reclamations@partenaireassurances.com.',
                        'J’accepte que l’assureur mette en œuvre les traitements nécessaires pour lutter contre le blanchiment de capitaux et le financement du terrorisme.'
                    ]
                },
                {
                    title: 'Déclarations concernant le véhicule',
                    bullets: [
                        'Le véhicule est immatriculé en France et strictement conforme aux caractéristiques d’origine du constructeur.',
                        'Il ne présente aucun dommage majeur de carrosserie ni de bris de glace au moment de la souscription.',
                        'Il n’est pas utilisé pour le transport public de marchandises, de voyageurs, ou dans un cadre de compétition, taxi, ambulance ou auto-école.'
                    ]
                }
            ];

            declarationsSections.forEach(section => {
                if (this.checkPageBreak(30)) this.currentY += 5;
                this.doc.setFont(this.fonts.bold, 'bold');
                this.doc.setFontSize(9);
                this.doc.text(section.title, this.margins.left, this.currentY);
                this.currentY += 6;
                this.doc.setFont(this.fonts.normal, 'normal');
                this.doc.setFontSize(8);
                section.bullets.forEach(bullet => {
                    if (this.checkPageBreak(10)) this.currentY += 5;
                    this.doc.text(`• ${bullet}`, this.margins.left + 4, this.currentY, {
                        maxWidth: this.pageWidth - this.margins.left - this.margins.right - 8
                    });
                    this.currentY += 6;
                });
                this.currentY += 4;
            });

            if (this.checkPageBreak(30)) this.currentY += 5;
            this.doc.setFontSize(10);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text('Fait à Paris, le ' + this.formatDate(new Date()), this.margins.left, this.currentY);
            this.currentY += 15;
            this.doc.text('Le client', this.margins.left, this.currentY);
            this.doc.text('Le responsable GPA ASSURANCE', this.pageWidth - this.margins.right - 60, this.currentY, { align: 'right' });
            this.currentY += 15;
            this.doc.setLineWidth(0.5);
            this.doc.line(this.margins.left, this.currentY, this.margins.left + 80, this.currentY);
            this.doc.line(this.pageWidth - this.margins.right - 80, this.currentY, this.pageWidth - this.margins.right, this.currentY);
            
        } catch (error) {
            console.error('Erreur lors de la génération du contenu du devis :', error);
            throw error;
        }
    }
    
    /**
     * Retourne le libellé de la formule d'assurance
     * @param {Object} infosComplementaires - Informations complémentaires
     * @returns {boolean} true si la génération a réussi
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
            
            // Ajouter l'en-tête et le pied de page à la première page
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
}

// Exporter la classe pour une utilisation globale
if (typeof window !== 'undefined') {
    window.DevisGenerator = DevisGenerator;
}

// Exporter pour les modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DevisGenerator };
}
