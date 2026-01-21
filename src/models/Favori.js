// src/models/Favori.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favori = sequelize.define('Favori', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT, allowNull: false },
  bien_id: { type: DataTypes.BIGINT, allowNull: false },
  date_favoris: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'favoris', timestamps: false });

module.exports = Favori;
