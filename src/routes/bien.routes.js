const express = require('express');
const router = express.Router();
const bienController = require('../controllers/bienController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/roleCheck');

/**
 * @route   GET /api/v1/biens
 * @desc    Obtenir tous les biens (avec filtres)
 * @access  Public
 */
router.get('/', bienController.getAllBiens);

/**
 * @route   GET /api/v1/biens/mes-biens
 * @desc    Obtenir mes biens
 * @access  Private (Partenaire)
 */
router.get('/mes-biens', auth, checkRole('partenaire', 'admin'), bienController.getMesBiens);

/**
 * @route   GET /api/v1/biens/:id
 * @desc    Obtenir un bien par ID
 * @access  Public
 */
router.get('/:id', bienController.getBienById);

/**
 * @route   POST /api/v1/biens
 * @desc    Créer un nouveau bien
 * @access  Private (Partenaire)
 */
router.post('/', auth, checkRole('partenaire', 'admin'), bienController.createBien);

/**
 * @route   PUT /api/v1/biens/:id
 * @desc    Mettre à jour un bien
 * @access  Private (Partenaire/Admin)
 */
router.put('/:id', auth, checkRole('partenaire', 'admin'), bienController.updateBien);

/**
 * @route   DELETE /api/v1/biens/:id
 * @desc    Supprimer un bien
 * @access  Private (Partenaire/Admin)
 */
router.delete('/:id', auth, checkRole('partenaire', 'admin'), bienController.deleteBien);

/**
 * @route   PUT /api/v1/biens/:id/valider
 * @desc    Valider ou refuser un bien
 * @access  Private (Admin only)
 */
router.put('/:id/valider', auth, checkRole('admin'), bienController.validerBien);

module.exports = router;