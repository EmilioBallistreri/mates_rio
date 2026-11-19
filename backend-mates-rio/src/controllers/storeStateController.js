const StoreState = require('../models/StoreState');

// Lista de clientes conectados por Server-Sent Events (SSE) para actualización instantánea en tiempo real
const sseClients = new Set();

function broadcastStateToClients(state) {
  const payload = `data: ${JSON.stringify({ success: true, data: state })}\n\n`;
  sseClients.forEach((clientRes) => {
    try {
      clientRes.write(payload);
    } catch (e) {
      sseClients.delete(clientRes);
    }
  });
}

// GET /api/store-state (Público: para visitantes sin sesión, clientes registrados y administradores)
const getStoreState = (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const state = StoreState.getState();
    res.json({
      success: true,
      data: state
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/store-state/stream (SSE tiempo real para todos los dispositivos abiertos)
const streamStoreState = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  const initialState = StoreState.getState();
  res.write(`data: ${JSON.stringify({ success: true, data: initialState })}\n\n`);

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch (e) {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
};

// PATCH, PUT o POST /api/store-state (Actualiza automáticamente cualquier cambio hecho en el Admin)
const updateStoreState = (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const updated = StoreState.updateState(req.body || {});
    broadcastStateToClients(updated);
    res.json({
      success: true,
      message: 'Estado global de la tienda sincronizado automáticamente',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStoreState,
  streamStoreState,
  updateStoreState
};
