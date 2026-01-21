const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Document = require('./Document');
const Zone = require('./Zone');
const TypeBien = require('./TypeBien');
const StatusBien = require('./StatusBien');
const Bien = require('./Bien');
const BienImage = require('./BienImage');
const Tarif = require('./Tarif');
const Caution = require('./Caution');
const Acompte = require('./Acompte');
const Favori = require('./Favori');
const Demande = require('./Demande');
const Transaction = require('./Transaction');
const Paiement = require('./Paiement');
const Facture = require('./Facture');
const Notification = require('./Notification');
const Message = require('./Message');
const LogSysteme = require('./LogSysteme');

// Relations

// User <-> Role
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// User <-> Document
User.hasMany(Document, { foreignKey: 'user_id', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Bien <-> User (propriétaire)
Bien.belongsTo(User, { foreignKey: 'proprietaire_id', as: 'proprietaire' });
User.hasMany(Bien, { foreignKey: 'proprietaire_id', as: 'biens' });

// Bien <-> TypeBien
Bien.belongsTo(TypeBien, { foreignKey: 'type_id', as: 'type' });
TypeBien.hasMany(Bien, { foreignKey: 'type_id', as: 'biens' });

// Bien <-> Zone
Bien.belongsTo(Zone, { foreignKey: 'zone_id', as: 'zone' });
Zone.hasMany(Bien, { foreignKey: 'zone_id', as: 'biens' });

// Bien <-> StatusBien
Bien.belongsTo(StatusBien, { foreignKey: 'status_id', as: 'status' });
StatusBien.hasMany(Bien, { foreignKey: 'status_id', as: 'biens' });

// Bien <-> BienImage
Bien.hasMany(BienImage, { foreignKey: 'bien_id', as: 'images' });
BienImage.belongsTo(Bien, { foreignKey: 'bien_id', as: 'bien' });

// Bien <-> Tarif
Bien.hasMany(Tarif, { foreignKey: 'bien_id', as: 'tarifs' });
Tarif.belongsTo(Bien, { foreignKey: 'bien_id', as: 'bien' });

// Bien <-> Caution
Bien.hasMany(Caution, { foreignKey: 'bien_id', as: 'cautions' });
Caution.belongsTo(Bien, { foreignKey: 'bien_id', as: 'bien' });

// Bien <-> Acompte
Bien.hasMany(Acompte, { foreignKey: 'bien_id', as: 'acomptes' });
Acompte.belongsTo(Bien, { foreignKey: 'bien_id', as: 'bien' });

// Favori
Favori.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Favori.belongsTo(Bien, { foreignKey: 'bien_id', as: 'bien' });
User.hasMany(Favori, { foreignKey: 'user_id', as: 'favoris' });
Bien.hasMany(Favori, { foreignKey: 'bien_id', as: 'favoris' });

// Demande
Demande.belongsTo(User, { foreignKey: 'client_id', as: 'client' });
Demande.belongsTo(Bien, { foreignKey: 'bien_id', as: 'bien' });
User.hasMany(Demande, { foreignKey: 'client_id', as: 'demandes' });
Bien.hasMany(Demande, { foreignKey: 'bien_id', as: 'demandes' });

// Transaction
Transaction.belongsTo(Bien, { foreignKey: 'bien_id', as: 'bien' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Bien.hasMany(Transaction, { foreignKey: 'bien_id', as: 'transactions' });
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });

// Paiement <-> Transaction
Paiement.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
Transaction.hasMany(Paiement, { foreignKey: 'transaction_id', as: 'paiements' });

// Facture <-> Paiement
Facture.belongsTo(Paiement, { foreignKey: 'paiement_id', as: 'paiement' });
Paiement.hasOne(Facture, { foreignKey: 'paiement_id', as: 'facture' });

// Notification
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// Message
Message.belongsTo(User, { foreignKey: 'expediteur_id', as: 'expediteur' });
Message.belongsTo(User, { foreignKey: 'destinataire_id', as: 'destinataire' });
User.hasMany(Message, { foreignKey: 'expediteur_id', as: 'messagesEnvoyes' });
User.hasMany(Message, { foreignKey: 'destinataire_id', as: 'messagesRecus' });

// LogSysteme
LogSysteme.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(LogSysteme, { foreignKey: 'user_id', as: 'logs' });

module.exports = {
  sequelize,
  Role,
  User,
  Document,
  Zone,
  TypeBien,
  StatusBien,
  Bien,
  BienImage,
  Tarif,
  Caution,
  Acompte,
  Favori,
  Demande,
  Transaction,
  Paiement,
  Facture,
  Notification,
  Message,
  LogSysteme
};