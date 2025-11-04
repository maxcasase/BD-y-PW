// src/migrations/001_create_users_table.js
// Script para crear automáticamente la tabla users

const { query } = require('../config/database');

const createUsersTable = async () => {
  try {
    console.log('🔧 Creando tabla users...');
    
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        profile_name TEXT,
        bio TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Tabla users creada correctamente');
    
    // Verificar que la tabla existe
    const result = await query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'users'"
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Verificación: tabla users existe en la base de datos');
    } else {
      console.error('❌ Error: tabla users no se pudo crear');
    }
    
  } catch (error) {
    console.error('❌ Error creando tabla users:', error.message);
    throw error;
  }
};

module.exports = { createUsersTable };