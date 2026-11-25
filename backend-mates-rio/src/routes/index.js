const express = require('express');
const router = express.Router();

const productsRoutes = require('./productsRoutes');
const ordersRoutes = require('./ordersRoutes');
const authRoutes = require('./authRoutes');
const storeStateRoutes = require('./storeStateRoutes');
const mercadopagoRoutes = require('./mercadopagoRoutes');

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Mates Río API'
  });
});

// Registrar submódulos
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/auth', authRoutes);
router.use('/store-state', storeStateRoutes);
router.use('/mercadopago', mercadopagoRoutes);

module.exports = router;
