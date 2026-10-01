const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
} = require('../controllers/ordersController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

router.get('/', verifyAdmin, getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id/status', verifyAdmin, updateOrderStatus);

module.exports = router;
