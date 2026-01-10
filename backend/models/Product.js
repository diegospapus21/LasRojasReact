const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo'],
    get: function(value) {
      return parseFloat(value.toFixed(2));
    }
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  image: {
    type: String,
    default: '🍷'
  },
  category: {
    type: String,
    enum: ['vino', 'champagne', 'espumante', 'licor', 'otro'],
    default: 'vino'
  },
  subcategory: {
    type: String,
    enum: ['tinto', 'blanco', 'rosado', 'reserva', 'gran reserva', 'premium'],
    default: 'tinto'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Índices para búsqueda
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

// Método para reducir stock
productSchema.methods.reduceStock = async function(quantity) {
  if (this.stock < quantity) {
    throw new Error('Stock insuficiente');
  }
  this.stock -= quantity;
  return await this.save();
};

// Método para aumentar stock
productSchema.methods.increaseStock = async function(quantity) {
  this.stock += quantity;
  return await this.save();
};

module.exports = mongoose.model('Product', productSchema);