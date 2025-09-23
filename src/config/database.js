const mysql = require('mysql2/promise');

const createConnection = async () => {
  try {
    // Para Render PostgreSQL o MySQL externo
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || process.env.DB_HOST,
      user: process.env.MYSQL_USER || process.env.DB_USER,
      password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
      database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
      port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
      charset: 'utf8mb4'
    });

    console.log('✅ Connected to database successfully');
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};
