// ============ src/controllers/transactionController.js ============
const { Transaction, Paiement } = require('../models');

exports.createTransaction = async (req, res, next) => {
  try {
    const { bien_id, type_transaction, montant } = req.body;
    const user_id = req.user.id;

    const transaction = await Transaction.create({
      bien_id,
      user_id,
      type_transaction,
      montant,
      status: 'en_attente'
    });

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

    const transactions = await Transaction.findAll({
      where: { user_id },
      include: [
        { 
          model: Bien, 
          as: 'bien',
          include: [{ model: TypeBien, as: 'type' }]
        },
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