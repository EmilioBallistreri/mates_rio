const StoreState = require('../models/StoreState');

// GET /api/store-state (Público: para visitantes sin sesión, clientes registrados y administradores)
const getStoreState = (req, res, next) => {
  try {
    const state = StoreState.getState();
    res.json({
      success: true,
      data: state
    });
  } catch (error) {
    next(error);
  }
};

// PATCH o PUT /api/store-state (Actualiza cualquier cambio hecho por un administrador o pedido nuevo)
const updateStoreState = (req, res, next) => {
  try {
    const updated = StoreState.updateState(req.body || {});
    res.json({
      success: true,
      message: 'Estado global de la tienda sincronizado correctamente',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStoreState,
  updateStoreState
};

