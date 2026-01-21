// ============ src/routes/notification.routes.js ============
const { Notification } = require('../models');

const router6 = express.Router();

// Obtenir mes notifications
router6.get('/', auth, async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['date_notification', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { notifications }
    });
  } catch (error) {
    next(error);
  }
});

// Marquer une notification comme lue
router6.put('/:id/lire', auth, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification introuvable'
      });
    }

    notification.est_lu = true;
    await notification.save();

    res.status(200).json({
      status: 'success',
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router6;