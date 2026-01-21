
// ============ src/routes/favori.routes.js ============
const express = require('express');
const router = express.Router();
const favoriController = require('../controllers/favoriController');
const auth = require('../middlewares/auth');

router.get('/', auth, favoriController.getMesFavoris);
router.post('/', auth, favoriController.addFavori);
router.delete('/:bien_id', auth, favoriController.removeFavori);

module.exports = router;