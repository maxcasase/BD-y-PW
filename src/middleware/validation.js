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
    .withMessage('Username debe tener entre 3 y 30 caracteres'),
  
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
