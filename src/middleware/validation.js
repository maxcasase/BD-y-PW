const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

exports.validateRegister = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username solo puede contener letras, números y guiones bajos'),
  
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password debe tener al menos 6 caracteres'),
  
  handleValidationErrors
];

exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido'),
  
  body('password')
    .notEmpty()
    .withMessage('Password es requerido'),
  
  handleValidationErrors
];

exports.validateReview = [
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating debe ser entre 1 y 10'),
  
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title debe tener entre 1 y 200 caracteres'),
  
  body('content')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content debe tener entre 10 y 2000 caracteres'),
  
  handleValidationErrors
];

exports.validatePlaylist = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title debe tener entre 1 y 200 caracteres'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description no puede exceder 1000 caracteres'),
  
  handleValidationErrors
];

exports.validateAlbum = [
  body('title')
    .isLength({ min: 1, max: 300 })
    .withMessage('Title debe tener entre 1 y 300 caracteres'),
  
  body('artist_id')
    .isInt({ min: 1 })
    .withMessage('Artist ID debe ser un número válido'),
  
  body('release_year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
    .withMessage('Release year debe ser un año válido'),
  
  body('genre_id')
    .isInt({ min: 1 })
    .withMessage('Genre ID debe ser un número válido'),
  
  handleValidationErrors
];