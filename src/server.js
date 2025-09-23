const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

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
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
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

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'MySQL'
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en modo ${process.env.NODE_ENV} en puerto ${PORT}`);
  console.log(`📊 Base de datos: MySQL`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/v1/health`);
});