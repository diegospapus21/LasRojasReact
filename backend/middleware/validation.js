const { body, validationResult } = require('express-validator');

// Manejador de errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validaciones para registro de usuario
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-ZÁáÉéÍíÓóÚúÑñ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
  
  body('email')
    .trim()
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail()
    .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/).withMessage('Solo se permiten correos de Gmail'),
  
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  handleValidationErrors
];

// Validaciones para login
const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
  
  handleValidationErrors
];

// Validaciones para producto
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre del producto es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('price')
    .isNumeric().withMessage('El precio debe ser un número')
    .isFloat({ min: 0 }).withMessage('El precio no puede ser negativo'),
  
  body('stock')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero no negativo'),
  
  body('category')
    .isIn(['vino', 'champagne', 'espumante', 'licor', 'otro'])
    .withMessage('Categoría inválida'),
  
  body('subcategory')
    .optional()
    .isIn(['tinto', 'blanco', 'rosado', 'reserva', 'gran reserva', 'premium'])
    .withMessage('Subcategoría inválida'),
  
  handleValidationErrors
];

// Validaciones para pedido
const validateOrder = [
  body('productId')
    .isMongoId().withMessage('ID de producto inválido'),
  
  body('quantity')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  
  handleValidationErrors
];

// Validaciones para actualización de estado de pedido
const validateOrderStatus = [
  body('status')
    .isIn(['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado'])
    .withMessage('Estado de pedido inválido'),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateOrder,
  validateOrderStatus
};