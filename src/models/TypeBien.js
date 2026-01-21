// src/models/TypeBien.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TypeBien = sequelize.define('TypeBien', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  nom: {
    type: DataTypes.ENUM('Appartement', 'Maison', 'Villa', 'Studio', 'Terrain', 'Bureau', 'Commerce'),
    allowNull: false
  }
}, { tableName: 'types_bien', timestamps: false });

module.exports = TypeBien;
