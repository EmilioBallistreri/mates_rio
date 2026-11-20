const fs = require('fs');
const path = require('path');

const TMP_STATE_FILE = path.join('/tmp', 'mates_rio_store_state.json');
const STATIC_STATE_FILE = path.join(__dirname, '../assets/store-state.json');

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
  themeMode: 'light',
  supplierPurchases: null,
  orders: null,
  wholesaleOrders: null,
  wholesaleClients: null,
  wholesaleAccounts: null,
  usersDb: null,
  auditLog: null,
  version: 1,
  updatedAt: 0
};

function readCandidateFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
      }
    }
  } catch (e) {}
  return null;
}

function readTmpState() {
  const candidates = [
    readCandidateFile(STATIC_STATE_FILE),
    readCandidateFile(TMP_STATE_FILE)
  ].filter(Boolean);

  candidates.forEach((cand) => {
    const candTs = Number(cand.updatedAt || 0);
    const candVer = Number(cand.version || 0);
    const memTs = Number(memoryState.updatedAt || 0);
    const memVer = Number(memoryState.version || 0);
    if (candTs > memTs || (candTs === memTs && candVer > memVer)) {
      memoryState = { ...memoryState, ...cand };
    }
  });

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
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

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
    let patch = {};
    try {
      patch = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    } catch (e) {
      patch = {};
    }

    let changed = false;

    ALLOWED_KEYS.forEach((key) => {
      if (patch[key] !== undefined) {
        current[key] = patch[key];
        changed = true;
      }
    });

    if (changed || patch.forceTimestamp) {
      current.version = (Number(current.version) || 0) + 1;
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
