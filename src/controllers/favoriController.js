// ============ src/controllers/favoriController.js ============
const { Favori, Bien, BienImage, TypeBien } = require('../models');

exports.addFavori = async (req, res, next) => {
  try {
    const { bien_id } = req.body;
    const user_id = req.user.id;

    const existingFavori = await Favori.findOne({ where: { user_id, bien_id } });
    if (existingFavori) {
      return res.status(409).json({
        status: 'error',
        message: 'Ce bien est déjà dans vos favoris'
      });
    }

    const favori = await Favori.create({ user_id, bien_id });

    res.status(201).json({
      status: 'success',
      message: 'Bien ajouté aux favoris',
      data: { favori }
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFavori = async (req, res, next) => {
  try {
    const { bien_id } = req.params;
    const user_id = req.user.id;

    const favori = await Favori.findOne({ where: { user_id, bien_id } });
    if (!favori) {
      return res.status(404).json({
        status: 'error',
        message: 'Favori introuvable'
      });
    }

    await favori.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Bien retiré des favoris'
    });
  } catch (error) {
    next(error);
  }
};

exports.getMesFavoris = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const favoris = await Favori.findAll({
      where: { user_id },
      include: [{
        model: Bien,
        as: 'bien',
        include: [
          { model: TypeBien, as: 'type' },
          { model: BienImage, as: 'images' }
        ]
      }],
      order: [['date_favoris', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { favoris }
    });
  } catch (error) {
    next(error);
  }
};