const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const stateFilePath = path.join(__dirname, '../data/storeState.json');
const frontendMirrorFilePath = path.join(__dirname, '../../../frontend-mates-rio/api/store-state.json');
const repoRootPath = path.join(__dirname, '../../..');

let gitAutoPushTimer = null;
let gitPushInProgress = false;
let gitPushPending = false;

function scheduleAutoGitPush() {
  if (process.env.DISABLE_AUTO_GIT_PUSH === 'true') return;
  if (gitAutoPushTimer) clearTimeout(gitAutoPushTimer);

  gitAutoPushTimer = setTimeout(() => {
    runAutoGitPush();
  }, 3000);
}

function runAutoGitPush() {
  if (gitPushInProgress) {
    gitPushPending = true;
    return;
  }
  gitPushInProgress = true;

  const cmd = 'git add "backend-mates-rio/src/data/storeState.json" "frontend-mates-rio/api/store-state.json" && git commit -m "chore(sync): sincronizacion automatica de cambios del panel admin" && git push origin HEAD';

  exec(cmd, { cwd: repoRootPath }, (err) => {
    gitPushInProgress = false;
    if (gitPushPending) {
      gitPushPending = false;
      scheduleAutoGitPush();
    }
  });
}

const DEFAULT_STORE_STATE = {
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

function readStateFromDisk() {
  try {
    if (fs.existsSync(stateFilePath)) {
      const raw = fs.readFileSync(stateFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      const merged = { ...DEFAULT_STORE_STATE, ...parsed };
      writeMirrorToFrontend(merged);
      return merged;
    } else {
      const initial = { ...DEFAULT_STORE_STATE, updatedAt: Date.now() };
      writeStateToDisk(initial, false);
      return initial;
    }
  } catch (err) {
    console.error('Error leyendo storeState.json:', err.message);
  }
  return { ...DEFAULT_STORE_STATE };
}

function writeMirrorToFrontend(stateObj) {
  try {
    const mirrorDir = path.dirname(frontendMirrorFilePath);
    if (!fs.existsSync(mirrorDir)) {
      fs.mkdirSync(mirrorDir, { recursive: true });
    }
    fs.writeFileSync(
      frontendMirrorFilePath,
      JSON.stringify({ success: true, data: stateObj }, null, 2),
      'utf8'
    );
  } catch (err) {
    console.warn('No se pudo actualizar espejo frontend api/store-state.json:', err.message);
  }
}

function writeStateToDisk(stateObj, triggerGitPush = true) {
  try {
    const dir = path.dirname(stateFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(stateFilePath, JSON.stringify(stateObj, null, 2), 'utf8');
    writeMirrorToFrontend(stateObj);
    if (triggerGitPush) {
      scheduleAutoGitPush();
    }
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
      'wholesaleOrders',
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
      currentState.version = (Number(currentState.version) || 0) + 1;
      currentState.updatedAt = Date.now();
      writeStateToDisk(currentState, true);
    }

    return currentState;
  }
};

module.exports = StoreState;
