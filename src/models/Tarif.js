// src/models/Tarif.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tarif = sequelize.define('Tarif', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  bien_id: { type: DataTypes.BIGINT, allowNull: false },
  type_tarif: {
    type: DataTypes.ENUM('location_mensuelle', 'vente', 'caution', 'acompte'),
    allowNull: false
  },
  montant: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  devise: { type: DataTypes.STRING(10), defaultValue: 'XOF' }
}, { tableName: 'tarifs', timestamps: false });

module.exports = Tarif;
