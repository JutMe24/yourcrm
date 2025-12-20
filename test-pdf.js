// Test de génération de PDF simple
function testPDFGeneration() {
    try {
        // Vérifier si jsPDF est chargé
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            console.error('Erreur: jsPDF n\'est pas chargé correctement');
            return false;
        }

        // Créer un nouveau document PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Ajouter du texte au document
        doc.text('Test de génération de PDF', 10, 10);
        doc.text('Ceci est un test de génération de PDF avec jsPDF', 10, 20);
        
        // Enregistrer le PDF
        doc.save('test-pdf.pdf');
        console.log('Test de génération de PDF réussi !');
        return true;
    } catch (error) {
        console.error('Erreur lors du test de génération de PDF:', error);
        return false;
    }
}

// Exécuter le test
document.addEventListener('DOMContentLoaded', function() {
    console.log('Test de génération de PDF...');
    testPDFGeneration();
});
