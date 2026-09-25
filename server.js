// server.js
// Punto de entrada del servidor Express para T1S4

const app = require('./src/app');
const { PORT, APP_NAME } = require('./src/config/config');

const server = app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🚀 ${APP_NAME}`);
  console.log(`📡 Servidor Express iniciado y escuchando en:`);
  console.log(`   ➜ Local:   http://localhost:${PORT}`);
  console.log(`   ➜ API:     http://localhost:${PORT}/api/incidentes`);
  console.log(`   ➜ Estado:  http://localhost:${PORT}/api/estado`);
  console.log('================================================================');
});

// Manejo elegante de cierre de proceso
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor de manera controlada...');
  server.close(() => {
    console.log('✅ Servidor finalizado con éxito.');
    process.exit(0);
  });
});
