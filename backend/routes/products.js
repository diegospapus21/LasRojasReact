const express = require('express');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductStats,
  updateStock
} = require('../controllers/productController');

const router = express.Router();

// Obtener todos los productos (público)
router.get('/', optionalAuth, getProducts);

// Obtener un producto por ID (público)
router.get('/:id', optionalAuth, getProductById);

// Crear producto (solo admin)
router.post('/', auth, authorize('admin'), validateProduct, createProduct);

// Actualizar producto (solo admin)
router.put('/:id', auth, authorize('admin'), validateProduct, updateProduct);

// Eliminar producto (solo admin)
router.delete('/:id', auth, authorize('admin'), deleteProduct);

// Obtener productos con bajo stock (solo admin)
router.get('/admin/low-stock', auth, authorize('admin'), getLowStockProducts);

// Obtener estadísticas de productos (solo admin)
router.get('/admin/stats', auth, authorize('admin'), getProductStats);

// Actualizar stock de producto (solo admin)
router.put('/:id/stock', auth, authorize('admin'), updateStock);

module.exports = router;