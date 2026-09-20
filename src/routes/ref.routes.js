const express = require('express');
const { Zone, TypeBien, StatusBien } = require('../models');

const router = express.Router();

// Données de référence pour les formulaires et filtres
router.get('/', async (req, res, next) => {
  try {
    const [zones, types, statuts] = await Promise.all([
      Zone.findAll({ order: [['nom', 'ASC']] }),
      TypeBien.findAll({ order: [['nom', 'ASC']] }),
      StatusBien.findAll()
    ]);
    res.status(200).json({ status: 'success', data: { zones, types, statuts } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
