const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const jwtConfig = require('../config/jwt');

const auth = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.substring(7);

    // Vérifier le token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Récupérer l'utilisateur
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'nom']
      }],
      attributes: { exclude: ['mot_de_passe'] }
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Utilisateur introuvable'
      });
    }

    if (user.statut !== 'actif') {
      return res.status(403).json({
        status: 'error',
        message: 'Compte inactif ou suspendu'
      });
    }

    // Attacher l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token invalide'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expiré'
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Erreur d\'authentification',
      error: error.message
    });
  }
};

module.exports = auth;