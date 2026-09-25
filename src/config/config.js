// src/config/config.js
// Configuración centralizada de la aplicación

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  PORT,
  NODE_ENV,
  APP_NAME: 'Sistema de Gestión de Incidentes - Redes de Plataforma'
};
