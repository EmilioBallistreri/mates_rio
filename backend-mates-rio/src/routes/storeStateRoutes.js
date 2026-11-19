const express = require('express');
const router = express.Router();
const {
  getStoreState,
  streamStoreState,
  updateStoreState
} = require('../controllers/storeStateController');

router.get('/', getStoreState);
router.get('/stream', streamStoreState);
router.put('/', updateStoreState);
router.patch('/', updateStoreState);
router.post('/', updateStoreState);

module.exports = router;
