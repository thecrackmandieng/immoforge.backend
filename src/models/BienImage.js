// src/models/BienImage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BienImage = sequelize.define('BienImage', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  bien_id: { type: DataTypes.BIGINT, allowNull: false },
  url_image: { type: DataTypes.TEXT, allowNull: false },
  ordre: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { tableName: 'biens_images', timestamps: false });

module.exports = BienImage;
