const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

// Importar configuración de DB (PostgreSQL)
require('./config/database');

// Importar rutas
const auth = require('./routes/auth');
const users = require('./routes/users');
const albums = require('./routes/albums');
const reviews = require('./routes/reviews');
const playlists = require('./routes/playlists');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://tu-frontend.onrender.com",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Montar rutas
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/albums', albums);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/playlists', playlists);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running on Render',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'PostgreSQL'
  });
});

// Manejar rutas no encontradas
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`
  });
});

// Manejar errores
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 10000; // Render usa puerto dinámico

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en Render - Puerto: ${PORT}`);
  console.log(`📊 Base de datos: PostgreSQL`);
  console.log(`🌐 Health check: /api/v1/health`);
});
