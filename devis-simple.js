// Vérifier que jsPDF est disponible
if (typeof jspdf === 'undefined') {
    throw new Error('La bibliothèque jsPDF n\'est pas chargée correctement');
}

// Exposer la classe globalement
window.DevisGenerator = class DevisGenerator {
    constructor() {
        // Options par défaut
        this.options = {
            margin: 40,
            fontSize: 12,
            lineHeight: 1.5,
            pageWidth: 210, // A4 en mm
            pageHeight: 297, // A4 en mm
            footerHeight: 20
        };
    }

    /**
     * Génère un numéro de devis unique basé sur la date
     * @returns {string} Numéro de devis au format DEV-YYYYMMDD-HHMMSS
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
     * Ajoute un pied de page avec le numéro de devis
     * @param {Object} doc - Instance jsPDF
     * @param {string} devisNumber - Numéro de devis
     * @param {boolean} isLastPage - Indique si c'est la dernière page
     */
    addFooter(doc, devisNumber, isLastPage = true) {
        const pageCount = doc.internal.getNumberOfPages();
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        
        // Numéro de page
        doc.text(
            `Page ${pageCount}`, 
            this.options.margin, 
            this.options.pageHeight - 10
        );
        
        // Numéro de devis
        doc.text(
            `Devis n° ${devisNumber}`, 
            this.options.pageWidth - this.options.margin, 
            this.options.pageHeight - 10,
            { align: 'right' }
        );
        
        // Ligne de séparation
        doc.setDrawColor(200);
        doc.line(
            this.options.margin,
            this.options.pageHeight - 15,
            this.options.pageWidth - this.options.margin,
            this.options.pageHeight - 15
        );
    }

    /**
     * Génère un devis simple avec uniquement le pied de page
     * @param {Object} client - Informations du client
     * @param {Array} prestations - Liste des prestations
     * @param {Object} infosComplementaires - Informations complémentaires
     */
    generateDevis(client, prestations, infosComplementaires) {
        // Créer une nouvelle instance de jsPDF
        const doc = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Générer un numéro de devis
        const devisNumber = this.generateDevisNumber();
        
        // Ajouter le contenu vide (page blanche)
        doc.setFont('helvetica');
        doc.setFontSize(12);
        
        // Ajouter le pied de page
        this.addFooter(doc, devisNumber, true);
        
        // Enregistrer le PDF
        doc.save(`devis-${devisNumber}.pdf`);
        
        return devisNumber;
    }
};

// Exporter pour une utilisation avec des modules (si nécessaire)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DevisGenerator };
}
