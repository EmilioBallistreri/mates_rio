const Order = require('../models/Order');

// GET /api/orders (Protegido Admin)
const getOrders = (req, res, next) => {
  try {
    const { status } = req.query;
    const orders = Order.findAll({ status });
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
const getOrderById = (req, res, next) => {
  try {
    const order = Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Orden ${req.params.id} no encontrada`
      });
    }
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders (Público - Checkout)
const createOrder = (req, res, next) => {
  try {
    const { client, items, total } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'La orden debe contener al menos un producto'
      });
    }

    const order = Order.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Orden generada con éxito',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/:id/status (Protegido Admin)
const updateOrderStatus = (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el nuevo estado de la orden'
      });
    }

    const updated = Order.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Orden ${req.params.id} no encontrada`
      });
    }

    res.json({
      success: true,
      message: `Estado de la orden ${req.params.id} actualizado a ${status}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
};
