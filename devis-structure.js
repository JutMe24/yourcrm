/**
 * Classe pour générer un devis PDF professionnel
 */

// Vérifier si jsPDF est disponible
if (typeof jspdf === 'undefined') {
    console.error('Erreur: jsPDF n\'est pas chargé correctement');
    document.write('<div style="color:red;padding:20px;font-family:Arial;">Erreur: La bibliothèque jsPDF n\'est pas chargée correctement. Veuillez vérifier votre connexion Internet.</div>');
}

// Vérifier si jsPDF est correctement initialisé
if (typeof jspdf === 'object' && !window.jsPDF && jspdf.jsPDF) {
    window.jsPDF = jspdf.jsPDF;
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
            black: '#000000'       // Noir
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
        
        // Largeur utile de la page
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
        
        // Hauteur de la page
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        
        // Position Y courante
        this.currentY = this.margins.top;
        
        // Numéro de page
        this.pageNumber = 1;
        
        // Numéro de devis
        this.devisNumber = this.generateDevisNumber();
    }
    
    /**
     * Génère un devis PDF à partir des données fournies
     * @param {Object} client - Informations du client
     * @param {Array} prestations - Liste des prestations à facturer
     * @param {Object} infosComplementaires - Informations complémentaires (véhicule, date d'effet, etc.)
     */
    generateDevis(client, prestations, infosComplementaires) {
        try {
            // Réinitialiser la position Y
            this.currentY = this.margins.top;
            
            // PAGE 1: Informations du conducteur, du véhicule et antécédents
            this.addHeader();
            
            // Ajouter les informations du client
            this.addClientInfo(client);
            
            // Ajouter les détails du véhicule
            this.addVehicleInfo(infosComplementaires.vehicule);
            
            // Ajouter les antécédents d'assurance si disponibles
            if (infosComplementaires.antecedents) {
                this.addAntecedentsInfo(infosComplementaires.antecedents);
            }
            
            // Ajouter le pied de page pour la première page
            this.addFooter();
            
            // PAGE 2: Tableau des garanties
            this.addPage();
            this.addHeader();
            
            // Ajouter les garanties selon la formule choisie
            if (infosComplementaires.typeAssurance) {
                // Définir les formules disponibles avec leurs garanties
                const formules = {
                    'tous_risques': {
                        description: 'Formule Tous Risques - Protection maximale',
                        garanties: {
                            dommagesCollision: {
                                nom: 'Dommages collision',
                                description: 'Prise en charge des dommages en cas de collision',
                                montant: null,
                                incluse: true,
                                ordre: 1
                            },
                            vol: {
                                nom: 'Vol',
                                description: 'Indemnisation en cas de vol du véhicule',
                                montant: null,
                                incluse: true,
                                ordre: 2
                            },
                            brisGlace: {
                                nom: 'Bris de glace',
                                description: 'Remplacement des vitres et phares en cas de bris',
                                montant: 5.50,
                                incluse: true,
                                ordre: 3
                            },
                            incendie: {
                                nom: 'Incendie',
                                description: 'Prise en charge des dommages liés à un incendie',
                                montant: null,
                                incluse: true,
                                ordre: 4
                            },
                            assistance0km: {
                                nom: 'Assistance 0km',
                                description: 'Dépannage et remorquage 24h/24 et 7j/7',
                                montant: 12.50,
                                incluse: infosComplementaires.assistance || false,
                                ordre: 5
                            }
                        }
                    },
                    'tiers': {
                        description: 'Formule au Tiers - Couverture minimale légale',
                        garanties: {
                            responsabiliteCivile: {
                                nom: 'Responsabilité Civile',
                                description: 'Dommages causés aux tiers',
                                montant: null,
                                incluse: true,
                                ordre: 1
                            },
                            defenseRecours: {
                                nom: 'Défense et recours',
                                description: 'Prise en charge de la défense en justice',
                                montant: null,
                                incluse: true,
                                ordre: 2
                            },
                            assistance0km: {
                                nom: 'Assistance 0km',
                                description: 'Dépannage et remorquage 24h/24 et 7j/7',
                                montant: 12.50,
                                incluse: infosComplementaires.assistance || false,
                                ordre: 3
                            }
                        }
                    },
                    'tiers_vol_incendie': {
                        description: 'Formule Tiers, Vol et Incendie - Protection intermédiaire',
                        garanties: {
                            responsabiliteCivile: {
                                nom: 'Responsabilité Civile',
                                description: 'Dommages causés aux tiers',
                                montant: null,
                                incluse: true,
                                ordre: 1
                            },
                            defenseRecours: {
                                nom: 'Défense et recours',
                                description: 'Prise en charge de la défense en justice',
                                montant: null,
                                incluse: true,
                                ordre: 2
                            },
                            vol: {
                                nom: 'Vol',
                                description: 'Indemnisation en cas de vol du véhicule',
                                montant: null,
                                incluse: true,
                                ordre: 3
                            },
                            incendie: {
                                nom: 'Incendie',
                                description: 'Prise en charge des dommages liés à un incendie',
                                montant: null,
                                incluse: true,
                                ordre: 4
                            },
                            assistance0km: {
                                nom: 'Assistance 0km',
                                description: 'Dépannage et remorquage 24h/24 et 7j/7',
                                montant: 12.50,
                                incluse: infosComplementaires.assistance || false,
                                ordre: 5
                            }
                        }
                    }
                };
                
                this.addGaranties(formules, infosComplementaires.typeAssurance);
            }
            
            // Ajouter les prestations
            this.addPrestations(prestations);
            
            // Ajouter les conditions générales
            this.addConditionsGenerales(infosComplementaires);
            
            // Ajouter le pied de page
            this.addFooter();
            
            // Enregistrer le PDF
            const fileName = `Devis_${client.nom}_${client.prenom}_${this.formatDate(new Date())}.pdf`;
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
        // Enregistrer la position Y actuelle
        const startY = this.currentY;
        
        // Couleur de fond pour l'en-tête
        this.doc.setFillColor(...this.hexToRgb(this.colors.primary));
        this.doc.rect(0, 0, this.pageWidth, 25, 'F');
        
        // Logo et titre
        this.doc.setFontSize(18);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(...this.hexToRgb(this.colors.white));
        this.doc.text('GPA ASSURANCE AUTO', this.margins.left, 18);
        
        // Bandeau d'information
        this.doc.setFillColor(...this.hexToRgb(this.colors.secondary));
        this.doc.rect(0, 25, this.pageWidth, 8, 'F');
        
        // Informations de contact
        this.doc.setFontSize(8);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text('123 Avenue des Assurances • 75000 Paris • Tél: 01 23 45 67 89 • contact@gpa-assurance.fr', 
            this.margins.left, 30, { align: 'left' });
        
        // Réinitialiser la couleur du texte
        this.doc.setTextColor(...this.hexToRgb(this.colors.text));
        
        // En-tête du document
        this.currentY = 45;
        this.doc.setFontSize(16);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('DEVIS', this.margins.left, this.currentY);
        
        // Numéro de devis et date
        this.doc.setFontSize(10);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(`N°: ${this.devisNumber}`, this.margins.left, this.currentY + 8);
        this.doc.text(`Date: ${this.formatDate(new Date())}`, this.margins.left, this.currentY + 13);
        
        // Ligne de séparation
        this.currentY += 25;
        this.doc.setDrawColor(...this.hexToRgb(this.colors.border));
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY);
        
        this.currentY += 10;
    }

    /**
     * Ajoute les informations du client au document
     * @param {Object} client - Informations du client
     */
    addClientInfo(client) {
        // Vérifier l'espace disponible
        if (this.currentY > this.pageHeight - 50) {
            this.addPage();
        }
        
        // Titre de la section client
        this.doc.setFillColor(...this.hexToRgb(this.colors.primary));
        this.doc.rect(this.margins.left, this.currentY, this.contentWidth, 8, 'F');
        
        this.doc.setFontSize(11);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(...this.hexToRgb(this.colors.white));
        this.doc.text('INFORMATIONS DU CLIENT', this.margins.left + 5, this.currentY + 5);
        
        this.currentY += 12;
        
        // Contenu des informations client
        this.doc.setFontSize(9);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.setTextColor(...this.hexToRgb(this.colors.text));
        
        // Mémoriser la position Y de départ pour le cadre
        const startY = this.currentY;
        
        // Ligne 1: Nom et prénom
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Nom :', this.margins.left, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(client.nom || 'Non renseigné', this.margins.left + 15, this.currentY);
        
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Prénom :', this.margins.left + 70, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(client.prenom || 'Non renseigné', this.margins.left + 90, this.currentY);
        
        // Ligne 2: Date de naissance et téléphone
        this.currentY += 6;
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Date de naissance :', this.margins.left, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(client.dateNaissance || 'Non renseignée', this.margins.left + 40, this.currentY);
        
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Téléphone :', this.margins.left + 90, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(client.telephone || 'Non renseigné', this.margins.left + 115, this.currentY);
        
        // Ligne 3: Email
        this.currentY += 6;
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Email :', this.margins.left, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(client.email || 'Non renseigné', this.margins.left + 15, this.currentY);
        
        // Ligne 4: Adresse
        this.currentY += 6;
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Adresse :', this.margins.left, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(client.adresse || 'Non renseignée', this.margins.left + 20, this.currentY);
        
        // Ligne 5: Code postal et ville
        this.currentY += 6;
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Code postal :', this.margins.left, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(client.codePostal || 'Non renseigné', this.margins.left + 30, this.currentY);
        
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Ville :', this.margins.left + 70, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(client.ville || 'Non renseignée', this.margins.left + 85, this.currentY);
        
        // Ligne 6: Permis
        this.currentY += 6;
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('N° permis :', this.margins.left, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(client.permisNumero || 'Non renseigné', this.margins.left + 25, this.currentY);
        
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Date d\'obtention :', this.margins.left + 70, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        
        // Formater la date d'obtention du permis
        console.log('=== FORMATAGE DATE PERMIS ===');
        console.log('Valeur reçue:', client.permisDate, 'Type:', typeof client.permisDate);
        
        let datePermis = 'Non renseignée';
        
        if (client.permisDate) {
            try {
                // Si la date est déjà au format YYYY-MM-DD
                if (typeof client.permisDate === 'string' && client.permisDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const [year, month, day] = client.permisDate.split('-');
                    datePermis = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
                    console.log('Date formatée (YYYY-MM-DD):', datePermis);
                }
                // Si la date est un timestamp ou un format ISO
                else {
                    // Essayer de créer un objet Date
                    let date;
                    
                    // Essayer de parser avec le constructeur Date
                    date = new Date(client.permisDate);
                    
                    // Vérifier si la date est valide
                    if (!isNaN(date.getTime())) {
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        datePermis = `${day}/${month}/${year}`;
                        console.log('Date formatée (Date object):', datePermis);
                    } else {
                        console.warn('Date invalide après création de l\'objet Date');
                    }
                }
            } catch (e) {
                console.error('Erreur lors du formatage de la date du permis:', e);
                console.error('Valeur problématique:', client.permisDate);
            }
        } else {
            console.log('Aucune date de permis fournie ou valeur vide');
        }
        
        console.log('Date finale à afficher:', datePermis);
        this.doc.text(datePermis, this.margins.left + 110, this.currentY);
        
        // Ligne 7: Situation familiale et profession
        this.currentY += 6;
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Situation familiale :', this.margins.left, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        
        // Formater la situation familiale pour l'affichage
        let situationFamiliale = client.situationFamiliale || 'Non renseignée';
        const situations = {
            'celibataire': 'Célibataire',
            'marie': 'Marié(e)',
            'pacs': 'Pacsé(e)',
            'divorce': 'Divorcé(e)',
            'veuf': 'Veuf/Veuve',
            'concubinage': 'En concubinage'
        };
        
        if (situations[situationFamiliale]) {
            situationFamiliale = situations[situationFamiliale];
        }
        
        this.doc.text(situationFamiliale, this.margins.left + 45, this.currentY);
        
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Profession :', this.margins.left + 90, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(client.profession || 'Non renseignée', this.margins.left + 115, this.currentY);
        
        // Dessiner un cadre autour des informations
        this.currentY += 6;
        this.doc.setDrawColor(...this.hexToRgb(this.colors.border));
        this.doc.rect(this.margins.left, startY - 2, this.contentWidth, this.currentY - startY + 4);
        
        // Ajouter un espace après la section
        this.currentY += 10;
    }

    /**
     * Ajoute les antécédents d'assurance au document
     * @param {Object} antecedents - Informations sur les antécédents d'assurance
     */
    addAntecedentsInfo(antecedents) {
        // Vérifier l'espace disponible
        if (this.currentY > this.pageHeight - 150) {
            this.addPage();
        }
        
        // Titre de la section
        this.doc.setFillColor(...this.hexToRgb(this.colors.primary));
        this.doc.rect(this.margins.left, this.currentY, this.contentWidth, 8, 'F');
        
        this.doc.setFontSize(11);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(...this.hexToRgb(this.colors.white));
        this.doc.text('ANTÉCÉDENTS D\'ASSURANCE', this.margins.left + 5, this.currentY + 5);
        
        this.currentY += 12;
        
        // Détails des antécédents
        this.doc.setFontSize(10);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.setTextColor(...this.hexToRgb(this.colors.text));
        
        // Encadré des informations
        const startY = this.currentY;
        const labelX = this.margins.left;
        const valueX = this.margins.left + 120;
        const lineHeight = 6;
        
        // 1. Avez-vous déjà été assuré ?
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Avez-vous déjà été assuré ?', labelX, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(antecedents.dejaAssure ? 'Oui' : 'Non', valueX, this.currentY);
        this.currentY += lineHeight;
        
        // Si déjà assuré, afficher les détails supplémentaires
        if (antecedents.dejaAssure) {
            // 2. Nombre de mois d'assurances sur les 36 derniers mois
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Nombre de mois d\'assurances sur les 36 derniers mois :', labelX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(antecedents.moisAssurance ? antecedents.moisAssurance + ' mois' : 'Non renseigné', valueX, this.currentY);
            this.currentY += lineHeight;
            
            // 3. Votre coefficient bonus/malus actuel
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Votre coefficient bonus/malus actuel :', labelX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.text(antecedents.bonusMalus ? antecedents.bonusMalus.toString() : 'Non renseigné', valueX, this.currentY);
            this.currentY += lineHeight;
            
            // 4. Situation de votre contrat actuel
            this.doc.setFont(this.fonts.bold, 'bold');
            this.doc.text('Situation de votre contrat actuel :', labelX, this.currentY);
            this.doc.setFont(this.fonts.normal, 'normal');
            
            let situation = 'Non renseignée';
            if (antecedents.situationContrat === 'en_cours') {
                situation = 'Contrat en cours';
            } else if (antecedents.situationContrat === 'resilier') {
                situation = 'Résiliation en cours';
            } else if (antecedents.situationContrat) {
                situation = antecedents.situationContrat;
            }
            
            this.doc.text(situation, valueX, this.currentY);
            this.currentY += lineHeight;
            
            // 5. Si résiliation, afficher la date et le motif
            if (antecedents.situationContrat === 'resilier' && antecedents.resiliation) {
                // Date de résiliation
                this.doc.setFont(this.fonts.bold, 'bold');
                this.doc.text('Date de résiliation :', labelX, this.currentY);
                this.doc.setFont(this.fonts.normal, 'normal');
                this.doc.text(antecedents.resiliation.date || 'Non spécifiée', valueX, this.currentY);
                this.currentY += lineHeight;
                
                // Motif de résiliation
                this.doc.setFont(this.fonts.bold, 'bold');
                this.doc.text('Motif de résiliation :', labelX, this.currentY);
                this.doc.setFont(this.fonts.normal, 'normal');
                this.doc.text(antecedents.resiliation.motif || 'Non spécifié', valueX, this.currentY);
                this.currentY += lineHeight;
            }
        }
        
        // Espace avant le tableau des sinistres
        this.currentY += 6;
        
        // Afficher le tableau des sinistres
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Avez-vous eu des sinistres au cours des 5 dernières années ?', labelX, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        
        const aEuSinistres = antecedents.aEuSinistres !== undefined ? antecedents.aEuSinistres : 
                           (antecedents.sinisters && antecedents.sinisters.length > 0);
        
        this.doc.text(aEuSinistres ? 'Oui' : 'Non', valueX, this.currentY);
        this.currentY += lineHeight + 4;
        
        // Création du tableau des sinistres
        const tableTop = this.currentY;
        const tableWidth = this.contentWidth;
        const rowHeight = 8;
        const headerHeight = 10;
        const col1 = labelX;
        const col2 = labelX + 40;
        const col3 = labelX + 120;
        const col4 = labelX + 180;
        
        // En-tête du tableau
        this.doc.setFillColor(...this.hexToRgb(this.colors.primary));
        this.doc.rect(col1, this.currentY, tableWidth, headerHeight, 'F');
        
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(...this.hexToRgb(this.colors.white));
        this.doc.text('TABLEAU DES SINISTRES', this.margins.left + 5, this.currentY + 6);
        
        this.currentY += headerHeight;
        
        // En-têtes des colonnes
        this.doc.setFillColor(...this.hexToRgb(this.colors.lightGray));
        this.doc.rect(col1, this.currentY, tableWidth, rowHeight, 'F');
        
        this.doc.setTextColor(...this.hexToRgb(this.colors.text));
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Date du sinistre', col1 + 5, this.currentY + 5);
        this.doc.text('Nature', col2 + 5, this.currentY + 5);
        this.doc.text('Taux de responsabilité', col3 + 5, this.currentY + 5);
        
        this.currentY += rowHeight;
        
        // Contenu du tableau
        this.doc.setFont(this.fonts.normal, 'normal');
        
        if (aEuSinistres && antecedents.sinisters && antecedents.sinisters.length > 0) {
            // Afficher chaque sinistre dans le tableau
            antecedents.sinisters.forEach(sinistre => {
                this.doc.text(sinistre.date || 'N/A', col1 + 5, this.currentY + 5);
                this.doc.text(sinistre.description || 'N/A', col2 + 5, this.currentY + 5);
                this.doc.text(sinistre.responsabilite || 'N/A', col3 + 5, this.currentY + 5);
                this.currentY += rowHeight;
            });
        } else {
            // Afficher une ligne avec "Néant" s'il n'y a pas de sinistres
            this.doc.rect(col1, this.currentY, tableWidth, rowHeight);
            this.doc.text('Néant', col1 + 5, this.currentY + 5, { align: 'center' });
            this.currentY += rowHeight;
        }
        
        // Dessiner le cadre autour du tableau
        this.doc.setDrawColor(...this.hexToRgb(this.colors.border));
        this.doc.rect(col1, tableTop, tableWidth, this.currentY - tableTop);
        
        // Dessiner les lignes verticales du tableau
        this.doc.line(col2, tableTop, col2, this.currentY);
        this.doc.line(col3, tableTop, col3, this.currentY);
        
        // Espace après le tableau
        this.currentY += 10;
        
        // Dessiner un cadre autour de toute la section des antécédents
        this.doc.setDrawColor(...this.hexToRgb(this.colors.border));
        this.doc.rect(this.margins.left, startY - 2, this.contentWidth, this.currentY - startY + 2);
        
        this.currentY += 10;
    }

    /**
     * Ajoute les garanties selon la formule choisie
     * @param {Object} formules - Informations sur les formules d'assurance
     * @param {String} formuleChoisie - La formule sélectionnée
     */
    addGaranties(formules, formuleChoisie) {
        // Vérifier l'espace disponible
        if (this.currentY > this.pageHeight - 100) {
            this.addPage();
        }
        
        // Titre de la section
        this.doc.setFillColor(...this.hexToRgb(this.colors.primary));
        this.doc.rect(this.margins.left, this.currentY, this.contentWidth, 8, 'F');
        
        this.doc.setFontSize(11);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(...this.hexToRgb(this.colors.white));
        
        // Titre de la section des garanties
        let titreFormule = '';
        if (formuleChoisie === 'tiers') {
            titreFormule = 'TIERS';
        } else if (formuleChoisie === 'tiers_vol_incendie') {
            titreFormule = 'TIERS VOL INCENDIE';
        } else if (formuleChoisie === 'tous_risques') {
            titreFormule = 'TOUS RISQUES';
        }
        
        this.doc.text(`GARANTIES - ${titreFormule}`, this.margins.left + 5, this.currentY + 5);
        this.currentY += 12;
        
        // Détails des garanties
        this.doc.setFontSize(10);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.setTextColor(...this.hexToRgb(this.colors.text));
        
        // Garanties communes à toutes les formules
        const garantiesCommunes = [
            { nom: 'Responsabilité civile matérielle automobile', incluse: true },
            { nom: 'Responsabilité civile corporelle automobile', incluse: true },
            { nom: 'Défense pénale et recours suite à accident', incluse: true },
            { nom: 'Garantie corporelle du conducteur 300K€', incluse: true }
        ];
        
        // Garanties spécifiques selon la formule
        let garantiesSpecifiques = [];
        
        if (formuleChoisie === 'tiers_vol_incendie' || formuleChoisie === 'tous_risques') {
            garantiesSpecifiques = [
                { nom: 'Bris de glace', incluse: true },
                { nom: 'Catastrophes naturelles', incluse: true },
                { nom: 'Catastrophes technologiques', incluse: true },
                { nom: 'Attentats/Terrorisme', incluse: true },
                { nom: 'Vol', incluse: true },
                { nom: 'Incendie/Événements climatiques', incluse: true }
            ];
        }
        
        if (formuleChoisie === 'tous_risques') {
            garantiesSpecifiques.push({ nom: 'Dommages tous accidents', incluse: true });
        }
        
        // Fusionner les garanties communes et spécifiques
        const toutesLesGaranties = [...garantiesCommunes, ...garantiesSpecifiques];
        
        // En-tête du tableau des garanties
        this.doc.setFillColor(...this.hexToRgb(this.colors.lightGray));
        this.doc.rect(this.margins.left, this.currentY, this.contentWidth, 8, 'F');
        
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('GARANTIE', this.margins.left + 5, this.currentY + 5);
        this.doc.text('INCLUSE', this.margins.left + 160, this.currentY + 5, { align: 'center' });
        
        this.currentY += 8;
        
        // Afficher les garanties
        this.doc.setFont(this.fonts.normal, 'normal');
        
        toutesLesGaranties.forEach(garantie => {
            // Vérifier si on doit passer à la page suivante
            if (this.currentY > this.pageHeight - 15) {
                this.addPage();
            }
            
            // Dessiner une ligne de séparation
            this.doc.setDrawColor(...this.hexToRgb(this.colors.border));
            this.doc.line(this.margins.left, this.currentY + 2, this.pageWidth - this.margins.right, this.currentY + 2);
            
            // Afficher le nom de la garantie
            const lines = this.doc.splitTextToSize(garantie.nom, this.contentWidth - 50);
            this.doc.text(lines, this.margins.left + 5, this.currentY + 7);
            
            // Afficher si la garantie est incluse
            this.doc.setFont(garantie.incluse ? this.fonts.bold : this.fonts.normal, garantie.incluse ? 'bold' : 'normal');
            this.doc.setTextColor(garantie.incluse ? this.colors.success : this.colors.danger);
            this.doc.text(garantie.incluse ? 'OUI' : 'NON', this.margins.left + 160, this.currentY + 7, { align: 'center' });
            
            // Réinitialiser la police et la couleur
            this.doc.setFont(this.fonts.normal, 'normal');
            this.doc.setTextColor(...this.hexToRgb(this.colors.text));
            
            // Ajuster la position Y pour la prochaine ligne
            const lineHeight = Math.max(10, lines.length * 5);
            this.currentY += lineHeight + 2;
        });
        
        // Ajouter une ligne de séparation à la fin
        this.doc.setDrawColor(...this.hexToRgb(this.colors.border));
        this.doc.setLineWidth(0.2);
        this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY);
        this.currentY += 10;
    }

    /**
     * Ajoute les prestations au document
     * @param {Array} prestations - Liste des prestations à ajouter
     */
    addPrestations(prestations) {
        // Vérifier l'espace disponible
        if (this.currentY > this.pageHeight - 100) {
            this.addPage();
        }
        
        // Titre de la section
        this.doc.setFillColor(...this.hexToRgb(this.colors.primary));
        this.doc.rect(this.margins.left, this.currentY, this.contentWidth, 8, 'F');
        
        this.doc.setFontSize(11);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(...this.hexToRgb(this.colors.white));
        this.doc.text('DÉTAIL DES PRESTATIONS', this.margins.left + 5, this.currentY + 5);
        
        this.currentY += 12;
        
        // En-tête du tableau
        this.doc.setFillColor(...this.hexToRgb(this.colors.lightGray));
        this.doc.rect(this.margins.left, this.currentY, this.contentWidth, 8, 'F');
        
        this.doc.setFontSize(10);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(...this.hexToRgb(this.colors.text));
        this.doc.text('DÉSIGNATION', this.margins.left + 5, this.currentY + 5);
        this.doc.text('MONTANT', this.margins.left + 160, this.currentY + 5, { align: 'right' });
        
        this.currentY += 8;
        
        // Détails des prestations
        this.doc.setFontSize(9);
        this.doc.setFont(this.fonts.normal, 'normal');
        
        let totalHT = 0;
        
        prestations.forEach(prestation => {
            // Vérifier si on doit passer à la page suivante
            if (this.currentY > this.pageHeight - 30) {
                this.addPage();
            }
            
            // Désignation
            const designation = prestation.designation || 'Prestation';
            const desc = prestation.description ? '\n' + prestation.description : '';
            const lines = this.doc.splitTextToSize(designation + desc, this.contentWidth - 60);
            
            // Vérifier si on doit passer à la page suivante
            if (this.currentY + (lines.length * 5) > this.pageHeight - 30) {
                this.addPage();
            }
            
            this.doc.text(lines, this.margins.left + 5, this.currentY + 5);
            
            // Calcul du montant total pour la prestation
            const prixUnitaire = prestation.prixUnitaire || 0;
            const quantite = prestation.quantite || 1;
            const montant = prixUnitaire * quantite;
            totalHT += montant;
            
            // Afficher uniquement le montant total pour la prestation
            this.doc.text(
                this.formatCurrency(montant), 
                this.margins.left + 160, 
                this.currentY + 5, 
                { align: 'right' }
            );
            
            // Hauteur de la ligne en fonction du nombre de lignes de texte
            const lineHeight = Math.max(10, lines.length * 5);
            this.currentY += lineHeight + 2;
        });
        
        // Ligne de séparation avant le total
        this.doc.setDrawColor(...this.hexToRgb(this.colors.border));
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margins.left + 100, this.currentY, this.pageWidth - this.margins.right, this.currentY);
        
        // Montant total HT
        this.doc.setFontSize(10);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Total HT :', this.margins.left + 120, this.currentY + 5, { align: 'right' });
        this.doc.text(this.formatCurrency(totalHT), this.margins.left + 160, this.currentY + 5, { align: 'right' });
        
        // TVA (20%)
        this.currentY += 8;
        const tva = totalHT * 0.2;
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text('TVA (20%) :', this.margins.left + 120, this.currentY + 5, { align: 'right' });
        this.doc.text(this.formatCurrency(tva), this.margins.left + 160, this.currentY + 5, { align: 'right' });
        
        // Montant TTC
        this.currentY += 6;
        const totalTTC = totalHT + tva;
        this.doc.setFontSize(12);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Total TTC :', this.margins.left + 120, this.currentY + 5, { align: 'right' });
        this.doc.text(this.formatCurrency(totalTTC), this.margins.left + 160, this.currentY + 5, { align: 'right' });
        
        this.currentY += 10;
    }

    /**
     * Ajoute les détails du véhicule au document
     * @param {Object} vehicule - Informations du véhicule
     */
    addVehicleInfo(vehicule) {
        // Vérifier l'espace disponible
        if (this.currentY > this.pageHeight - 100) {
            this.addPage();
        }
        
        // Titre de la section
        this.doc.setFillColor(...this.hexToRgb(this.colors.primary));
        this.doc.rect(this.margins.left, this.currentY, this.contentWidth, 8, 'F');
        
        this.doc.setFontSize(11);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(...this.hexToRgb(this.colors.white));
        this.doc.text('DÉTAILS DU VÉHICULE', this.margins.left + 5, this.currentY + 5);
        
        this.currentY += 12;
        
        // Détails du véhicule
        this.doc.setFontSize(10);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.setTextColor(...this.hexToRgb(this.colors.text));
        
        // Encadré des informations
        const startY = this.currentY;
        
        // Ligne 1: Marque et modèle
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Marque :', this.margins.left, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(vehicule.marque || 'Non renseignée', this.margins.left + 20, this.currentY);
        
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Modèle :', this.margins.left + 70, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(vehicule.modele || 'Non renseigné', this.margins.left + 90, this.currentY);
        
        // Ligne 2: Année et puissance
        this.currentY += 6;
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Année :', this.margins.left, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(vehicule.annee || 'Non renseignée', this.margins.left + 20, this.currentY);
        
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Puissance (CV) :', this.margins.left + 50, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(vehicule.puissance || 'Non renseignée', this.margins.left + 90, this.currentY);
        
        // Ligne 3: Immatriculation
        this.currentY += 6;
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.text('Immatriculation :', this.margins.left, this.currentY);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.text(vehicule.immatriculation || 'Non renseignée', this.margins.left + 30, this.currentY);
        
        // Dessiner un cadre autour des informations
        this.currentY += 6;
        this.doc.setDrawColor(...this.hexToRgb(this.colors.border));
        this.doc.rect(this.margins.left, startY - 2, this.contentWidth, this.currentY - startY + 2);
        
        // Ajouter un espace après la section
        this.currentY += 10;
    }
    
    /**
     * Ajoute les conditions générales au document
     */
    addConditionsGenerales(infosComplementaires) {
        // Vérifier s'il y a assez d'espace pour la section
        if (this.currentY > this.pageHeight - 150) {
            this.addPage();
        }
        
        // Titre de la section
        this.doc.setFillColor(...this.hexToRgb(this.colors.primary));
        this.doc.rect(this.margins.left, this.currentY, this.contentWidth, 8, 'F');
        
        this.doc.setFontSize(11);
        this.doc.setFont(this.fonts.bold, 'bold');
        this.doc.setTextColor(...this.hexToRgb(this.colors.white));
        this.doc.text('CONDITIONS GÉNÉRALES', this.margins.left + 5, this.currentY + 5);
        
        this.currentY += 12;
        
        // Contenu des conditions générales
        this.doc.setFontSize(9);
        this.doc.setFont(this.fonts.normal, 'normal');
        this.doc.setTextColor(...this.hexToRgb(this.colors.text));
        
        // Récupérer le mode de fractionnement
        const fractionnement = infosComplementaires.fractionnement || 'mensuel';
        const libelleFractionnement = fractionnement === 'annuel' ? 'en une seule fois' : `en ${fractionnement === 'trimestriel' ? '4' : '12'} fois`;
        
        const conditions = [
            '1. Le présent devis est valable 30 jours à compter de sa date d\'émission.',
            `2. Le règlement s\'effectue ${libelleFractionnement} par prélèvement automatique.`,
            '3. Un acompte de 30% du montant total est exigé à la souscription, réglable par carte bancaire uniquement.',
            '4. En cas de sinistre, le client s\'engage à déclarer celui-ci dans les 5 jours ouvrés.',
            '5. Toute fausse déclaration entraînera la nullité du contrat.',
            '6. Les garanties prennent effet à la date convenue, sous réserve du paiement de la prime.'
        ];
        
        let y = this.currentY;
        conditions.forEach(condition => {
            if (y > this.pageHeight - 100) {
                this.addPage();
                y = this.currentY;
            }
            const textLines = this.doc.splitTextToSize('• ' + condition, this.contentWidth - 10);
            this.doc.text(textLines, this.margins.left + 5, y + 5);
            y += (textLines.length * 4.5) + 2;
        });
        this.currentY = y;
        
        // Ajouter un espace avant les signatures
        this.currentY += 10;
        
        // Vérifier l'espace pour les signatures
        if (this.currentY > this.pageHeight - 50) {
            this.addPage();
        }
        
        // Zone de signature
        const signatureY = this.currentY;
        
        // Ligne de séparation
        this.doc.setDrawColor(...this.hexToRgb(this.colors.border));
        this.doc.setLineWidth(0.3);
        this.doc.line(this.margins.left, signatureY, this.margins.left + this.contentWidth, signatureY);
        
        // Signatures
        this.currentY += 15;
        
        // Signature client
        this.doc.setFont(this.fonts.italic, 'italic');
        this.doc.setFontSize(9);
        this.doc.text('Bon pour accord,', this.margins.left + 20, this.currentY);
        this.doc.text('Le client', this.margins.left + 30, this.currentY + 20);
        
        // Ligne de signature client
        this.doc.setDrawColor(...this.hexToRgb(this.colors.border));
        this.doc.setLineWidth(0.3);
        this.doc.line(this.margins.left, this.currentY + 25, this.margins.left + 80, this.currentY + 25);
        
        // Signature entreprise
        this.doc.text('Le responsable commercial', this.margins.left + this.contentWidth - 100, this.currentY);
        this.doc.text('GPA Assurance Auto', this.margins.left + this.contentWidth - 80, this.currentY + 20);
        
        // Ligne de signature entreprise
        this.doc.line(this.margins.left + this.contentWidth - 120, this.currentY + 25, this.margins.left + this.contentWidth - 20, this.currentY + 25);
        
        // Mettre à jour la position Y
        this.currentY += 40;
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
            `Tél : 01 23 45 67 89 • Email : contact@gpa-assurance.fr • SIRET : 123 456 789 00012 • RCS Paris B 123 456 789`,
            `Ce document est établi à titre informatif et ne constitue pas une police d'assurance.`
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
        
        // Ajouter le pied de page
        this.addFooter();
    }
    
    /**
     * Génère un numéro de devis unique
     * @returns {string} Numéro de devis formaté
     */
    generateDevisNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        return `DEV-${year}${month}-${random}`;
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
        
});
this.currentY = y;
        
