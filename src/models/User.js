const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  role_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  telephone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  mot_de_passe: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('actif', 'inactif', 'suspendu'),
    defaultValue: 'actif'
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.mot_de_passe) {
        const salt = await bcrypt.genSalt(10);
        user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('mot_de_passe')) {
        const salt = await bcrypt.genSalt(10);
        user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, salt);
      }
    }
  }
});

// Méthode pour comparer les mots de passe
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.mot_de_passe);
};

// Méthode pour obtenir l'utilisateur sans le mot de passe
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.mot_de_passe;
  return values;
};

module.exports = User;