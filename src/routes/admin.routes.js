const express = require('express');
const { Op } = require('sequelize');
const { User, Role, Bien, TypeBien, Demande, Transaction, Paiement } = require('../models');
const auth = require('../middlewares/auth');
const realtime = require('../services/realtime');
const checkRole = require('../middlewares/roleCheck');

const router = express.Router();
router.use(auth, checkRole('admin'));

const pageOf = (q, def = 10) => {
  const page = Math.max(1, parseInt(q.page) || 1);
  const limit = Math.min(50, parseInt(q.limit) || def);
  return { page, limit, offset: (page - 1) * limit };
};
const pagination = (count, page, limit) => ({ total: count, page, limit, totalPages: Math.ceil(count / limit) });

// Toutes les demandes de la plateforme
router.get('/demandes', async (req, res, next) => {
  try {
    const { page, limit, offset } = pageOf(req.query);
    const where = req.query.statut ? { statut: req.query.statut } : {};
    const { count, rows } = await Demande.findAndCountAll({
      where,
      include: [
        { model: User, as: 'client', attributes: ['id', 'prenom', 'nom', 'email'] },
        { model: Bien, as: 'bien', include: [{ model: User, as: 'proprietaire', attributes: ['id', 'prenom', 'nom'] }] }
      ],
      order: [['date_demande', 'DESC']], limit, offset, distinct: true
    });
    res.json({ status: 'success', data: { demandes: rows, pagination: pagination(count, page, limit) } });
  } catch (e) { next(e); }
});

// Toutes les transactions de la plateforme
router.get('/transactions', async (req, res, next) => {
  try {
    const { page, limit, offset } = pageOf(req.query);
    const where = req.query.status ? { status: req.query.status } : {};
    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'prenom', 'nom', 'email'] },
        { model: Bien, as: 'bien', attributes: ['id', 'titre'] },
        { model: Paiement, as: 'paiements' }
      ],
      order: [['date_transaction', 'DESC']], limit, offset, distinct: true
    });
    const revenus = await Transaction.sum('montant', { where: { status: 'payee' } });
    res.json({ status: 'success', data: { transactions: rows, revenus: revenus || 0, pagination: pagination(count, page, limit) } });
  } catch (e) { next(e); }
});

// Changer le rôle d'un utilisateur
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'Utilisateur introuvable' });
    if (user.id === req.user.id) return res.status(400).json({ status: 'error', message: 'Vous ne pouvez pas modifier votre propre rôle' });
    const role = await Role.findOne({ where: { nom: req.body.role_nom } });
    if (!role) return res.status(400).json({ status: 'error', message: 'Rôle invalide' });
    user.role_id = role.id;
    await user.save();
    realtime.toUser(user.id, 'user:changed', { id: user.id, role: role.nom, action: 'role' });
    realtime.toRole('admin', 'user:changed', { id: user.id, role: role.nom, action: 'role' });
    res.json({ status: 'success', message: 'Rôle mis à jour' });
  } catch (e) { next(e); }
});

// Types de biens (CRUD). Les régions sont fixes : les 14 régions du Sénégal (ENUM).
const refCrud = (path, Model, label) => {
  router.post(`/${path}`, async (req, res, next) => {
    try {
      const nom = (req.body.nom || '').trim();
      if (!nom) return res.status(400).json({ status: 'error', message: 'Le nom est requis' });
      if (await Model.findOne({ where: { nom } })) return res.status(409).json({ status: 'error', message: `${label} déjà existant` });
      const item = await Model.create({ nom });
      realtime.toAll('refs:changed');
      res.status(201).json({ status: 'success', data: { item } });
    } catch (e) { next(e); }
  });
  router.put(`/${path}/:id`, async (req, res, next) => {
    try {
      const item = await Model.findByPk(req.params.id);
      const nom = (req.body.nom || '').trim();
      if (!item) return res.status(404).json({ status: 'error', message: `${label} introuvable` });
      if (!nom) return res.status(400).json({ status: 'error', message: 'Le nom est requis' });
      if (await Model.findOne({ where: { nom, id: { [Op.ne]: item.id } } })) return res.status(409).json({ status: 'error', message: `${label} déjà existant` });
      item.nom = nom;
      await item.save();
      realtime.toAll('refs:changed');
      res.json({ status: 'success', data: { item } });
    } catch (e) { next(e); }
  });
  router.delete(`/${path}/:id`, async (req, res, next) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ status: 'error', message: `${label} introuvable` });
      const key = 'type_id';
      if (await Bien.count({ where: { [key]: item.id } })) {
        return res.status(409).json({ status: 'error', message: `Impossible de supprimer : des biens utilisent ce ${label.toLowerCase()}` });
      }
      await item.destroy();
      realtime.toAll('refs:changed');
      res.json({ status: 'success', message: 'Supprimé' });
    } catch (e) { next(e); }
  });
};
refCrud('types', TypeBien, 'Type');

module.exports = router;
