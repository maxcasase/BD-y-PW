const { createConnection } = require('../config/database');

async function setupDatabase() {
  try {
    const connection = await createConnection();
    console.log('✅ Connected to Railway MySQL database');
    
    // El script SQL se ejecutará contra la base de Railway
    // Railway ya crea la base de datos automáticamente
    
    console.log('🎉 Database setup completed on Railway');
    await connection.end();
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
  }
}

// Solo ejecutar si no estamos en producción (Railway ejecutará esto automáticamente)
if (process.env.NODE_ENV !== 'production') {
  setupDatabase();
}

module.exports = setupDatabase;