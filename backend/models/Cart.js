const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser al menos 1'],
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalAmount: {
    type: Number,
    default: 0,
    get: function(value) {
      return parseFloat(value.toFixed(2));
    }
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Índices
cartSchema.index({ user: 1 });

// Middleware para calcular total
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

// Método para agregar item
cartSchema.methods.addItem = async function(productId, quantity, price) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      price
    });
  }

  return await this.save();
};

// Método para remover item
cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item => 
    item.product.toString() !== productId.toString()
  );
  return await this.save();
};

// Método para actualizar cantidad
cartSchema.methods.updateQuantity = async function(productId, quantity) {
  if (quantity <= 0) {
    return await this.removeItem(productId);
  }

  const item = this.items.find(item => 
    item.product.toString() === productId.toString()
  );

  if (item) {
    item.quantity = quantity;
    return await this.save();
  }

  throw new Error('Item no encontrado en el carrito');
};

// Método para vaciar carrito
cartSchema.methods.clearCart = async function() {
  this.items = [];
  return await this.save();
};

module.exports = mongoose.model('Cart', cartSchema);