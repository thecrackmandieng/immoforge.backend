// ============ src/routes/message.routes.js ============
const { Message } = require('../models');
const notify = require('../services/notify');
const realtime = require('../services/realtime');
const { User } = require('../models');
const auth = require('../middlewares/auth');
const express = require('express');

const router5 = express.Router();

// Obtenir mes messages
router5.get('/', auth, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { type = 'recus' } = req.query; // 'recus' ou 'envoyes'

    const where = type === 'recus' 
      ? { destinataire_id: user_id }
      : { expediteur_id: user_id };

    const messages = await Message.findAll({
      where,
      include: [
        { model: User, as: 'expediteur', attributes: ['id', 'prenom', 'nom'] },
        { model: User, as: 'destinataire', attributes: ['id', 'prenom', 'nom'] }
      ],
      order: [['date_message', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
});

// Envoyer un message
router5.post('/', auth, async (req, res, next) => {
  try {
    const { destinataire_id, contenu } = req.body;
    const expediteur_id = req.user.id;

    if (!destinataire_id || !contenu || !contenu.trim()) {
      return res.status(400).json({ status: 'error', message: 'Destinataire et contenu requis' });
    }
    if (Number(destinataire_id) === expediteur_id) {
      return res.status(400).json({ status: 'error', message: 'Vous ne pouvez pas vous écrire à vous-même' });
    }

    const message = await Message.create({
      expediteur_id,
      destinataire_id,
      contenu
    });

    const dest = await User.findByPk(destinataire_id, { attributes: ['id', 'prenom', 'nom'] });
    const payload = {
      ...message.toJSON(),
      expediteur: { id: req.user.id, prenom: req.user.prenom, nom: req.user.nom },
      destinataire: dest ? { id: dest.id, prenom: dest.prenom, nom: dest.nom } : null
    };
    // temps réel : au destinataire ET à l'expéditeur (ses autres onglets)
    realtime.toUsers([destinataire_id, expediteur_id], 'message:new', payload);
    await notify(destinataire_id, 'Nouveau message', `${req.user.prenom || ''} ${req.user.nom || ''}`.trim() + ' vous a envoyé un message');

    res.status(201).json({
      status: 'success',
      message: 'Message envoyé',
      data: { message }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router5;