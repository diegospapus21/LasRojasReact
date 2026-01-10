const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { validateOrder, validateOrderStatus } = require('../middleware/validation');
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} = require('../controllers/orderController');

const router = express.Router();

// Crear pedido (requiere autenticación)
router.post('/', auth, validateOrder, createOrder);

// Obtener pedidos del usuario actual (requiere autenticación)
router.get('/my-orders', auth, getUserOrders);

// Obtener todos los pedidos (solo admin)
router.get('/', auth, authorize('admin'), getAllOrders);

// Obtener estadísticas de pedidos (solo admin)
router.get('/stats', auth, authorize('admin'), getOrderStats);

// Obtener pedido por ID (requiere autenticación)
router.get('/:id', auth, getOrderById);

// Actualizar estado del pedido (solo admin)
router.put('/:id/status', auth, authorize('admin'), validateOrderStatus, updateOrderStatus);

// Cancelar pedido (requiere autenticación)
router.put('/:id/cancel', auth, cancelOrder);

module.exports = router;