// Ajouter un espace avant les signatures
this.currentY += 10;
        
// Vérifier si on doit ajouter une nouvelle page
if (this.currentY > this.pageHeight - 50) {
    this.addPage();
}
        
// Zone de signature
const signatureY = this.currentY;
        
// Ligne de séparation
this.doc.setDrawColor(...this.hexToRgb(this.colors.border));
this.doc.setLineWidth(0.3);
this.doc.line(this.margins.left, signatureY, this.margins.left + this.contentWidth, signatureY);
        
// Signatures
this.currentY += 15;
        
// Signature client
this.doc.setFont(this.fonts.italic, 'italic');
this.doc.setFontSize(9);
this.doc.text('Bon pour accord,', this.margins.left + 20, this.currentY);
this.doc.text('Le client', this.margins.left + 30, this.currentY + 20);
        
// Ligne de signature client
this.doc.setDrawColor(...this.hexToRgb(this.colors.border));
this.doc.setLineWidth(0.3);
this.doc.line(this.margins.left, this.currentY + 25, this.margins.left + 80, this.currentY + 25);
        
// Signature entreprise
this.doc.text('Le responsable commercial', this.margins.left + this.contentWidth - 100, this.currentY);
this.doc.text('GPA Assurance Auto', this.margins.left + this.contentWidth - 80, this.currentY + 20);
        
// Ligne de signature entreprise
this.doc.line(this.margins.left + this.contentWidth - 120, this.currentY + 25, this.margins.left + this.contentWidth - 20, this.currentY + 25);
        
// Mettre à jour la position Y
this.currentY += 40;
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
        `Tél : 01 23 45 67 89 • Email : contact@gpa-assurance.fr • SIRET : 123 456 789 00012 • RCS Paris B 123 456 789`,
        `Ce document est établi à titre informatif et ne constitue pas une police d'assurance.`
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
        
    // Ajouter le pied de page
    this.addFooter();
}
        
/**
 * Génère un numéro de devis unique
 * @returns {string} Numéro de devis formaté
 */
generateDevisNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `DEV-${year}${month}-${random}`;
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
    if (!date) return '';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        console.error('Erreur de formatage de date:', e);
        return '';
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
