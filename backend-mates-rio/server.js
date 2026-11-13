const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor Backend Mates Río iniciado con éxito`);
  console.log(`🌐 Escuchando en: http://${HOST}:${PORT} (accesible en red local y localhost)`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
