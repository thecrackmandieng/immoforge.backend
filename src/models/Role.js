const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'admin, partenaire, client'
  }
}, {
  tableName: 'roles',
  timestamps: false
});

module.exports = Role;