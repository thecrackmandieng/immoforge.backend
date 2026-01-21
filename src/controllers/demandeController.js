// ============ src/controllers/demandeController.js ============
const { Demande, User } = require('../models');

exports.createDemande = async (req, res, next) => {
  try {
    const { bien_id, message } = req.body;
    const client_id = req.user.id;

    const demande = await Demande.create({
      client_id,
      bien_id,
      message,
      statut: 'en_attente'
    });

    const demandeComplete = await Demande.findByPk(demande.id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'prenom', 'nom', 'email'] },
        { 
          model: Bien, 
          as: 'bien',
          include: [{ model: TypeBien, as: 'type' }]
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Demande créée avec succès',
      data: { demande: demandeComplete }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMesDemandes = async (req, res, next) => {
  try {
    const client_id = req.user.id;

    const demandes = await Demande.findAll({
      where: { client_id },
      include: [
        { 
          model: Bien, 
          as: 'bien',
          include: [
            { model: TypeBien, as: 'type' },
            { model: BienImage, as: 'images' }
          ]
        }
      ],
      order: [['date_demande', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { demandes }
    });
  } catch (error) {
    next(error);
  }
};

exports.getDemandesPourMesBiens = async (req, res, next) => {
  try {
    const proprietaire_id = req.user.id;

    const demandes = await Demande.findAll({
      include: [
        { model: User, as: 'client', attributes: ['id', 'prenom', 'nom', 'email', 'telephone'] },
        { 
          model: Bien, 
          as: 'bien',
          where: { proprietaire_id },
          include: [{ model: TypeBien, as: 'type' }]
        }
      ],
      order: [['date_demande', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { demandes }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStatutDemande = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut } = req.body; // 'acceptee' ou 'refusee'

    const demande = await Demande.findByPk(id, {
      include: [{ model: Bien, as: 'bien' }]
    });

    if (!demande) {
      return res.status(404).json({
        status: 'error',
        message: 'Demande introuvable'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire du bien
    if (demande.bien.proprietaire_id !== req.user.id && req.user.role.nom !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Permission refusée'
      });
    }

    demande.statut = statut;
    await demande.save();

    res.status(200).json({
      status: 'success',
      message: 'Statut de la demande mis à jour',
      data: { demande }
    });
  } catch (error) {
    next(error);
  }
};
