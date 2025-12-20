const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const config = require('./config-production');
const AuthMiddleware = require('./auth-middleware');
const app = express();

// Configuration du port
const PORT = config.PORT;

// Middleware pour parser le JSON avec une limite augmentée pour les logos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuration des sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'gpa-assurance-session-secret',
    resave: false,
    saveUninitialized: true, // Sauvegarder même les sessions non initialisées
    cookie: {
        secure: false, // Désactiver en développement
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        sameSite: 'lax' // Permet la navigation entre pages
    }
}));

// Variable globale pour stocker le processus SMTP
let smtpProcess = null;

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html', 'htm', 'js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'ico']
}));

// Routes d'authentification
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username et mot de passe requis'
            });
        }

        const user = AuthMiddleware.findUser(username);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants incorrects'
            });
        }

        const isValidPassword = await AuthMiddleware.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants incorrects'
            });
        }

        const token = AuthMiddleware.generateToken(user);
        
        // Stocker le token en session
        req.session.token = token;
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la connexion'
        });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('token');
    res.json({
        success: true,
        message: 'Déconnexion réussie'
    });
});

app.get('/api/auth/me', AuthMiddleware.isAuthenticated, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// Route de test API
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'Le serveur fonctionne correctement',
        timestamp: new Date().toISOString()
    });});

// Route pour vérifier Node.js
app.get('/api/check-nodejs', (req, res) => {
    res.json({ available: true });
});

// Routes pour le serveur SMTP (protégées)
app.post('/api/smtp-server/start', AuthMiddleware.isAuthenticated, AuthMiddleware.isAdmin, (req, res) => {
    console.log('Tentative de démarrage du serveur SMTP...');
    
    const { spawn } = require('child_process');
    
    // Vérifier si le processus est déjà en cours
    if (smtpProcess && !smtpProcess.killed) {
        console.log('Serveur SMTP déjà en cours d\'exécution');
        return res.json({ 
            success: true, 
            message: 'Serveur SMTP déjà en cours d\'exécution' 
        });
    }
    
    // Démarrer le serveur SMTP avec plus d'options
    smtpProcess = spawn('node', ['smtp-server.js'], {
        stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
        detached: false,
        shell: false
    });
    
    console.log('Processus SMTP démarré avec PID:', smtpProcess.pid);
    
    // Capturer la sortie pour débogage
    smtpProcess.stdout.on('data', (data) => {
        console.log('SMTP stdout:', data.toString());
    });
    
    smtpProcess.stderr.on('data', (data) => {
        console.log('SMTP stderr:', data.toString());
    });
    
    smtpProcess.on('error', (error) => {
        console.error('Erreur lors du démarrage du serveur SMTP:', error);
        smtpProcess = null;
    });
    
    smtpProcess.on('exit', (code, signal) => {
        console.log(`Serveur SMTP arrêté - Code: ${code}, Signal: ${signal}`);
        smtpProcess = null;
    });
    
    // Attendre un peu pour vérifier que le processus démarre correctement
    setTimeout(() => {
        if (smtpProcess && !smtpProcess.killed) {
            console.log('Serveur SMTP démarré avec succès');
            res.json({ 
                success: true, 
                message: 'Serveur SMTP démarré',
                pid: smtpProcess.pid
            });
        } else {
            console.error('Le serveur SMTP s\'est arrêté immédiatement');
            res.json({ 
                success: false, 
                message: 'Le serveur SMTP s\'est arrêté immédiatement' 
            });
        }
    }, 1000);
});

// Route pour vérifier le statut du serveur SMTP
app.get('/api/smtp-server/status', AuthMiddleware.isAuthenticated, AuthMiddleware.isAdmin, (req, res) => {
    const isRunning = smtpProcess && !smtpProcess.killed;
    res.json({ 
        success: true, 
        running: isRunning,
        message: isRunning ? 'Serveur SMTP en cours d\'exécution' : 'Serveur SMTP arrêté'
    });
});

app.post('/api/smtp-server/stop', AuthMiddleware.isAuthenticated, AuthMiddleware.isAdmin, (req, res) => {
    if (smtpProcess && !smtpProcess.killed) {
        smtpProcess.kill();
        smtpProcess = null;
        res.json({ 
            success: true, 
            message: 'Serveur SMTP arrêté' 
        });
    } else {
        res.json({ 
            success: true, 
            message: 'Serveur SMTP déjà arrêté' 
        });
    }
});

// Routes pour la gestion du profil
app.put('/api/auth/update-profile', AuthMiddleware.isAuthenticated, async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user.id;
        
        if (password) {
            // Mettre à jour le mot de passe
            const updatedUser = await AuthMiddleware.updateUser(userId, { password });
            if (updatedUser) {
                res.json({ 
                    success: true, 
                    message: 'Mot de passe mis à jour avec succès' 
                });
            } else {
                res.status(404).json({ 
                    success: false, 
                    message: 'Utilisateur non trouvé' 
                });
            }
        } else {
            res.json({ 
                success: true, 
                message: 'Aucune modification à effectuer' 
            });
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur' 
        });
    }
});

