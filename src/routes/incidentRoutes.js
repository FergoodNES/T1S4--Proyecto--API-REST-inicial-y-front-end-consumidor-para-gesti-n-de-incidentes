// src/routes/incidentRoutes.js
// Definición de rutas REST para el recurso de Incidentes

const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

// Rutas de colección y estadísticas
router.get('/', incidentController.listarIncidentes);
router.get('/estadisticas', incidentController.obtenerEstadisticas);
router.post('/', incidentController.crearIncidente);

// Rutas de elemento individual por identificador
router.get('/:id', incidentController.obtenerIncidente);
router.put('/:id', incidentController.actualizarIncidente);
router.delete('/:id', incidentController.eliminarIncidente);

module.exports = router;
