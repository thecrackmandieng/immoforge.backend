// src/models/Zone.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Zone = sequelize.define('Zone', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  nom: {
    type: DataTypes.ENUM('Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou',
      'Kolda', 'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda', 'Thiès', 'Ziguinchor'),
    allowNull: false
  }
}, { tableName: 'zones', timestamps: false });

module.exports = Zone;
