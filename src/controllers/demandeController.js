// ============ src/controllers/demandeController.js ============
const { Demande, User, Bien, TypeBien, BienImage } = require('../models');
const notifier = require('../services/notify');
const realtime = require('../services/realtime');

// Prévient en direct le client, le propriétaire et les admins qu'une demande a changé
const demandeChanged = (demande, proprietaire_id, action) => {
  const payload = { id: demande.id, bien_id: demande.bien_id, statut: demande.statut, action };
  realtime.toUsers([proprietaire_id, demande.client_id], 'demande:changed', payload);
  realtime.toRole('admin', 'demande:changed', payload);
};

exports.createDemande = async (req, res, next) => {
  try {
    const { bien_id, message } = req.body;
    const client_id = req.user.id;

    const bien = await Bien.findByPk(bien_id);
    if (!bien) {
      return res.status(404).json({ status: 'error', message: 'Bien introuvable' });
    }

    const demande = await Demande.create({
      client_id,
      bien_id,
      message,
      statut: 'en_attente'
    });

    await notifier(bien.proprietaire_id, 'Nouvelle demande', `Nouvelle demande pour « ${bien.titre} »`);
    demandeChanged(demande, bien.proprietaire_id, 'created');

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

    if (!['acceptee', 'refusee'].includes(statut)) {
      return res.status(400).json({ status: 'error', message: 'Statut invalide' });
    }

    demande.statut = statut;
    await demande.save();
    await notifier(
      demande.client_id,
      'Demande mise à jour',
      `Votre demande pour « ${demande.bien.titre} » a été ${statut === 'acceptee' ? 'acceptée' : 'refusée'}`
    );

    demandeChanged(demande, demande.bien.proprietaire_id, 'updated');

    res.status(200).json({
      status: 'success',
      message: 'Statut de la demande mis à jour',
      data: { demande }
    });
  } catch (error) {
    next(error);
  }
};
