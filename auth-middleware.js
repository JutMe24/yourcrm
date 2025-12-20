const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Configuration des utilisateurs (en production, utilisez une base de données)
const users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@gpa.fr',
        password: '$2b$10$xoqSVq09KXCDCjELCBA0T.IpwVscjp9/HgH0Z4SwEB49zKeH2Z35K', // password: admin123
        role: 'admin',
        firstName: 'Administrateur',
        lastName: 'GPA',
        createdAt: new Date()
    }
];

// Configuration du cabinet
const cabinetConfig = {
    nom: 'GPA Assurance Auto',
    adresse: '123 Rue de l\'Assurance, 75001 Paris',
    telephone: '01 23 45 67 89',
    email: 'contact@gpa.fr',
    siret: '12345678901234',
    logo: null // chemin vers le logo
};

const JWT_SECRET = process.env.JWT_SECRET || 'gpa-assurance-secret-key-2024';

class AuthMiddleware {
    // Middleware pour vérifier si l'utilisateur est authentifié
    static isAuthenticated(req, res, next) {
        const token = req.headers.authorization?.split(' ')[1] || 
                     req.cookies?.token ||
                     req.session?.token;

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Accès non autorisé - Token manquant' 
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token invalide ou expiré' 
            });
        }
    }

    // Middleware pour vérifier si l'utilisateur est admin
    static isAdmin(req, res, next) {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé - Droits insuffisants' 
            });
        }
        next();
    }

    // Middleware pour vérifier si l'utilisateur est agent ou admin
    static isAgentOrAdmin(req, res, next) {
        if (req.user.role !== 'admin' && req.user.role !== 'agent') {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé - Droits insuffisants' 
            });
        }
        next();
    }

    // Middleware pour vérifier si l'utilisateur est agent
    static isAgent(req, res, next) {
        if (req.user.role !== 'agent') {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé - Réservé aux agents' 
            });
        }
        next();
    }

    // Générer un token JWT
    static generateToken(user) {
        return jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    // Vérifier le mot de passe
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Hasher le mot de passe
    static async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    // Trouver un utilisateur par username ou email
    static findUser(identifier) {
        return users.find(user => 
            user.username === identifier || user.email === identifier
        );
    }

    // Créer un nouvel utilisateur
    static async createUser(userData) {
        const hashedPassword = await this.hashPassword(userData.password);
        const newUser = {
            id: users.length + 1,
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            role: userData.role || 'agent',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            createdAt: new Date()
        };
        users.push(newUser);
        return newUser;
    }

    // Obtenir tous les utilisateurs (pour admin)
    static getAllUsers() {
        return users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            createdAt: user.createdAt
        }));
    }

    // Obtenir un utilisateur par son ID
    static getUserById(userId) {
        const user = users.find(u => u.id === parseInt(userId));
        if (user) {
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: user.createdAt
            };
        }
        return null;
    }

    // Supprimer un utilisateur (pour admin)
    static deleteUser(userId) {
        const index = users.findIndex(u => u.id === parseInt(userId));
        if (index !== -1) {
            users.splice(index, 1);
            return true;
        }
        return false;
    }

    // Mettre à jour un utilisateur
    static async updateUser(userId, userData) {
        const user = users.find(u => u.id === parseInt(userId));
        if (user) {
            if (userData.password) {
                user.password = await this.hashPassword(userData.password);
            }
            if (userData.username) user.username = userData.username;
            if (userData.email) user.email = userData.email;
            if (userData.role) user.role = userData.role;
            if (userData.firstName !== undefined) user.firstName = userData.firstName;
            if (userData.lastName !== undefined) user.lastName = userData.lastName;
            return user;
        }
        return null;
    }

    // Obtenir la configuration du cabinet
    static getCabinetConfig() {
        return cabinetConfig;
    }

    // Mettre à jour la configuration du cabinet
    static updateCabinetConfig(config) {
        try {
            // Valider les données avant la mise à jour
            if (config.logo && typeof config.logo !== 'string') {
                throw new Error('Le logo doit être une chaîne de caractères (base64)');
            }
            
            // Mettre à jour chaque propriété individuellement
            if (config.nom !== undefined) cabinetConfig.nom = config.nom;
            if (config.adresse !== undefined) cabinetConfig.adresse = config.adresse;
            if (config.telephone !== undefined) cabinetConfig.telephone = config.telephone;
            if (config.email !== undefined) cabinetConfig.email = config.email;
            if (config.siret !== undefined) cabinetConfig.siret = config.siret;
            if (config.logo !== undefined) cabinetConfig.logo = config.logo;
            
            return cabinetConfig;
        } catch (error) {
            console.error('Erreur dans updateCabinetConfig:', error);
            throw error;
        }
    }
}

module.exports = AuthMiddleware;
