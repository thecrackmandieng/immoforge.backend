const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bien = sequelize.define('Bien', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  proprietaire_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'types_bien',
      key: 'id'
    }
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  zone_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'zones',
      key: 'id'
    }
  },
  adresse: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  prix: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  chambres: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  salles_bain: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  surface: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  status_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 1,
    references: {
      model: 'status_bien',
      key: 'id'
    }
  },
  raison_refus: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_ajout: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'biens',
  timestamps: false
});

module.exports = Bien;