const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales (con soporte de hasta 50MB para imágenes subidas desde el panel admin)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rutas de la API
app.use('/api', apiRoutes);

// Servir también estáticos del frontend si se accede directamente al servidor backend
const frontendPath = path.join(__dirname, '../../frontend-mates-rio');
app.use(express.static(frontendPath));

// Ruta raíz de bienvenida API
app.get('/api/info', (req, res) => {
  res.json({
    status: 'online',
    project: 'Mates Río API Backend',
    version: '1.0.0',
    documentation: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
