// src/models/Message.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  expediteur_id: { type: DataTypes.BIGINT, allowNull: false },
  destinataire_id: { type: DataTypes.BIGINT, allowNull: false },
  contenu: { type: DataTypes.TEXT },
  date_message: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'messages', timestamps: false });

module.exports = Message;
