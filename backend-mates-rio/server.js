const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor Backend Mates Río iniciado con éxito`);
  console.log(`🌐 Escuchando en: http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
