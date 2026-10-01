const User = require('../models/User');

// POST /api/auth/login
const login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese correo electrónico y contraseña'
      });
    }

    const user = User.authenticate(email, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Verifique su email o clave.'
      });
    }

    // Token de sesión (puede reemplazarse por jwt.sign)
    const token = `mr-session-${Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64')}`;

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me (Protegido)
const getMe = (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe
};
