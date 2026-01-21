// src/models/Notification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT, allowNull: false },
  titre: { type: DataTypes.STRING(255) },
  contenu: { type: DataTypes.TEXT },
  est_lu: { type: DataTypes.BOOLEAN, defaultValue: false },
  date_notification: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'notifications', timestamps: false });

module.exports = Notification;
