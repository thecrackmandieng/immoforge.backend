// ============ src/routes/demande.routes.js ============
const demandeController = require('../controllers/demandeController');
const checkRole = require('../middlewares/roleCheck');
const auth = require('../middlewares/auth');
const express = require('express');

const router2 = express.Router();

router2.get('/mes-demandes', auth, demandeController.getMesDemandes);
router2.get('/pour-mes-biens', auth, checkRole('partenaire', 'admin'), demandeController.getDemandesPourMesBiens);
router2.post('/', auth, demandeController.createDemande);
router2.put('/:id/statut', auth, demandeController.updateStatutDemande);

module.exports = router2;