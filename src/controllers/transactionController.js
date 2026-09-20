// ============ src/controllers/transactionController.js ============
const { Transaction, Paiement, Bien, TypeBien, User } = require('../models');
const notify = require('../services/notify');
const realtime = require('../services/realtime');

// Prévient en direct l'acheteur, le propriétaire et les admins
const transactionChanged = (t, proprietaire_id, action) => {
  const payload = { id: t.id, bien_id: t.bien_id, status: t.status, action };
  realtime.toUsers([t.user_id, proprietaire_id], 'transaction:changed', payload);
  realtime.toRole('admin', 'transaction:changed', payload);
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { bien_id, type_transaction, montant } = req.body;
    const user_id = req.user.id;

    const bien = await Bien.findByPk(bien_id);
    if (!bien) {
      return res.status(404).json({ status: 'error', message: 'Bien introuvable' });
    }

    const transaction = await Transaction.create({
      bien_id,
      user_id,
      type_transaction,
      montant: montant || bien.prix,
      status: 'en_attente'
    });

    transactionChanged(transaction, bien.proprietaire_id, 'created');

    res.status(201).json({
      status: 'success',
      message: 'Transaction créée avec succès',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMesTransactions = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    // Un propriétaire voit les transactions sur SES biens ; un client voit ses propres achats/locations
    const isOwner = req.user.role.nom === 'partenaire';

    const transactions = await Transaction.findAll({
      where: isOwner ? {} : { user_id },
      include: [
        { 
          model: Bien, 
          as: 'bien',
          ...(isOwner ? { where: { proprietaire_id: user_id } } : {}),
          include: [{ model: TypeBien, as: 'type' }]
        },
        { model: User, as: 'user', attributes: ['id', 'prenom', 'nom', 'email'] },
        { model: Paiement, as: 'paiements' }
      ],
      order: [['date_transaction', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id, {
      include: [
        { 
          model: Bien, 
          as: 'bien',
          include: [{ model: TypeBien, as: 'type' }]
        },
        { model: User, as: 'user', attributes: ['id', 'prenom', 'nom', 'email'] },
        { model: Paiement, as: 'paiements' }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction introuvable'
      });
    }

    // Vérifier les permissions
    if (transaction.user_id !== req.user.id && req.user.role.nom !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Permission refusée'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// Paiement d'une transaction (simulé : aucune passerelle de paiement n'est branchée)
exports.payerTransaction = async (req, res, next) => {
  try {
    const { mode_paiement = 'mobile_money' } = req.body;
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [{ model: Bien, as: 'bien' }]
    });

    if (!transaction || transaction.user_id !== req.user.id) {
      return res.status(404).json({ status: 'error', message: 'Transaction introuvable' });
    }
    if (transaction.status !== 'en_attente') {
      return res.status(400).json({ status: 'error', message: 'Cette transaction ne peut plus être payée' });
    }

    const paiement = await Paiement.create({
      transaction_id: transaction.id,
      montant: transaction.montant,
      mode_paiement,
      statut: 'reussi'
    });
    transaction.status = 'payee';
    await transaction.save();

    await notify(
      transaction.bien.proprietaire_id,
      'Paiement reçu',
      `Paiement de ${transaction.montant} XOF reçu pour « ${transaction.bien.titre} »`
    );
    transactionChanged(transaction, transaction.bien.proprietaire_id, 'paid');

    res.status(200).json({ status: 'success', message: 'Paiement effectué', data: { paiement, transaction } });
  } catch (error) {
    next(error);
  }
};

// Annulation d'une transaction en attente
exports.annulerTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, { include: [{ model: Bien, as: 'bien' }] });
    if (!transaction || transaction.user_id !== req.user.id) {
      return res.status(404).json({ status: 'error', message: 'Transaction introuvable' });
    }
    if (transaction.status !== 'en_attente') {
      return res.status(400).json({ status: 'error', message: 'Seule une transaction en attente peut être annulée' });
    }
    transaction.status = 'annulee';
    await transaction.save();
    transactionChanged(transaction, transaction.bien.proprietaire_id, 'cancelled');
    res.status(200).json({ status: 'success', message: 'Transaction annulée', data: { transaction } });
  } catch (error) {
    next(error);
  }
};
