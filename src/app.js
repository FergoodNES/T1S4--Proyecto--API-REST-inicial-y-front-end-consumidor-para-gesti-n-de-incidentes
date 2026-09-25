// src/app.js
// Configuración principal de Express, middlewares y rutas

const express = require('express');
const path = require('path');
const cors = require('cors');

const loggerMiddleware = require('./middlewares/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const incidentRoutes = require('./routes/incidentRoutes');

const app = express();

// 1. Middlewares de infraestructura y seguridad
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Middleware personalizado de registro (Logging)
app.use(loggerMiddleware);

// 3. Servir archivos estáticos del Front-End consumidor
app.use(express.static(path.join(__dirname, '..', 'public')));

// 4. Ruta de verificación de estado (Mantiene compatibilidad con T1S3)
app.get('/api/estado', (req, res) => {
  res.status(200).json({
    plataforma: 'Gestión de Incidentes de Red - T1S4',
    estado: 'activo',
    rol: 'servidor-backend-express',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString()
  });
});

// 5. Montar rutas principales de la API REST
app.use('/api/incidentes', incidentRoutes);

// 6. Middleware para rutas no encontradas (404)
app.use(notFoundHandler);

// 7. Middleware centralizado para manejo de errores (500)
app.use(errorHandler);

module.exports = app;
