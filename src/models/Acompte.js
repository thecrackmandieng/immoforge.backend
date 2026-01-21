// src/models/Acompte.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Acompte = sequelize.define('Acompte', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  bien_id: { type: DataTypes.BIGINT, allowNull: false },
  montant: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'acomptes', timestamps: false });

module.exports = Acompte;
