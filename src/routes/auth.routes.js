const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/profile', auth, authController.getProfile);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Mettre à jour le profil
 * @access  Private
 */
router.put('/profile', auth, authController.updateProfile);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Changer le mot de passe
 * @access  Private
 */
router.put('/change-password', auth, authController.changePassword);

module.exports = router;