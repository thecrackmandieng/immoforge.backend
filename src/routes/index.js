const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const bienRoutes = require('./bien.routes');
const demandeRoutes = require('./demande.routes');
const transactionRoutes = require('./transaction.routes');
const favoriRoutes = require('./favori.routes');
const messageRoutes = require('./message.routes');
const notificationRoutes = require('./notification.routes');

// Documentation de l'API
router.get('/', (req, res) => {
  res.json({
    message: 'API ImmorForge v1.0',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      biens: '/api/v1/biens',
      demandes: '/api/v1/demandes',
      transactions: '/api/v1/transactions',
      favoris: '/api/v1/favoris',
      messages: '/api/v1/messages',
      notifications: '/api/v1/notifications'
    }
  });
});

// Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/biens', bienRoutes);
router.use('/demandes', demandeRoutes);
router.use('/transactions', transactionRoutes);
router.use('/favoris', favoriRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;