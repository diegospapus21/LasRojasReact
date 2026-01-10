const Product = require('../models/Product');
const { 
  sendSuccess, 
  sendError, 
  handleMongooseError, 
  getPaginationData,
  sendPaginatedResponse 
} = require('../middleware/utils');

// Obtener todos los productos (con paginación y filtros)
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      subcategory,
      minPrice,
      maxPrice,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      inStock = 'true'
    } = req.query;

    // Construir filtro
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    
    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Filtro de precio
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Búsqueda de texto
    if (search) {
      filter.$text = { $search: search };
    }

    // Opciones de ordenamiento
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Paginación
    const pagination = getPaginationData(page, limit, await Product.countDocuments(filter));

    const products = await Product
      .find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .populate('category subcategory');

    sendPaginatedResponse(res, products, pagination, 'Productos obtenidos exitosamente');

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!product) {
      return sendError(res, 'Producto no encontrado', 404);
    }

    sendSuccess(res, { product }, 'Producto obtenido exitosamente');

  } catch (error) {
    console.error('Error obteniendo producto:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Crear producto (solo admin)
const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      image: req.body.image || '🍷'
    };

    const product = new Product(productData);
    await product.save();

    sendSuccess(res, { product }, 'Producto creado exitosamente', 201);

  } catch (error) {
    console.error('Error creando producto:', error);
    sendError(res, handleMongooseError(error), 400);
  }
};

// Actualizar producto (solo admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return sendError(res, 'Producto no encontrado', 404);
    }

    sendSuccess(res, { product }, 'Producto actualizado exitosamente');

  } catch (error) {
    console.error('Error actualizando producto:', error);
    sendError(res, handleMongooseError(error), 400);
  }
};

// Eliminar producto (desactivar, solo admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return sendError(res, 'Producto no encontrado', 404);
    }

    sendSuccess(res, null, 'Producto eliminado exitosamente');

  } catch (error) {
    console.error('Error eliminando producto:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Obtener productos con bajo stock (solo admin)
const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const products = await Product.find({
      isActive: true,
      stock: { $lte: parseInt(threshold) }
    }).sort({ stock: 1 });

    sendSuccess(res, { products }, 'Productos con bajo stock obtenidos exitosamente');

  } catch (error) {
    console.error('Error obteniendo productos con bajo stock:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Obtener estadísticas de productos (solo admin)
const getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          averagePrice: { $avg: '$price' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    const result = stats[0] || {
      totalProducts: 0,
      totalStock: 0,
      averagePrice: 0,
      categories: []
    };

    result.categoryBreakdown = categoryStats;

    sendSuccess(res, { stats: result }, 'Estadísticas de productos obtenidas exitosamente');

  } catch (error) {
    console.error('Error obteniendo estadísticas de productos:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Actualizar stock de producto (solo admin)
const updateStock = async (req, res) => {
  try {
    const { quantity, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return sendError(res, 'Producto no encontrado', 404);
    }

    switch (operation) {
      case 'add':
        product.stock += quantity;
        break;
      case 'subtract':
        product.stock = Math.max(0, product.stock - quantity);
        break;
      case 'set':
      default:
        product.stock = quantity;
        break;
    }

    await product.save();

    sendSuccess(res, { product }, 'Stock actualizado exitosamente');

  } catch (error) {
    console.error('Error actualizando stock:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductStats,
  updateStock
};