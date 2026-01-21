// seed.js - Script d'initialisation de la base de données
require('dotenv').config();
const { sequelize, Role, Zone, TypeBien, StatusBien, User } = require('./src/models');

const initDatabase = async () => {
  try {
    console.log('🔄 Initialisation de la base de données...');

    // Synchroniser les modèles
    await sequelize.sync({ force: false });
    console.log('✅ Modèles synchronisés');

    // Insérer les rôles
    const roles = ['admin', 'partenaire', 'client'];
    for (const role of roles) {
      await Role.findOrCreate({
        where: { nom: role },
        defaults: { nom: role }
      });
    }
    console.log('✅ Rôles créés');

    // Insérer les zones (14 zones du Sénégal)
    const zones = [
      'Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou',
      'Kolda', 'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda',
      'Thiès', 'Ziguinchor'
    ];
    for (const zone of zones) {
      await Zone.findOrCreate({
        where: { nom: zone },
        defaults: { nom: zone }
      });
    }
    console.log('✅ Zones créées');

    // Insérer les types de biens
    const types = ['Appartement', 'Maison', 'Villa', 'Studio', 'Terrain', 'Bureau', 'Commerce'];
    for (const type of types) {
      await TypeBien.findOrCreate({
        where: { nom: type },
        defaults: { nom: type }
      });
    }
    console.log('✅ Types de biens créés');

    // Insérer les statuts de biens
    const statuts = ['en_attente_validation', 'valide', 'refuse', 'indisponible'];
    for (const statut of statuts) {
      await StatusBien.findOrCreate({
        where: { nom: statut },
        defaults: { nom: statut }
      });
    }
    console.log('✅ Statuts de biens créés');

    // Créer un utilisateur admin par défaut
    const adminRole = await Role.findOne({ where: { nom: 'admin' } });
    const [admin, created] = await User.findOrCreate({
      where: { email: 'admin@immorforge.sn' },
      defaults: {
        email: 'admin@immorforge.sn',
        mot_de_passe: 'Admin@123',
        prenom: 'Admin',
        nom: 'ImmorForge',
        role_id: adminRole.id,
        statut: 'actif'
      }
    });

    if (created) {
      console.log('✅ Utilisateur admin créé');
      console.log('   Email: admin@immorforge.sn');
      console.log('   Mot de passe: Admin@123');
      console.log('   ⚠️  Changez le mot de passe après la première connexion !');
    } else {
      console.log('ℹ️  Utilisateur admin existe déjà');
    }

    console.log('\n🎉 Initialisation terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

// Exécuter l'initialisation
initDatabase();