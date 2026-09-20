const express = require('express');
const { User, Role } = require('../models');
const notify = require('../services/notify');

const router = express.Router();

// Formulaire de contact public : notifie tous les administrateurs
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ status: 'error', message: 'Nom, email et message requis' });
    }

    const admins = await User.findAll({ include: [{ model: Role, as: 'role', where: { nom: 'admin' } }] });
    await Promise.all(admins.map(a => notify(
      a.id,
      `Contact : ${String(name).slice(0, 80)}`,
      `${message}\n\nEmail : ${email}${phone ? `\nTéléphone : ${phone}` : ''}`
    )));

    res.status(201).json({ status: 'success', message: 'Message envoyé. Nous vous répondrons rapidement.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
