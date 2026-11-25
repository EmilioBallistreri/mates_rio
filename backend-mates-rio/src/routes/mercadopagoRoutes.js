const express = require('express');
const router = express.Router();
const {
  getPublicKey,
  createPreference
} = require('../controllers/mercadopagoController');

// GET /api/mercadopago/public-key
router.get('/public-key', getPublicKey);

// POST /api/mercadopago/create-preference
router.post('/create-preference', createPreference);

module.exports = router;
