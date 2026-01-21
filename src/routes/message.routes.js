// ============ src/routes/message.routes.js ============
const { Message } = require('../models');

const router5 = express.Router();

// Obtenir mes messages
router5.get('/', auth, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { type = 'recus' } = req.query; // 'recus' ou 'envoyes'

    const where = type === 'recus' 
      ? { destinataire_id: user_id }
      : { expediteur_id: user_id };

    const messages = await Message.findAll({
      where,
      include: [
        { model: User, as: 'expediteur', attributes: ['id', 'prenom', 'nom'] },
        { model: User, as: 'destinataire', attributes: ['id', 'prenom', 'nom'] }
      ],
      order: [['date_message', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
});

// Envoyer un message
router5.post('/', auth, async (req, res, next) => {
  try {
    const { destinataire_id, contenu } = req.body;
    const expediteur_id = req.user.id;

    const message = await Message.create({
      expediteur_id,
      destinataire_id,
      contenu
    });

    res.status(201).json({
      status: 'success',
      message: 'Message envoyé',
      data: { message }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router5;