const express = require('express');
const { auth } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout
} = require('../controllers/cartController');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Obtener carrito del usuario
router.get('/', getCart);

// Agregar producto al carrito
router.post('/add', addToCart);

// Actualizar cantidad de un item
router.put('/items/:itemId', updateCartItem);

// Eliminar item del carrito
router.delete('/items/:itemId', removeFromCart);

// Vaciar carrito
router.delete('/clear', clearCart);

// Convertir carrito en pedidos (checkout)
router.post('/checkout', checkout);

module.exports = router;