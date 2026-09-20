// src/models/TypeBien.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TypeBien = sequelize.define('TypeBien', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, { tableName: 'types_bien', timestamps: false });

module.exports = TypeBien;
