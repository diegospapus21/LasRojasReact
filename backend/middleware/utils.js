const jwt = require('jsonwebtoken');

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Verificar token JWT
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Formatear respuesta de éxito
const sendSuccess = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Formatear respuesta de error
const sendError = (res, message, statusCode = 500, error = null) => {
  const response = {
    success: false,
    message
  };

  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message;
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

// Manejar errores de Mongoose
const handleMongooseError = (error) => {
  if (error.code === 11000) {
    // Error de duplicado
    const field = Object.keys(error.keyValue)[0];
    return `El ${field} ya existe`;
  }

  if (error.name === 'ValidationError') {
    // Error de validación
    const messages = Object.values(error.errors).map(err => err.message);
    return messages.join(', ');
  }

  if (error.name === 'CastError') {
    // Error de casting (ID inválido)
    return 'ID inválido';
  }

  return error.message;
};

// Paginación
const getPaginationData = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / pageSize);
  const skip = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageSize,
    totalPages,
    total,
    skip,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

// Formatear respuesta paginada
const sendPaginatedResponse = (res, data, pagination, message = 'Datos obtenidos') => {
  res.json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize,
      totalPages: pagination.totalPages,
      totalItems: pagination.total,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage
    }
  });
};

module.exports = {
  generateToken,
  verifyToken,
  sendSuccess,
  sendError,
  handleMongooseError,
  getPaginationData,
  sendPaginatedResponse
};