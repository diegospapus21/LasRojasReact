import { useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';

export const useCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener carrito
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cartAPI.getCart();
      setCart(response.data.cart);
    } catch (error) {
      console.error('Error obteniendo carrito:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar carrito al montar
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Agregar producto al carrito
  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      await cartAPI.addToCart({ productId, quantity });
      
      // Refrescar carrito
      await fetchCart();
      
      return { success: true };
    } catch (error) {
      const message = error.data?.message || 'Error al agregar al carrito';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Actualizar cantidad de un item
  const updateQuantity = useCallback(async (itemId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      await cartAPI.updateCartItem(itemId, { quantity });
      
      // Refrescar carrito
      await fetchCart();
      
      return { success: true };
    } catch (error) {
      const message = error.data?.message || 'Error al actualizar cantidad';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Eliminar item del carrito
  const removeFromCart = useCallback(async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      
      await cartAPI.removeFromCart(itemId);
      
      // Refrescar carrito
      await fetchCart();
      
      return { success: true };
    } catch (error) {
      const message = error.data?.message || 'Error al eliminar del carrito';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Vaciar carrito
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await cartAPI.clearCart();
      
      // Refrescar carrito
      await fetchCart();
      
      return { success: true };
    } catch (error) {
      const message = error.data?.message || 'Error al vaciar carrito';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Checkout
  const checkout = useCallback(async (checkoutData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cartAPI.checkout(checkoutData);
      
      // Refrescar carrito (debería estar vacío)
      await fetchCart();
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      const message = error.data?.message || 'Error al procesar el pedido';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Calcular totales
  const getTotalItems = useCallback(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getTotalAmount = useCallback(() => {
    if (!cart?.items) return 0;
    return cart.totalAmount || 0;
  }, [cart]);

  return {
    cart,
    loading,
    error,
    totalItems: getTotalItems(),
    totalAmount: getTotalAmount(),
    isEmpty: !cart?.items?.length,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout
  };
};