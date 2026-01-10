const express = require('express');
const { auth } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin
} = require('../middleware/validation');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken
} = require('../controllers/authController');

const router = express.Router();

// Registro
router.post('/register', validateRegister, register);

// Login
router.post('/login', validateLogin, login);

// Verificar token
router.get('/verify', auth, verifyToken);

// Obtener perfil (requiere autenticación)
router.get('/profile', auth, getProfile);

// Actualizar perfil (requiere autenticación)
router.put('/profile', auth, updateProfile);

// Cambiar contraseña (requiere autenticación)
router.put('/change-password', auth, changePassword);

module.exports = router;