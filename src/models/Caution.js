// src/models/Caution.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Caution = sequelize.define('Caution', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  bien_id: { type: DataTypes.BIGINT, allowNull: false },
  montant: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'cautions', timestamps: false });

module.exports = Caution;
