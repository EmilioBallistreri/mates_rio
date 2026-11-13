const fs = require('fs');
const path = require('path');

const stateFilePath = path.join(__dirname, '../data/storeState.json');

const DEFAULT_STORE_STATE = {
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
  wholesaleClients: null,
  wholesaleAccounts: null,
  usersDb: null,
  auditLog: null,
  updatedAt: 0
};

function readStateFromDisk() {
  try {
    if (fs.existsSync(stateFilePath)) {
      const raw = fs.readFileSync(stateFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STORE_STATE, ...parsed };
    } else {
      const initial = { ...DEFAULT_STORE_STATE, updatedAt: Date.now() };
      writeStateToDisk(initial);
      return initial;
    }
  } catch (err) {
    console.error('Error leyendo storeState.json:', err.message);
  }
  return { ...DEFAULT_STORE_STATE };
}

function writeStateToDisk(stateObj) {
  try {
    const dir = path.dirname(stateFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(stateFilePath, JSON.stringify(stateObj, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error guardando storeState.json:', err.message);
    return false;
  }
}

let currentState = readStateFromDisk();

const StoreState = {
  getState: () => {
    currentState = readStateFromDisk();
    return currentState;
  },

  updateState: (patch = {}) => {
    currentState = readStateFromDisk();
    const allowedKeys = [
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
      'wholesaleClients',
      'wholesaleAccounts',
      'usersDb',
      'auditLog'
    ];

    let changed = false;
    allowedKeys.forEach((key) => {
      if (patch[key] !== undefined) {
        currentState[key] = patch[key];
        changed = true;
      }
    });

    if (changed || patch.forceTimestamp) {
      currentState.updatedAt = Date.now();
      writeStateToDisk(currentState);
    }

    return currentState;
  }
};

module.exports = StoreState;

