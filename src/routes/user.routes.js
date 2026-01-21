// ============ src/routes/user.routes.js ============
const { User, Role } = require('../models');
const express = require('express');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/roleCheck');

const router4 = express.Router();

// Obtenir tous les utilisateurs (Admin only)
router4.get('/', auth, checkRole('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role_id) where.role_id = role_id;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['mot_de_passe'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_creation', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtenir un utilisateur par ID (Admin only)
router4.get('/:id', auth, checkRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['mot_de_passe'] }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur introuvable'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Changer le statut d'un utilisateur (Admin only)
router4.put('/:id/statut', auth, checkRole('admin'), async (req, res, next) => {
  try {
    const { statut } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur introuvable'
      });
    }

    user.statut = statut;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Statut mis à jour',
      data: { user: user.toJSON() }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router4;