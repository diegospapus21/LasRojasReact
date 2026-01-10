const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    
    // Crear índices para mejor rendimiento
    await createIndexes();
    
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Índices para usuarios
    await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.collection('users').createIndex({ role: 1 });
    
    // Índices para productos
    await mongoose.connection.collection('products').createIndex({ name: 1 });
    await mongoose.connection.collection('products').createIndex({ category: 1 });
    await mongoose.connection.collection('products').createIndex({ isActive: 1 });
    
    // Índices para pedidos
    await mongoose.connection.collection('orders').createIndex({ "user.id": 1 });
    await mongoose.connection.collection('orders').createIndex({ "product.id": 1 });
    await mongoose.connection.collection('orders').createIndex({ status: 1 });
    await mongoose.connection.collection('orders').createIndex({ orderDate: -1 });
    
    console.log('✅ Índices de base de datos creados exitosamente');
  } catch (error) {
    console.error('❌ Error creando índices:', error.message);
  }
};

module.exports = connectDB;