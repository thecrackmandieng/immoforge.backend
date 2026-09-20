// seed-demo.js - Données de démonstration (comptes, biens, demandes) pour tester le frontend
require('dotenv').config();
const { sequelize, Role, User, Zone, TypeBien, Bien, BienImage, Tarif, Demande, Favori } = require('./src/models');

const run = async () => {
  const roleP = await Role.findOne({ where: { nom: 'partenaire' } });
  const roleC = await Role.findOne({ where: { nom: 'client' } });
  if (!roleP || !roleC) throw new Error('Lancez d\'abord "node seed.js"');

  const [partenaire] = await User.findOrCreate({
    where: { email: 'partenaire@immorforge.sn' },
    defaults: { email: 'partenaire@immorforge.sn', mot_de_passe: 'Partenaire@123', prenom: 'Mamadou', nom: 'Ndiaye', telephone: '+221 77 123 45 67', role_id: roleP.id }
  });
  const [client] = await User.findOrCreate({
    where: { email: 'client@immorforge.sn' },
    defaults: { email: 'client@immorforge.sn', mot_de_passe: 'Client@123', prenom: 'Fatou', nom: 'Diouf', telephone: '+221 78 987 65 43', role_id: roleC.id }
  });

  if (await Bien.count({ where: { proprietaire_id: partenaire.id } })) {
    console.log('ℹ️  Données de démonstration déjà présentes');
    return;
  }

  const z = async nom => (await Zone.findOne({ where: { nom } })).id;
  const t = async nom => (await TypeBien.findOne({ where: { nom } })).id;
  const biens = [
    { titre: 'Appartement de standing aux Almadies', type: 'Appartement', zone: 'Dakar', adresse: 'Almadies', prix: 45000000, ch: 3, sb: 2, surface: 140, lat: 14.7444, lng: -17.5106, img: 'p1.png', vente: true },
    { titre: 'Villa moderne avec piscine à Saly', type: 'Villa', zone: 'Thiès', adresse: 'Saly, Mbour', prix: 125000000, ch: 5, sb: 4, surface: 320, lat: 14.4491, lng: -17.0132, img: 'p2.png', vente: true },
    { titre: 'Studio chic au Plateau', type: 'Studio', zone: 'Dakar', adresse: 'Plateau', prix: 15000000, ch: 1, sb: 1, surface: 45, lat: 14.6708, lng: -17.4381, img: 'p3.png', loyer: 250000 },
    { titre: 'Maison familiale à Saint-Louis', type: 'Maison', zone: 'Saint-Louis', adresse: 'Sor', prix: 38000000, ch: 4, sb: 2, surface: 210, lat: 16.0179, lng: -16.4896, img: 'p1.png', vente: true },
    { titre: 'Appartement meublé à Ziguinchor', type: 'Appartement', zone: 'Ziguinchor', adresse: 'Centre-ville', prix: 22000000, ch: 2, sb: 1, surface: 90, lat: 12.5681, lng: -16.2719, img: 'p3.png', loyer: 180000 },
    { titre: 'Bureau lumineux à Dakar Plateau', type: 'Bureau', zone: 'Dakar', adresse: 'Avenue Léopold Sédar Senghor', prix: 60000000, ch: 0, sb: 2, surface: 180, lat: 14.6692, lng: -17.4322, img: 'p2.png', loyer: 900000 }
  ];

  const crees = [];
  for (const b of biens) {
    const bien = await Bien.create({
      proprietaire_id: partenaire.id, type_id: await t(b.type), zone_id: await z(b.zone), titre: b.titre,
      description: `${b.titre}. Finitions soignées, quartier calme et bien desservi, proche des commerces et des transports. Visite possible sur rendez-vous.`,
      adresse: b.adresse, latitude: b.lat, longitude: b.lng, prix: b.prix, chambres: b.ch, salles_bain: b.sb, surface: b.surface, status_id: 2
    });
    await BienImage.create({ bien_id: bien.id, url_image: `/assets/properties/${b.img}`, ordre: 1 });
    if (b.vente) await Tarif.create({ bien_id: bien.id, type_tarif: 'vente', montant: b.prix });
    if (b.loyer) await Tarif.create({ bien_id: bien.id, type_tarif: 'location_mensuelle', montant: b.loyer });
    crees.push(bien);
  }
  // un bien en attente de validation pour tester la modération
  await Bien.create({ proprietaire_id: partenaire.id, type_id: await t('Terrain'), zone_id: await z('Diourbel'), titre: 'Terrain de 500 m² à Touba', description: 'Terrain viabilisé, titre foncier disponible.', adresse: 'Touba', prix: 12000000, chambres: 0, salles_bain: 0, surface: 500, status_id: 1 });

  await Demande.create({ client_id: client.id, bien_id: crees[0].id, message: 'Bonjour, serait-il possible de visiter ce week-end ?' });
  await Favori.create({ user_id: client.id, bien_id: crees[1].id });

  console.log('✅ Données de démonstration créées');
  console.log('   partenaire@immorforge.sn / Partenaire@123');
  console.log('   client@immorforge.sn / Client@123');
};

run().then(() => process.exit(0)).catch(e => { console.error('❌', e.message); process.exit(1); });
