const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

// Configuraciones de base de datos
require('./config/database'); // PostgreSQL
const connectMongoDB = require('./database/mongodb');

// Importar y ejecutar setup de base de datos
const setupDatabase = require('./database/setup');

async function startServer() {
  await connectMongoDB();
  await setupDatabase();

  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Importar rutas
  const auth = require('./routes/auth');
  const users = require('./routes/users');
  const albums = require('./routes/albums');
  const reviews = require('./routes/reviews');
  const notifications = require('./routes/notifications');

  // Montar rutas
  app.use('/api/v1/auth', auth);
  app.use('/api/v1/users', users);
  app.use('/api/v1/albums', albums);
  app.use('/api/v1/reviews', reviews);
  app.use('/api/v1/notifications', notifications);

  // Health check
  app.get('/api/v1/health', async (req, res) => {
    try {
      const { query } = require('./config/database'); // PostgreSQL query
      await query('SELECT 1');

      res.status(200).json({
        success: true,
        message: 'Server is running on Render',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: 'PostgreSQL ✅, MongoDB ✅'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: error.message
      });
    }
  });

  // Rutas indefinidas
  app.all('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`
    });
  });

  // Manejador de errores
  const errorHandler = require('./middleware/errorHandler');
  app.use(errorHandler);

  const PORT = process.env.PORT || 10000;

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en Render - Puerto: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📊 Databases: PostgreSQL, MongoDB`);
    console.log(`✅ Health check: /api/v1/health`);
  });
}

startServer();
