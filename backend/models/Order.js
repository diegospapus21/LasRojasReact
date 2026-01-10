const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El ID del usuario es requerido']
    },
    name: {
      type: String,
      required: [true, 'El nombre del usuario es requerido']
    },
    email: {
      type: String,
      required: [true, 'El email del usuario es requerido']
    }
  },
  product: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'El ID del producto es requerido']
    },
    name: {
      type: String,
      required: [true, 'El nombre del producto es requerido']
    },
    price: {
      type: Number,
      required: [true, 'El precio del producto es requerido']
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1'],
    default: 1
  },
  totalPrice: {
    type: Number,
    required: [true, 'El precio total es requerido'],
    get: function(value) {
      return parseFloat(value.toFixed(2));
    }
  },
  status: {
    type: String,
    enum: ['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado'],
    default: 'Pendiente'
  },
  paymentMethod: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'paypal'],
    default: 'efectivo'
  },
  paymentStatus: {
    type: String,
    enum: ['pendiente', 'pagado', 'reembolsado'],
    default: 'pendiente'
  },
  shippingAddress: {
    street: String,
    city: String,
    department: String,
    zipCode: String,
    phone: String
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  },
  trackingNumber: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Índices para optimización
orderSchema.index({ 'user.id': 1, orderDate: -1 });
orderSchema.index({ 'product.id': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ paymentStatus: 1 });

// Middleware para calcular precio total
orderSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('product.price')) {
    this.totalPrice = this.quantity * this.product.price;
  }
  next();
});

// Método para actualizar estado
orderSchema.methods.updateStatus = async function(newStatus) {
  const validTransitions = {
    'Pendiente': ['Confirmado', 'Cancelado'],
    'Confirmado': ['Enviado', 'Cancelado'],
    'Enviado': ['Entregado'],
    'Entregado': [],
    'Cancelado': []
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Transición inválida de ${this.status} a ${newStatus}`);
  }

  this.status = newStatus;
  
  if (newStatus === 'Enviado') {
    this.deliveryDate = new Date();
    this.deliveryDate.setDate(this.deliveryDate.getDate() + 3); // 3 días de entrega
  }

  return await this.save();
};

module.exports = mongoose.model('Order', orderSchema);