const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000; // Port différent du serveur SMTP

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Variable pour suivre l'état du serveur SMTP
let smtpServerProcess = null;

/**
 * Endpoint pour vérifier si Node.js est disponible
 */
app.get('/api/check-nodejs', (req, res) => {
    res.json({ available: true });
});

/**
 * Endpoint pour démarrer le serveur SMTP
 */
app.post('/api/smtp-server/start', async (req, res) => {
    try {
        if (smtpServerProcess && !smtpServerProcess.killed) {
            return res.json({ success: false, message: 'Le serveur SMTP est déjà en cours d\'exécution' });
        }

        // Démarrer le serveur SMTP dans un processus enfant
        smtpServerProcess = spawn('node', ['smtp-server.js'], {
            cwd: __dirname,
            stdio: 'pipe',
            detached: false
        });

        smtpServerProcess.stdout.on('data', (data) => {
            console.log(`Serveur SMTP stdout: ${data}`);
        });

        smtpServerProcess.stderr.on('data', (data) => {
            console.error(`Serveur SMTP stderr: ${data}`);
        });

        smtpServerProcess.on('close', (code) => {
            console.log(`Serveur SMTP process exited with code ${code}`);
            smtpServerProcess = null;
        });

        smtpServerProcess.on('error', (error) => {
            console.error('Erreur lors du démarrage du serveur SMTP:', error);
            smtpServerProcess = null;
        });

        // Attendre un peu pour que le serveur démarre
        setTimeout(() => {
            if (smtpServerProcess && !smtpServerProcess.killed) {
                res.json({ 
                    success: true, 
                    message: 'Serveur SMTP démarré avec succès',
                    pid: smtpServerProcess.pid
                });
            } else {
                res.json({ 
                    success: false, 
                    message: 'Échec du démarrage du serveur SMTP' 
                });
            }
        }, 2000);

    } catch (error) {
        console.error('Erreur lors du démarrage du serveur SMTP:', error);
        res.json({ 
            success: false, 
            message: error.message 
        });
    }
});

/**
 * Endpoint pour arrêter le serveur SMTP
 */
app.post('/api/smtp-server/stop', (req, res) => {
    try {
        if (!smtpServerProcess || smtpServerProcess.killed) {
            return res.json({ success: false, message: 'Le serveur SMTP n\'est pas en cours d\'exécution' });
        }

        // Tuer le processus du serveur SMTP
        smtpServerProcess.kill('SIGTERM');
        
        setTimeout(() => {
            if (smtpServerProcess && !smtpServerProcess.killed) {
                smtpServerProcess.kill('SIGKILL');
            }
        }, 1000);

        smtpServerProcess = null;

        res.json({ 
            success: true, 
            message: 'Serveur SMTP arrêté avec succès' 
        });

    } catch (error) {
        console.error('Erreur lors de l\'arrêt du serveur SMTP:', error);
        res.json({ 
            success: false, 
            message: error.message 
        });
    }
});

/**
 * Endpoint pour vérifier le statut du serveur SMTP
 */
app.get('/api/smtp-server/status', (req, res) => {
    const isRunning = smtpServerProcess && !smtpServerProcess.killed;
    
    res.json({
        running: isRunning,
        pid: isRunning ? smtpServerProcess.pid : null
    });
});

/**
 * Servir l'application principale
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur API
app.listen(PORT, () => {
    console.log(`Serveur API démarré sur http://localhost:${PORT}`);
    console.log('Interface web disponible sur http://localhost:3000');
});

// Gérer l'arrêt propre
process.on('SIGINT', () => {
    console.log('\nArrêt du serveur API...');
    
    if (smtpServerProcess && !smtpServerProcess.killed) {
        console.log('Arrêt du serveur SMTP...');
        smtpServerProcess.kill('SIGTERM');
    }
    
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nArrêt du serveur API...');
    
    if (smtpServerProcess && !smtpServerProcess.killed) {
        console.log('Arrêt du serveur SMTP...');
        smtpServerProcess.kill('SIGTERM');
    }
    
    process.exit(0);
});
