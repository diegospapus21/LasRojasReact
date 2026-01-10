import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

// Hook personalizado para manejar autenticación
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar token al montar el componente
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Para modo mock, intentar verificar el token
          const response = await authAPI.verifyToken();
          setUser(response.data.user);
        } catch (error) {
          console.error('Token inválido:', error);
          // Para modo mock, si falla la verificación, usar el usuario guardado directamente
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
          } catch (parseError) {
            // Limpiar datos inválidos
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.login({ email, password });
      const { user: userData, token } = response.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.data?.message || 'Error al iniciar sesión';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Registro
  const register = useCallback(async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.register({ name, email, password });
      const { user: userData, token } = response.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.data?.message || 'Error al registrarse';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  }, []);

  // Actualizar perfil
  const updateProfile = useCallback(async (profileData) => {
    try {
      setError(null);
      
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;

      // Actualizar localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      const message = error.data?.message || 'Error al actualizar perfil';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Cambiar contraseña
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setError(null);
      
      await authAPI.changePassword({ currentPassword, newPassword });
      
      return { success: true };
    } catch (error) {
      const message = error.data?.message || 'Error al cambiar contraseña';
      setError(message);
      return { success: false, message };
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client',
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };
};