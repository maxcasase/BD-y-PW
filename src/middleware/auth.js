const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const result = await query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      req.user = result.rows[0];
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

module.exports = { protect };
