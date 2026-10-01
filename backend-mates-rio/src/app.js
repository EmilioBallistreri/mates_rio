const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api', apiRoutes);

// Ruta raíz de bienvenida
app.get('/', (req, res) => {
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
