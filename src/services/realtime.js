// Temps réel (Socket.IO) : authentification JWT, salles par utilisateur / rôle, présence et « en train d'écrire ».
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

let io = null;
/** userId -> nombre de sockets connectées (plusieurs onglets possibles) */
const online = new Map();

const room = {
  user: id => `user:${id}`,
  role: name => `role:${name}`,
  presence: id => `presence:${id}`
};

const init = (httpServer) => {
  // require tardif : évite les dépendances circulaires avec les modèles
  const { User, Role } = require('../models');

  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:4200', credentials: true }
  });

  // Authentification : le client envoie son JWT dans handshake.auth.token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      // Visiteur non connecté : reçoit uniquement les événements publics (catalogue, référentiels)
      if (!token) { socket.data.user = null; return next(); }
      const decoded = jwt.verify(token, jwtConfig.secret);
      const user = await User.findByPk(decoded.id, {
        include: [{ model: Role, as: 'role', attributes: ['id', 'nom'] }],
        attributes: { exclude: ['mot_de_passe'] }
      });
      if (!user || user.statut !== 'actif') return next(new Error('Compte inactif'));
      socket.data.user = { id: user.id, role: user.role.nom, prenom: user.prenom, nom: user.nom };
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    const me = socket.data.user;
    if (!me) return; // anonyme : aucune salle privée, aucun événement personnel

    socket.join(room.user(me.id));
    socket.join(room.role(me.role));

    const count = (online.get(me.id) || 0) + 1;
    online.set(me.id, count);
    if (count === 1) io.to(room.presence(me.id)).emit('presence:update', { userId: me.id, online: true });

    // Suivi de présence : le client indique les utilisateurs qui l'intéressent (ses interlocuteurs)
    socket.on('presence:watch', (ids, ack) => {
      const list = (Array.isArray(ids) ? ids : []).map(Number).filter(Number.isInteger).slice(0, 200);
      list.forEach(id => socket.join(room.presence(id)));
      if (typeof ack === 'function') ack(list.filter(id => online.has(id)));
    });

    // « En train d'écrire » : relayé uniquement au destinataire, l'expéditeur vient toujours du token
    socket.on('typing', ({ to, typing } = {}) => {
      const target = Number(to);
      if (Number.isInteger(target) && target !== me.id) {
        io.to(room.user(target)).emit('typing', { from: me.id, typing: !!typing });
      }
    });

    socket.on('disconnect', () => {
      const left = (online.get(me.id) || 1) - 1;
      if (left <= 0) {
        online.delete(me.id);
        io.to(room.presence(me.id)).emit('presence:update', { userId: me.id, online: false });
      } else {
        online.set(me.id, left);
      }
    });
  });

  return io;
};

const emit = (target, event, payload = {}) => { if (io) io.to(target).emit(event, payload); };

module.exports = {
  init,
  /** Un utilisateur précis (toutes ses sessions) */
  toUser: (id, event, payload) => id && emit(room.user(id), event, payload),
  /** Plusieurs utilisateurs (doublons ignorés) */
  toUsers: (ids, event, payload) => [...new Set(ids.filter(Boolean))].forEach(id => emit(room.user(id), event, payload)),
  /** Tous les utilisateurs d'un rôle */
  toRole: (name, event, payload) => emit(room.role(name), event, payload),
  /** Tous les clients connectés */
  toAll: (event, payload = {}) => { if (io) io.emit(event, payload); },
  /** Coupe toutes les sessions d'un utilisateur (compte suspendu, etc.) */
  disconnectUser: (id) => { if (io) io.in(room.user(id)).disconnectSockets(true); },
  isOnline: id => online.has(Number(id))
};
