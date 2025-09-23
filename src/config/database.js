const mysql = require('mysql2/promise');

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || process.env.RAILWAY_MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || process.env.RAILWAY_MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || process.env.RAILWAY_MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || process.env.RAILWAY_MYSQL_DATABASE || 'music_platform',
      port: process.env.MYSQL_PORT || process.env.RAILWAY_MYSQL_PORT || 3306,
      charset: 'utf8mb4'
    });

    console.log('✅ MySQL Connected successfully to Railway database');
    return connection;
  } catch (error) {
    console.error('❌ MySQL Connection failed:', error.message);
    process.exit(1);
  }
};

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.RAILWAY_MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || process.env.RAILWAY_MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.RAILWAY_MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || process.env.RAILWAY_MYSQL_DATABASE || 'music_platform',
  port: process.env.MYSQL_PORT || process.env.RAILWAY_MYSQL_PORT || 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = { createConnection, pool };