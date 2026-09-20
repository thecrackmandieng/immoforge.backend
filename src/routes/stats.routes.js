const express = require('express');
const { Op } = require('sequelize');
const { User, Bien, Demande, Transaction, Favori, Notification, Message } = require('../models');
const auth = require('../middlewares/auth');

const router = express.Router();

// Statistiques du tableau de bord, selon le rôle
router.get('/', auth, async (req, res, next) => {
  try {
    const role = req.user.role.nom;
    const uid = req.user.id;
    let stats;

    if (role === 'admin') {
      const [users, biens, enAttente, valides, demandes, transactions, revenus] = await Promise.all([
        User.count(),
        Bien.count(),
        Bien.count({ where: { status_id: 1 } }),
        Bien.count({ where: { status_id: 2 } }),
        Demande.count(),
        Transaction.count(),
        Transaction.sum('montant', { where: { status: 'payee' } })
      ]);
      stats = { users, biens, biens_en_attente: enAttente, biens_valides: valides, demandes, transactions, revenus: revenus || 0 };
    } else if (role === 'partenaire') {
      const mesBiens = await Bien.findAll({ where: { proprietaire_id: uid }, attributes: ['id', 'status_id'] });
      const ids = mesBiens.map(b => b.id);
      const [demandesEnAttente, demandesTotal, revenus] = ids.length
        ? await Promise.all([
            Demande.count({ where: { bien_id: { [Op.in]: ids }, statut: 'en_attente' } }),
            Demande.count({ where: { bien_id: { [Op.in]: ids } } }),
            Transaction.sum('montant', { where: { bien_id: { [Op.in]: ids }, status: 'payee' } })
          ])
        : [0, 0, 0];
      stats = {
        biens: mesBiens.length,
        biens_valides: mesBiens.filter(b => b.status_id === 2).length,
        biens_en_attente: mesBiens.filter(b => b.status_id === 1).length,
        demandes_en_attente: demandesEnAttente,
        demandes: demandesTotal,
        revenus: revenus || 0
      };
    } else {
      const [demandes, demandesAcceptees, favoris, transactions] = await Promise.all([
        Demande.count({ where: { client_id: uid } }),
        Demande.count({ where: { client_id: uid, statut: 'acceptee' } }),
        Favori.count({ where: { user_id: uid } }),
        Transaction.count({ where: { user_id: uid } })
      ]);
      stats = { demandes, demandes_acceptees: demandesAcceptees, favoris, transactions };
    }

    const [notifications_non_lues, messages] = await Promise.all([
      Notification.count({ where: { user_id: uid, est_lu: false } }),
      Message.count({ where: { destinataire_id: uid } })
    ]);

    res.status(200).json({ status: 'success', data: { role, stats: { ...stats, notifications_non_lues, messages } } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
