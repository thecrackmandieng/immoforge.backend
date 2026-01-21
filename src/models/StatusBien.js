// src/models/StatusBien.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StatusBien = sequelize.define('StatusBien', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  nom: {
    type: DataTypes.ENUM('en_attente_validation', 'valide', 'refuse', 'indisponible'),
    allowNull: false
  }
}, { tableName: 'status_bien', timestamps: false });

module.exports = StatusBien;
