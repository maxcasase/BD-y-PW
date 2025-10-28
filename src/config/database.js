const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
});
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL environment variable.');
  console.error('   1. Copia la External Database URL de tu servicio de Postgres en Render.');
  console.error('   2. Crea un archivo .env en la raíz del proyecto con:');
  console.error('      DATABASE_URL=postgres://usuario:password@host:puerto/dbname');
  console.error('   3. Vuelve a ejecutar "npm start" o "npm run dev" desde la carpeta del proyecto.');
  process.exit(1);
}

const poolConfig = {
  connectionString: connectionString,
};

if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

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
