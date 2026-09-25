// src/middlewares/errorHandler.js
// Middlewares para gestión centralizada de rutas no encontradas y errores de servidor

// Manejador para rutas 404 (Recurso no encontrado)
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: 'Recurso no encontrado',
    message: `La ruta solicitada '${req.method} ${req.originalUrl}' no existe en este servidor API REST.`,
    timestamp: new Date().toISOString()
  });
};

// Manejador centralizado de errores (500 u otros especificados)
// Middleware de 4 parámetros según estándar Express
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  console.error(`\x1b[31m[ERROR HANDLER] ${req.method} ${req.originalUrl} - ${message}\x1b[0m`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    error: err.name || 'InternalServerError',
    message,
    details: err.details || null,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
