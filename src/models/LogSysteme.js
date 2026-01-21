// src/models/LogSysteme.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogSysteme = sequelize.define('LogSysteme', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT },
  action: { type: DataTypes.STRING(255) },
  details: { type: DataTypes.TEXT },
  date_action: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'logs_systeme', timestamps: false });

module.exports = LogSysteme;
