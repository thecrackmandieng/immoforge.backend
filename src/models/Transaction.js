// src/models/Transaction.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  bien_id: { type: DataTypes.BIGINT, allowNull: false },
  user_id: { type: DataTypes.BIGINT, allowNull: false },
  type_transaction: {
    type: DataTypes.ENUM('location', 'vente'),
    allowNull: false
  },
  montant: { type: DataTypes.DECIMAL(15, 2) },
  status: {
    type: DataTypes.ENUM('en_attente', 'payee', 'annulee'),
    defaultValue: 'en_attente'
  },
  date_transaction: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'transactions', timestamps: false });

module.exports = Transaction;
