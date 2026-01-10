const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { sendSuccess, sendError, handleMongooseError } = require('../middleware/utils');

// Obtener carrito del usuario
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price image stock isActive');

    if (!cart) {
      // Crear carrito si no existe
      cart = new Cart({ user: req.user.id });
      await cart.save();
    }

    // Filtrar productos inactivos o sin stock
    cart.items = cart.items.filter(item => 
      item.product && 
      item.product.isActive && 
      item.product.stock > 0
    );

    await cart.save();

    sendSuccess(res, { cart }, 'Carrito obtenido exitosamente');

  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Agregar producto al carrito
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Verificar producto
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return sendError(res, 'Producto no encontrado', 404);
    }

    // Verificar stock
    if (product.stock < quantity) {
      return sendError(res, `Stock insuficiente. Disponible: ${product.stock}`, 400);
    }

    // Obtener o crear carrito
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({ user: req.user.id });
    }

    // Agregar item al carrito
    await cart.addItem(productId, quantity, product.price);

    // Obtener carrito actualizado
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price image stock');

    sendSuccess(res, { cart: updatedCart }, 'Producto agregado al carrito exitosamente');

  } catch (error) {
    console.error('Error agregando al carrito:', error);
    sendError(res, handleMongooseError(error), 500);
  }
};

// Actualizar cantidad de un item en el carrito
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Obtener carrito
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');

    if (!cart) {
      return sendError(res, 'Carrito no encontrado', 404);
    }

    // Encontrar el item
    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
      return sendError(res, 'Item no encontrado en el carrito', 404);
    }

    // Verificar stock
    if (quantity > cartItem.product.stock) {
      return sendError(res, `Stock insuficiente. Disponible: ${cartItem.product.stock}`, 400);
    }

    // Actualizar cantidad
    await cart.updateQuantity(cartItem.product._id, quantity);

    // Obtener carrito actualizado
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price image stock');

    sendSuccess(res, { cart: updatedCart }, 'Carrito actualizado exitosamente');

  } catch (error) {
    console.error('Error actualizando carrito:', error);
    sendError(res, handleMongooseError(error), 500);
  }
};

// Eliminar item del carrito
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Obtener carrito
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return sendError(res, 'Carrito no encontrado', 404);
    }

    // Encontrar el item
    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
      return sendError(res, 'Item no encontrado en el carrito', 404);
    }

    // Remover item
    await cart.removeItem(cartItem.product._id);

    // Obtener carrito actualizado
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price image stock');

    sendSuccess(res, { cart: updatedCart }, 'Item eliminado del carrito exitosamente');

  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Vaciar carrito
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return sendError(res, 'Carrito no encontrado', 404);
    }

    await cart.clearCart();

    sendSuccess(res, { cart }, 'Carrito vaciado exitosamente');

  } catch (error) {
    console.error('Error vaciando carrito:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

// Convertir carrito en pedido
const checkout = async (req, res) => {
  try {
    const { shippingAddress, notes } = req.body;

    // Obtener carrito
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return sendError(res, 'El carrito está vacío', 400);
    }

    // Verificar stock de todos los productos
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return sendError(res, `Stock insuficiente para ${item.product.name}. Disponible: ${item.product.stock}`, 400);
      }
    }

    const Order = require('./orderController'); // Importar dinámicamente para evitar dependencia circular
    const createdOrders = [];

    // Crear un pedido por cada item del carrito
    for (const item of cart.items) {
      try {
        const order = new Order({
          user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
          },
          product: {
            id: item.product._id,
            name: item.product.name,
            price: item.price
          },
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          shippingAddress,
          notes: notes ? `${notes}\n\nItem: ${item.product.name} (${item.quantity} unidades)` : `Item: ${item.product.name} (${item.quantity} unidades)`
        });

        await order.save();

        // Reducir stock del producto
        await item.product.reduceStock(item.quantity);

        createdOrders.push(order);
      } catch (error) {
        console.error('Error creando orden para item:', item.product.name, error);
        // Continuar con otros items
      }
    }

    if (createdOrders.length === 0) {
      return sendError(res, 'No se pudieron crear los pedidos', 500);
    }

    // Vaciar carrito
    await cart.clearCart();

    sendSuccess(res, { 
      orders: createdOrders,
      totalOrders: createdOrders.length
    }, 'Pedidos creados exitosamente desde el carrito');

  } catch (error) {
    console.error('Error en checkout:', error);
    sendError(res, 'Error en el servidor', 500);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout
};