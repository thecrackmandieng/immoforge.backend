// ============ src/routes/transaction.routes.js ============
const transactionController = require('../controllers/transactionController');
const auth = require('../middlewares/auth');
const express = require('express');

const router3 = express.Router();

router3.get('/', auth, transactionController.getMesTransactions);
router3.get('/:id', auth, transactionController.getTransactionById);
router3.post('/', auth, transactionController.createTransaction);

module.exports = router3;