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
            { garantie: 'Vol et Tentative de Vol', tiers: false, bris: false, tousRisques: true },
            { garantie: 'Incendie/Événements Climatiques', tiers: false, bris: false, tousRisques: true },
            { garantie: 'Attentats/Terrorisme', tiers: false, bris: false, tousRisques: true },
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
        this.doc.text('TIERS BRIS', tableX + colGarantie + colFormule + 5, tableY + 6);
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