// Middleware pour vérifier le rôle de l'utilisateur
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Non authentifié'
      });
    }

    const userRole = req.user.role.nom;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: 'error',
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    next();
  };
};

module.exports = checkRole;