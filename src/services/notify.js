// Crée une notification en base ET la pousse en temps réel à l'utilisateur.
const { Notification } = require('../models');
const realtime = require('./realtime');

module.exports = async (user_id, titre, contenu) => {
  try {
    const n = await Notification.create({ user_id, titre, contenu });
    realtime.toUser(user_id, 'notification:new', n.toJSON());
    return n;
  } catch (err) {
    console.error('Notification non créée:', err.message);
    return null;
  }
};
