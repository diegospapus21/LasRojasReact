const Order = require('../models/Order');
const Product = require('../models/Product');
const { 
  sendSuccess, 
  sendError, 
  handleMongooseError, 
  getPaginationData,
  sendPaginatedResponse 
} = require('../middleware/utils');

// Crear pedido
const createOrder = async (req, res) => {
  try {
    const { productId, quantity = 1, shippingAddress, notes } = req.body;

    // Verificar producto
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return sendError(res, 'Producto no encontrado', 404);
    }

    // Verificar stock
    if (product.stock < quantity) {
      return sendError(res, `Stock insuficiente. Disponible: ${product.stock}`, 400);
    }

    // Calcular precio total
    const totalPrice = product.price * quantity;

    // Crear pedido
    const order = new Order({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      },
      product: {
        id: product._id,
        name: product.name,
        price: product.price
      },
      quantity,
      totalPrice,
      shippingAddress,
      notes
    });

    // Reducir stock del producto
    await product.reduceStock(quantity);

    await order.save();

    sendSuccess(res, { order }, 'Pedido creado exitosamente', 201);

  } catch (error) {
    console.error('Error creando pedido:', error);
    sendError(res, handleMongooseError(error), 500);
  }
};

// Obtener pedidos del usuario actual
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Construir filtro
    const filter = { 'user.id': req.user.id };
    
    if (status) {
      filter.status = status;
    }

    // Paginación
    const pagination = getPaginationData(page, limit, await Order.countDocuments(filter));

    const orders = await Order
      .find(filter)
      .sort({ orderDate: -1 })
      .skip(pagination.skip)
      .limit(pagination.pageSize);

    sendPaginatedResponse(res, orders, pagination, 'Pedidos obtenidos exitosamente');

  } catch (error) {
    console.error('Error obteniendo pedidos del usuario:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Obtener todos los pedidos (solo admin)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userEmail, productName } = req.query;

    // Construir filtro
    const filter = {};
    
    if (status) filter.status = status;
    if (userEmail) filter['user.email'] = new RegExp(userEmail, 'i');
    if (productName) filter['product.name'] = new RegExp(productName, 'i');

    // Paginación
    const pagination = getPaginationData(page, limit, await Order.countDocuments(filter));

    const orders = await Order
      .find(filter)
      .sort({ orderDate: -1 })
      .skip(pagination.skip)
      .limit(pagination.pageSize);

    sendPaginatedResponse(res, orders, pagination, 'Pedidos obtenidos exitosamente');

  } catch (error) {
    console.error('Error obteniendo todos los pedidos:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Obtener pedido por ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }

    // Verificar permisos (solo el dueño o admin)
    if (req.user.role !== 'admin' && order.user.id.toString() !== req.user.id) {
      return sendError(res, 'Acceso denegado', 403);
    }

    sendSuccess(res, { order }, 'Pedido obtenido exitosamente');

  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Actualizar estado del pedido (solo admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }

    sendSuccess(res, { order }, 'Estado del pedido actualizado exitosamente');

  } catch (error) {
    console.error('Error actualizando estado del pedido:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Cancelar pedido (usuario o admin)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendError(res, 'Pedido no encontrado', 404);
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && order.user.id.toString() !== req.user.id) {
      return sendError(res, 'Acceso denegado', 403);
    }

    // Verificar si se puede cancelar
    if (!['Pendiente', 'Confirmado'].includes(order.status)) {
      return sendError(res, 'Este pedido ya no puede ser cancelado', 400);
    }

    // Actualizar estado
    order.status = 'Cancelado';

    // Devolver stock al producto
    const product = await Product.findById(order.product.id);
    if (product) {
      await product.increaseStock(order.quantity);
    }

    await order.save();

    sendSuccess(res, { order }, 'Pedido cancelado exitosamente');

  } catch (error) {
    console.error('Error cancelando pedido:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Obtener estadísticas de pedidos (solo admin)
const getOrderStats = async (req, res) => {
  try {
    // Estadísticas generales
    const generalStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Pendiente'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Confirmado'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Entregado'] }, 1, 0] }
          }
        }
      }
    ]);

    // Pedidos por mes
    const monthlyStats = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Productos más vendidos
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelado' } } },
      {
        $group: {
          _id: '$product.id',
          productName: { $first: '$product.name' },
          totalSold: { $sum: '$quantity' },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    const stats = generalStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      deliveredOrders: 0
    };

    stats.monthlyStats = monthlyStats;
    stats.topProducts = topProducts;

    sendSuccess(res, { stats }, 'Estadísticas de pedidos obtenidas exitosamente');

  } catch (error) {
    console.error('Error obteniendo estadísticas de pedidos:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
};