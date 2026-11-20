const fs = require('fs');
const path = require('path');

const TMP_STATE_FILE = path.join('/tmp', 'mates_rio_store_state.json');
const REPO_MIRROR_FILE = path.join(__dirname, 'store-state.json');
const BACKEND_STATE_FILE = path.join(__dirname, '../../backend-mates-rio/src/data/storeState.json');

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

function readCurrentState() {
  const candidates = [
    readCandidateFile(REPO_MIRROR_FILE),
    readCandidateFile(BACKEND_STATE_FILE),
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

function writeCurrentState(stateObj) {
  // 1. Guardar siempre en /tmp (compatible con Vercel Serverless)
  try {
    fs.writeFileSync(TMP_STATE_FILE, JSON.stringify(stateObj, null, 2), 'utf8');
  } catch (e) {}

  // 2. Guardar también en los archivos del repositorio si el entorno tiene disco escribible
  try {
    fs.writeFileSync(
      REPO_MIRROR_FILE,
      JSON.stringify({ success: true, data: stateObj }, null, 2),
      'utf8'
    );
  } catch (e) {}

  try {
    if (fs.existsSync(path.dirname(BACKEND_STATE_FILE))) {
      fs.writeFileSync(BACKEND_STATE_FILE, JSON.stringify(stateObj, null, 2), 'utf8');
    }
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

  const current = readCurrentState();

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
      writeCurrentState(current);
    }

    return res.status(200).json({
      success: true,
      message: 'Estado global de la tienda sincronizado automáticamente',
      data: current
    });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
};
