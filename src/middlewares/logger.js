// src/middlewares/logger.js
// Middleware personalizado para el registro detallado de solicitudes HTTP

const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Interceptar la finalización de la respuesta para calcular tiempo y código de estado
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Identificador visual según el código HTTP
    let statusBadge = `[${statusCode}]`;
    if (statusCode >= 500) statusBadge = `\x1b[31m${statusBadge}\x1b[0m`; // Rojo
    else if (statusCode >= 400) statusBadge = `\x1b[33m${statusBadge}\x1b[0m`; // Amarillo
    else if (statusCode >= 300) statusBadge = `\x1b[36m${statusBadge}\x1b[0m`; // Cyan
    else statusBadge = `\x1b[32m${statusBadge}\x1b[0m`; // Verde

    console.log(
      `[REGISTRO] ${timestamp} | ${req.method.padEnd(6)} | ${statusBadge} | ${req.originalUrl} | IP: ${clientIp} | ${duration}ms`
    );
  });

  next();
};

module.exports = loggerMiddleware;
