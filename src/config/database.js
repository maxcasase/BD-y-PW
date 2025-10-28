const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
});

// Verificar conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected successfully to Render');
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
