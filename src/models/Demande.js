// src/models/Demande.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Demande = sequelize.define('Demande', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  client_id: { type: DataTypes.BIGINT, allowNull: false },
  bien_id: { type: DataTypes.BIGINT, allowNull: false },
  message: { type: DataTypes.TEXT },
  statut: {
    type: DataTypes.ENUM('en_attente', 'acceptee', 'refusee'),
    defaultValue: 'en_attente'
  },
  date_demande: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'demandes', timestamps: false });

module.exports = Demande;
