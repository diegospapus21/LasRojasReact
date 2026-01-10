const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de autenticación
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acceso denegado. Se requiere token de autenticación.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener usuario completo
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido o usuario inactivo.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido.' 
    });
  }
};

// Middleware de autorización por rol
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Permisos insuficientes.' 
      });
    }
    next();
  };
};

// Middleware opcional (no requiere token, pero lo usa si está disponible)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Si el token es inválido, continuamos sin usuario
    next();
  }
};

module.exports = {
  auth,
  authorize,
  optionalAuth
};