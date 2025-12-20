// Configuration pour la production sur LWS
const config = {
    // Serveur
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'production',
    
    // Base URL de l'application
    BASE_URL: process.env.BASE_URL || 'https://votredomaine.lws.fr',
    
    // Configuration SMTP
    SMTP: {
        host: process.env.SMTP_HOST || 'smtp.lws.fr',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER || 'votre-email@votredomaine.fr',
            pass: process.env.SMTP_PASS || 'votre-mot-de-passe'
        }
    },
    
    // Email de l'entreprise
    COMPANY_EMAIL: process.env.COMPANY_EMAIL || 'contact@votredomaine.fr',
    
    // Configuration des PDF
    PDF: {
        outputDir: process.env.PDF_OUTPUT_DIR || './pdfs',
        publicUrl: process.env.PDF_PUBLIC_URL || '/pdfs'
    },
    
    // Sécurité
    CORS: {
        origin: process.env.CORS_ORIGIN || ['https://votredomaine.lws.fr'],
        credentials: true
    }
};

module.exports = config;
