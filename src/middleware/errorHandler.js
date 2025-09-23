const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log para desarrollo
  console.error(err);

  // Error de PostgreSQL
  if (err.code === '23505') { // Unique violation
    const message = 'El registro ya existe';
    error = { message, statusCode: 400 };
  }

  // Error de clave foránea
  if (err.code === '23503') {
    const message = 'Referencia a registro inexistente';
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;
