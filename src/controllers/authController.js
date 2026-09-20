const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const jwtConfig = require('../config/jwt');
const realtime = require('../services/realtime');

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

// Inscription
exports.register = async (req, res, next) => {
  try {
    const { email, mot_de_passe, prenom, nom, telephone, role_nom = 'client' } = req.body;

    // Validation basique
    if (!email || !mot_de_passe) {
      return res.status(400).json({
        status: 'error ',
        message: 'Email et mot de passe requis'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'Cet email est déjà utilisé'
      });
    }

    // Seuls les rôles publics sont auto-attribuables (jamais admin)
    if (!['client', 'partenaire'].includes(role_nom)) {
      return res.status(400).json({
        status: 'error',
        message: 'Rôle invalide'
      });
    }

    // Récupérer le rôle
    const role = await Role.findOne({ where: { nom: role_nom } });
    if (!role) {
      return res.status(400).json({
        status: 'error',
        message: 'Rôle invalide'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      email,
      mot_de_passe,
      prenom,
      nom,
      telephone,
      role_id: role.id,
      statut: 'actif'
    });

    realtime.toRole('admin', 'user:changed', { id: user.id, action: 'created' });

    // Générer le token
    const token = generateToken(user.id);

    // Récupérer l'utilisateur avec le rôle
    const userWithRole = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'nom']
      }],
      attributes: { exclude: ['mot_de_passe'] }
    });

    res.status(201).json({
      status: 'success',
      message: 'Inscription réussie',
      data: {
        user: userWithRole,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Connexion
exports.login = async (req, res, next) => {
  try {
    const { email, mot_de_passe } = req.body;

    // Validation
    if (!email || !mot_de_passe) {
      return res.status(400).json({
        status: 'error',
        message: 'Email et mot de passe requis'
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'nom']
      }]
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(mot_de_passe);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le statut du compte
    if (user.statut !== 'actif') {
      return res.status(403).json({
        status: 'error',
        message: 'Votre compte est inactif ou suspendu'
      });
    }

    // Générer le token
    const token = generateToken(user.id);

    // Retirer le mot de passe de la réponse
    const userResponse = user.toJSON();

    res.status(200).json({
      status: 'success',
      message: 'Connexion réussie',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir le profil de l'utilisateur connecté
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'nom']
      }],
      attributes: { exclude: ['mot_de_passe'] }
    });

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour le profil
exports.updateProfile = async (req, res, next) => {
  try {
    const { prenom, nom, telephone } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur introuvable'
      });
    }

    // Mettre à jour les champs
    if (prenom) user.prenom = prenom;
    if (nom) user.nom = nom;
    if (telephone) user.telephone = telephone;

    await user.save();

    const updatedUser = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'nom']
      }],
      attributes: { exclude: ['mot_de_passe'] }
    });

    realtime.toRole('admin', 'user:changed', { id: userId, action: 'profile' });

    res.status(200).json({
      status: 'success',
      message: 'Profil mis à jour avec succès',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

// Changer le mot de passe
exports.changePassword = async (req, res, next) => {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    const userId = req.user.id;

    if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
      return res.status(400).json({
        status: 'error',
        message: 'Ancien et nouveau mot de passe requis'
      });
    }

    const user = await User.findByPk(userId);
    
    // Vérifier l'ancien mot de passe
    const isPasswordValid = await user.comparePassword(ancien_mot_de_passe);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Ancien mot de passe incorrect'
      });
    }

    // Mettre à jour le mot de passe
    user.mot_de_passe = nouveau_mot_de_passe;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// Mot de passe oublié : réponse générique (aucun service d'e-mail n'est configuré)
exports.forgotPassword = async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Si un compte existe avec cet email, des instructions de réinitialisation seront envoyées.'
  });
};
