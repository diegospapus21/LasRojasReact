const User = require('../models/User');
const { generateToken, sendSuccess, sendError, handleMongooseError } = require('../middleware/utils');

// Registro de usuario
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'El email ya está registrado', 400);
    }

    // Determinar rol automáticamente
    const role = email === 'diegoghc7002@gmail.com' ? 'admin' : 'client';

    // Crear usuario
    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    // Generar token
    const token = generateToken(user._id);

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }, 'Usuario registrado exitosamente', 201);

  } catch (error) {
    console.error('Error en registro:', error);
    sendError(res, handleMongooseError(error), 400);
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario con contraseña
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return sendError(res, 'Credenciales incorrectas', 401);
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Credenciales incorrectas', 401);
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return sendError(res, 'Cuenta desactivada', 401);
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Generar token
    const token = generateToken(user._id);

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }, 'Login exitoso');

  } catch (error) {
    console.error('Error en login:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Obtener perfil de usuario
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return sendError(res, 'Usuario no encontrado', 404);
    }

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    }, 'Perfil obtenido exitosamente');

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Actualizar perfil
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendError(res, 'Usuario no encontrado', 404);
    }

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, 'Perfil actualizado exitosamente');

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    sendError(res, handleMongooseError(error), 400);
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Obtener usuario con contraseña
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return sendError(res, 'Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Contraseña actual incorrecta', 400);
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    sendSuccess(res, null, 'Contraseña actualizada exitosamente');

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    sendError(res, handleMongooseError(error), 400);
  }
};

// Verificar token
const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.isActive) {
      return sendError(res, 'Token inválido', 401);
    }

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, 'Token válido');

  } catch (error) {
    console.error('Error verificando token:', error);
    sendError(res, 'Token inválido', 401);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken
};