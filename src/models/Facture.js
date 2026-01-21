// src/models/Facture.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Facture = sequelize.define('Facture', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  paiement_id: { type: DataTypes.BIGINT, allowNull: false },
  url_pdf: { type: DataTypes.TEXT, allowNull: false },
  date_emission: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'factures', timestamps: false });

module.exports = Facture;
