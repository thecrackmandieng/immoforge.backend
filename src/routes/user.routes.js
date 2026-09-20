// ============ src/routes/user.routes.js ============
const { User, Role } = require('../models');
const realtime = require('../services/realtime');
const express = require('express');
const { Op } = require('sequelize');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/roleCheck');

const router4 = express.Router();

// Obtenir tous les utilisateurs (Admin only)
router4.get('/', auth, checkRole('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role_id, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role_id) where.role_id = role_id;
    if (search) {
      const like = { [Op.like]: `%${search}%` };
      where[Op.or] = [{ email: like }, { nom: like }, { prenom: like }];
    }

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

    realtime.toUser(user.id, 'user:changed', { id: user.id, statut });
    realtime.toRole('admin', 'user:changed', { id: user.id, statut, action: 'status' });
    // compte suspendu : on coupe la session en cours
    if (statut !== 'actif') {
      realtime.toUser(user.id, 'session:revoked', { reason: 'Votre compte a été suspendu par un administrateur.' });
      realtime.disconnectUser(user.id);
    }

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