/**
 * Configuración de Base de Datos para Mates Río
 * 
 * Por defecto inicializa el almacenamiento en memoria con persistencia básica o seed data.
 * Preparado para conectar MongoDB (Mongoose), PostgreSQL (Sequelize/Prisma) o Supabase.
 */

const connectDB = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
    if (dbUrl) {
      console.log(`🔌 Conectando a base de datos externa: ${dbUrl.split('@')[1] || 'Configurada'}`);
      // Ejemplo: await mongoose.connect(dbUrl);
    } else {
      console.log(`💾 Utilizando almacenamiento local/JSON para desarrollo rápido.`);
    }
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
  }
};

module.exports = { connectDB };
