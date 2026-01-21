// src/models/Paiement.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Paiement = sequelize.define('Paiement', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  transaction_id: { type: DataTypes.BIGINT, allowNull: false },
  montant: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  mode_paiement: { type: DataTypes.STRING(50), allowNull: false },
  statut: {
    type: DataTypes.ENUM('en_attente', 'reussi', 'echoue'),
    defaultValue: 'en_attente'
  },
  date_paiement: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'paiements', timestamps: false });

module.exports = Paiement;
