const express = require('express');
const router = express.Router();
const {
  getStoreState,
  updateStoreState
} = require('../controllers/storeStateController');

router.get('/', getStoreState);
router.put('/', updateStoreState);
router.patch('/', updateStoreState);
router.post('/', updateStoreState);

module.exports = router;

