const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
});

// Verificar conexión al inicio
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected successfully to Render');
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
