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

async function readFromCloudStore() {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (kvUrl && kvToken && typeof fetch !== 'undefined') {
    try {
      const res = await fetch(`${kvUrl.replace(/\/$/, '')}/get/mates_rio_store_state`, {
        headers: { Authorization: `Bearer ${kvToken}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        const raw = json && json.result;
        if (raw) {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (parsed && typeof parsed === 'object') return parsed;
        }
      }
    } catch (e) {}
  }

  const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const ghRepo = process.env.GITHUB_REPOSITORY || 'EmilioBallistreri/mates_rio';
  if (ghToken && typeof fetch !== 'undefined') {
    try {
      const res = await fetch(`https://api.github.com/repos/${ghRepo}/contents/frontend-mates-rio/assets/store-state.json`, {
        headers: {
          Authorization: `Bearer ${ghToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'mates-rio-sync'
        },
        cache: 'no-store'
      });
      if (res.ok) {
        const fileInfo = await res.json();
        if (fileInfo && fileInfo.content) {
          const contentStr = Buffer.from(fileInfo.content, 'base64').toString('utf8');
          const parsed = JSON.parse(contentStr);
          return parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
        }
      }
    } catch (e) {}
  }

  return null;
}

async function writeToCloudStore(stateObj) {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (kvUrl && kvToken && typeof fetch !== 'undefined') {
    try {
      await fetch(`${kvUrl.replace(/\/$/, '')}/set/mates_rio_store_state`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stateObj)
      });
      return 'kv';
    } catch (e) {}
  }

  const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const ghRepo = process.env.GITHUB_REPOSITORY || 'EmilioBallistreri/mates_rio';
  if (ghToken && typeof fetch !== 'undefined') {
    try {
      let sha = null;
      const getRes = await fetch(`https://api.github.com/repos/${ghRepo}/contents/frontend-mates-rio/assets/store-state.json`, {
        headers: {
          Authorization: `Bearer ${ghToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'mates-rio-sync'
        }
      });
      if (getRes.ok) {
        const curFile = await getRes.json();
        sha = curFile.sha;
      }
      const newContent = Buffer.from(JSON.stringify({ success: true, data: stateObj }, null, 2)).toString('base64');
      await fetch(`https://api.github.com/repos/${ghRepo}/contents/frontend-mates-rio/assets/store-state.json`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${ghToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'mates-rio-sync'
        },
        body: JSON.stringify({
          message: 'chore(sync): sincronizacion automatica de cambios admin en la nube',
          content: newContent,
          sha: sha || undefined
        })
      });
      return 'github';
    } catch (e) {}
  }

  return 'local-tmp';
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

  let current = readTmpState();

  const cloudState = await readFromCloudStore();
  if (cloudState && typeof cloudState === 'object') {
    const cloudTs = Number(cloudState.updatedAt || 0);
    const curTs = Number(current.updatedAt || 0);
    if (cloudTs >= curTs) {
      current = { ...current, ...cloudState };
      memoryState = current;
      writeTmpState(current);
    }
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: current,
      meta: {
        serverTime: Date.now(),
        updatedAt: current.updatedAt || 0,
        version: current.version || 1
      }
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
      const storageMode = await writeToCloudStore(current);
      current._storageMode = storageMode;
    }

    return res.status(200).json({
      success: true,
      message: 'Estado global de la tienda sincronizado correctamente',
      data: current
    });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
};