// Routes pour la configuration du cabinet
app.get('/api/cabinet/config', AuthMiddleware.isAuthenticated, (req, res) => {
    try {
        const config = AuthMiddleware.getCabinetConfig();
        res.json({ 
            success: true, 
            config 
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la configuration:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur' 
        });
    }
});

app.put('/api/cabinet/config', AuthMiddleware.isAuthenticated, (req, res) => {
    try {
        console.log('Utilisateur:', req.user);
        console.log('Configuration reçue:', { ...req.body, logo: req.body.logo ? 'Logo présent (' + req.body.logo.length + ' caractères)' : 'Pas de logo' });
        
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            console.log('Accès refusé - rôle:', req.user.role);
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé - Droits insuffisants' 
            });
        }
        
        const config = AuthMiddleware.updateCabinetConfig(req.body);
        res.json({ 
            success: true, 
            message: 'Configuration mise à jour avec succès',
            config 
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la configuration:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Erreur serveur' 
        });
    }
});

// Routes pour la gestion des agents
app.get('/api/agents', AuthMiddleware.isAuthenticated, (req, res) => {
    try {
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé - Droits insuffisants' 
            });
        }
        
        const agents = AuthMiddleware.getAllUsers();
        res.json({ 
            success: true, 
            agents 
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des agents:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur' 
        });
    }
});

app.post('/api/agents', AuthMiddleware.isAuthenticated, async (req, res) => {
    try {
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé - Droits insuffisants' 
            });
        }
        
        const newAgent = await AuthMiddleware.createUser(req.body);
        res.json({ 
            success: true, 
            message: 'Agent créé avec succès',
            agent: {
                id: newAgent.id,
                username: newAgent.username,
                email: newAgent.email,
                role: newAgent.role,
                firstName: newAgent.firstName,
                lastName: newAgent.lastName,
                createdAt: newAgent.createdAt
            }
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'agent:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur' 
        });
    }
});

app.put('/api/agents/:id', AuthMiddleware.isAuthenticated, async (req, res) => {
    try {
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé - Droits insuffisants' 
            });
        }
        
        const updatedAgent = await AuthMiddleware.updateUser(req.params.id, req.body);
        if (updatedAgent) {
            res.json({ 
                success: true, 
                message: 'Agent mis à jour avec succès',
                agent: {
                    id: updatedAgent.id,
                    username: updatedAgent.username,
                    email: updatedAgent.email,
                    role: updatedAgent.role,
                    firstName: updatedAgent.firstName,
                    lastName: updatedAgent.lastName,
                    createdAt: updatedAgent.createdAt
                }
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Agent non trouvé' 
            });
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'agent:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur' 
        });
    }
});

app.get('/api/agents/:id', AuthMiddleware.isAuthenticated, (req, res) => {
    try {
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé - Droits insuffisants' 
            });
        }
        
        const agent = AuthMiddleware.getUserById(req.params.id);
        if (agent) {
            res.json({ 
                success: true, 
                agent: {
                    id: agent.id,
                    username: agent.username,
                    email: agent.email,
                    role: agent.role,
                    firstName: agent.firstName,
                    lastName: agent.lastName,
                    createdAt: agent.createdAt
                }
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Agent non trouvé' 
            });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'agent:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur' 
        });
    }
});

app.delete('/api/agents/:id', AuthMiddleware.isAuthenticated, (req, res) => {
    try {
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé - Droits insuffisants' 
            });
        }
        
        const deleted = AuthMiddleware.deleteUser(req.params.id);
        if (deleted) {
            res.json({ 
                success: true, 
                message: 'Agent supprimé avec succès' 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Agent non trouvé' 
            });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'agent:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur' 
        });
    }
});

// Page d'accueil - rediriger vers la page de connexion
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route pour servir le logo du cabinet
app.get('/api/cabinet/logo', (req, res) => {
    try {
        const config = AuthMiddleware.getCabinetConfig();
        if (config.logo) {
            // Si le logo est une URL ou un chemin de fichier
            if (config.logo.startsWith('http')) {
                return res.redirect(config.logo);
            } else if (config.logo.startsWith('data:')) {
                // Si c'est une base64 data URL
                const base64Data = config.logo.split(',')[1];
                const mimeType = config.logo.split(':')[1].split(';')[0];
                const buffer = Buffer.from(base64Data, 'base64');
                res.setHeader('Content-Type', mimeType);
                return res.send(buffer);
            } else {
                // Si c'est un chemin de fichier local
                const path = require('path');
                const fs = require('fs');
                const logoPath = path.join(__dirname, 'public', config.logo);
                
                if (fs.existsSync(logoPath)) {
                    return res.sendFile(logoPath);
                }
            }
        }
        
        // Logo par défaut si aucun logo n'est configuré
        res.status(404).json({ 
            success: false, 
            message: 'Aucun logo configuré' 
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du logo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur' 
        });
    }
});

// Gestion du favicon
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});


// Démarrer le serveur
const server = app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log('Routes disponibles:');
    console.log(`- GET /api/status - Vérifier l'état du serveur`);
    console.log(`- GET / - Page d'accueil`);
});

// Gestion des erreurs
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Le port ${PORT} est déjà utilisé.`);
    } else {
        console.error('Erreur du serveur:', error);
    }
    process.exit(1);
});
