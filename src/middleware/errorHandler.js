const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log para desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Error de MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'El registro ya existe';
    error = { message, statusCode: 400 };
  }

  // Error de clave foránea
  if (err.code === 'ER_NO_REFERENCED_ROW') {
    const message = 'Referencia a registro inexistente';
    error = { message, statusCode: 400 };
  }

  // Error de sintaxis SQL
  if (err.code === 'ER_PARSE_ERROR') {
    const message = 'Error de sintaxis en la consulta';
    error = { message, statusCode: 400 };
  }

  // Error de conexión a base de datos
  if (err.code === 'ECONNREFUSED') {
    const message = 'Error de conexión a la base de datos';
    error = { message, statusCode: 500 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;