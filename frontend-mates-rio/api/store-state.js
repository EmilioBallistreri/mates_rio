const fs = require('fs');
const path = require('path');

const TMP_STATE_FILE = path.join('/tmp', 'mates_rio_store_state.json');

const ALLOWED_KEYS = [
  'customProducts',
  'editedProducts',
  'deletedProducts',
  'inventory',
  'categories',
  'homeSlides',
  'specialOccasion',
  'customizationPricing',
  'themeMode',
  'supplierPurchases',
  'orders',
  'wholesaleOrders',
  'wholesaleClients',
  'wholesaleAccounts',
  'usersDb',
  'auditLog'
];

let memoryState = {
  customProducts: null,
  editedProducts: null,
  deletedProducts: null,
  inventory: null,
  categories: null,
  homeSlides: null,
  specialOccasion: null,
  customizationPricing: null,
  themeMode: null,
  supplierPurchases: null,
  orders: null,
  wholesaleOrders: null,
  wholesaleClients: null,
  wholesaleAccounts: null,
  usersDb: null,
  auditLog: null,
  updatedAt: 0
};

function readTmpState() {
  try {
    if (fs.existsSync(TMP_STATE_FILE)) {
      const raw = fs.readFileSync(TMP_STATE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.updatedAt >= (memoryState.updatedAt || 0)) {
        memoryState = { ...memoryState, ...parsed };
      }
    }
  } catch (e) {}
  return memoryState;
}

function writeTmpState(stateObj) {
  try {
    fs.writeFileSync(TMP_STATE_FILE, JSON.stringify(stateObj), 'utf8');
  } catch (e) {}
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const current = readTmpState();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: current
    });
  }

  if (req.method === 'PATCH' || req.method === 'PUT' || req.method === 'POST') {
    const patch = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    let changed = false;

    ALLOWED_KEYS.forEach((key) => {
      if (patch[key] !== undefined) {
        current[key] = patch[key];
        changed = true;
      }
    });

    if (changed || patch.forceTimestamp) {
      current.updatedAt = Date.now();
      memoryState = current;
      writeTmpState(current);
    }

    return res.status(200).json({
      success: true,
      message: 'Estado global de la tienda sincronizado correctamente',
      data: current
    });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
};

