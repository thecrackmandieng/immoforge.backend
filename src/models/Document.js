// src/models/Document.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT, allowNull: false },
  type_document: { type: DataTypes.STRING(100), allowNull: false },
  url_document: { type: DataTypes.TEXT, allowNull: false },
  date_upload: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'documents', timestamps: false });

module.exports = Document;
