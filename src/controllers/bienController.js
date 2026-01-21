const { Bien, BienImage, User, Zone, TypeBien, StatusBien, Tarif } = require('../models');
const { Op } = require('sequelize');

// Créer un bien
exports.createBien = async (req, res, next) => {
  try {
    const { titre, description, type_id, zone_id, adresse, latitude, longitude, prix, tarifs, images } = req.body;
    const proprietaire_id = req.user.id;

    // Créer le bien
    const bien = await Bien.create({
      proprietaire_id,
      type_id,
      titre,
      description,
      zone_id,
      adresse,
      latitude,
      longitude,
      prix,
      status_id: 1 // En attente de validation
    });

    // Ajouter les tarifs si fournis
    if (tarifs && Array.isArray(tarifs)) {
      for (const tarif of tarifs) {
        await Tarif.create({
          bien_id: bien.id,
          type_tarif: tarif.type_tarif,
          montant: tarif.montant,
          devise: tarif.devise || 'XOF'
        });
      }
    }

    // Ajouter les images si fournies
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        await BienImage.create({
          bien_id: bien.id,
          url_image: images[i],
          ordre: i + 1
        });
      }
    }

    // Récupérer le bien complet
    const bienComplet = await Bien.findByPk(bien.id, {
      include: [
        { model: TypeBien, as: 'type' },
        { model: Zone, as: 'zone' },
        { model: StatusBien, as: 'status' },
        { model: BienImage, as: 'images' },
        { model: Tarif, as: 'tarifs' }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Bien créé avec succès',
      data: { bien: bienComplet }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir tous les biens (avec filtres)
exports.getAllBiens = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type_id, zone_id, prix_min, prix_max, status_id, search } = req.query;
    const offset = (page - 1) * limit;

    // Construire les filtres
    const where = {};
    
    if (type_id) where.type_id = type_id;
    if (zone_id) where.zone_id = zone_id;
    if (status_id) where.status_id = status_id;
    else where.status_id = 2; // Par défaut, seulement les biens validés
    
    if (prix_min || prix_max) {
      where.prix = {};
      if (prix_min) where.prix[Op.gte] = prix_min;
      if (prix_max) where.prix[Op.lte] = prix_max;
    }
    
    if (search) {
      where[Op.or] = [
        { titre: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: biens } = await Bien.findAndCountAll({
      where,
      include: [
        { model: TypeBien, as: 'type' },
        { model: Zone, as: 'zone' },
        { model: StatusBien, as: 'status' },
        { model: BienImage, as: 'images' },
        { model: Tarif, as: 'tarifs' },
        { 
          model: User, 
          as: 'proprietaire',
          attributes: ['id', 'prenom', 'nom', 'email', 'telephone']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_ajout', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        biens,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir un bien par ID
exports.getBienById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bien = await Bien.findByPk(id, {
      include: [
        { model: TypeBien, as: 'type' },
        { model: Zone, as: 'zone' },
        { model: StatusBien, as: 'status' },
        { model: BienImage, as: 'images' },
        { model: Tarif, as: 'tarifs' },
        { 
          model: User, 
          as: 'proprietaire',
          attributes: ['id', 'prenom', 'nom', 'email', 'telephone']
        }
      ]
    });

    if (!bien) {
      return res.status(404).json({
        status: 'error',
        message: 'Bien introuvable'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { bien }
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un bien
exports.updateBien = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role.nom;

    const bien = await Bien.findByPk(id);
    if (!bien) {
      return res.status(404).json({
        status: 'error',
        message: 'Bien introuvable'
      });
    }

    // Vérifier les permissions
    if (userRole !== 'admin' && bien.proprietaire_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas la permission de modifier ce bien'
      });
    }

    // Mettre à jour le bien
    const { titre, description, type_id, zone_id, adresse, latitude, longitude, prix } = req.body;
    
    await bien.update({
      titre: titre || bien.titre,
      description: description !== undefined ? description : bien.description,
      type_id: type_id || bien.type_id,
      zone_id: zone_id || bien.zone_id,
      adresse: adresse || bien.adresse,
      latitude: latitude || bien.latitude,
      longitude: longitude || bien.longitude,
      prix: prix || bien.prix
    });

    // Récupérer le bien mis à jour
    const bienMisAJour = await Bien.findByPk(id, {
      include: [
        { model: TypeBien, as: 'type' },
        { model: Zone, as: 'zone' },
        { model: StatusBien, as: 'status' },
        { model: BienImage, as: 'images' },
        { model: Tarif, as: 'tarifs' }
      ]
    });

    res.status(200).json({
      status: 'success',
      message: 'Bien mis à jour avec succès',
      data: { bien: bienMisAJour }
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer un bien
exports.deleteBien = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role.nom;

    const bien = await Bien.findByPk(id);
    if (!bien) {
      return res.status(404).json({
        status: 'error',
        message: 'Bien introuvable'
      });
    }

    // Vérifier les permissions
    if (userRole !== 'admin' && bien.proprietaire_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas la permission de supprimer ce bien'
      });
    }

    await bien.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Bien supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// Valider/Refuser un bien (Admin seulement)
exports.validerBien = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, raison_refus } = req.body; // action: 'valider' ou 'refuser'

    const bien = await Bien.findByPk(id);
    if (!bien) {
      return res.status(404).json({
        status: 'error',
        message: 'Bien introuvable'
      });
    }

    if (action === 'valider') {
      bien.status_id = 2; // Validé
      bien.raison_refus = null;
    } else if (action === 'refuser') {
      bien.status_id = 3; // Refusé
      bien.raison_refus = raison_refus;
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Action invalide'
      });
    }

    await bien.save();

    res.status(200).json({
      status: 'success',
      message: `Bien ${action === 'valider' ? 'validé' : 'refusé'} avec succès`,
      data: { bien }
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir les biens de l'utilisateur connecté
exports.getMesBiens = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: biens } = await Bien.findAndCountAll({
      where: { proprietaire_id: userId },
      include: [
        { model: TypeBien, as: 'type' },
        { model: Zone, as: 'zone' },
        { model: StatusBien, as: 'status' },
        { model: BienImage, as: 'images' },
        { model: Tarif, as: 'tarifs' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_ajout', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        biens,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};