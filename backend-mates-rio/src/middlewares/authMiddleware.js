/**
 * Middleware de Autenticación y Autorización
 */

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado: Token de autenticación no proporcionado'
    });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  // Validación básica del token (permite token mock de desarrollo o JWT)
  if (token === 'admin-session-active' || token.length > 10) {
    req.user = {
      role: 'Super Administrador',
      email: 'admin@matesrio.com'
    };
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Token de sesión inválido o expirado'
  });
};

module.exports = {
  verifyAdmin
};
