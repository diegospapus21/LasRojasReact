const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Nuevos productos de perfumes y toallas
const initialUsers = [
  {
    name: 'Administrador',
    email: 'diegoghc7002@gmail.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Juan Pérez',
    email: 'juan.perez@gmail.com',
    password: 'cliente123',
    role: 'client'
  },
  {
    name: 'María García',
    email: 'maria.garcia@gmail.com',
    password: 'cliente456',
    role: 'client'
  }
];

const initialProducts = [
  // PERFUMES
  {
    name: 'Chanel N°5 Eau de Parfum',
    description: 'El perfume icónico de Chanel. Notas florales con ylang-ylang, jasmine y rosa, en una base de sándalo y vainilla. Un clásico atemporal.',
    price: 185.99,
    stock: 15,
    image: '/images/perfume-chanel.jpg',
    category: 'perfume',
    subcategory: 'femenino',
    tags: ['clasico', 'floral', 'premium', ' Chanel']
  },
  {
    name: 'Dior Sauvage Eau de Toilette',
    description: 'Frescura atrevida con notas de bergamota y pimienta. Perfecto para el hombre moderno que busca elegancia con carácter.',
    price: 125.50,
    stock: 25,
    image: '/images/perfume-dior.jpg',
    category: 'perfume',
    subcategory: 'masculino',
    tags: ['fresco', 'citrico', 'moderno', ' Dior']
  },
  {
    name: 'Tom Ford Black Orchid',
    description: 'Lujoso y misterioso con notas de trufa negra, orchídea negra y especias. Un perfume exclusivo para ocasiones especiales.',
    price: 245.00,
    stock: 10,
    image: '/images/perfume-tomford.jpg',
    category: 'perfume',
    subcategory: 'unisex',
    tags: ['lujo', 'oriental', 'exclusivo', ' Tom Ford']
  },
  {
    name: 'Viktor&Rolf Flowerbomb',
    description: 'Explosión floral con rosa, orquídea y jazmín. Envuelto en notas de almizcle para un final dulce y duradero.',
    price: 165.75,
    stock: 20,
    image: '/images/perfume-flowerbomb.jpg',
    category: 'perfume',
    subcategory: 'femenino',
    tags: ['floral', 'dulce', 'romántico', ' Viktor&Rolf']
  },
  
  // TOALLAS DE BAÑO
  {
    name: 'Toalla de Baño Premium Algodón Egipcio',
    description: 'Toalla de 100% algodón egipcio de 700 GSM. Extremadamente suave y absorbente. Tamaño: 70x140 cm. Disponible en blanco, gris y beige.',
    price: 45.99,
    stock: 50,
    image: '/images/toalla-premium.jpg',
    category: 'toalla',
    subcategory: 'baño',
    tags: ['algodon', 'premium', 'absorbente', 'lujo']
  },
  {
    name: 'Juego de Toallas Spa 4 Piezas',
    description: 'Juego completo incluye: 2 toallas de baño (70x140cm), 2 toallas de mano (50x100cm). Tejido microfibra antibacterial. Secado rápido.',
    price: 89.99,
    stock: 30,
    image: '/images/toalla-spa.jpg',
    category: 'toalla',
    subcategory: 'juego',
    tags: ['conjunto', 'microfibra', 'antibacterial', 'spa']
  },
  {
    name: 'Toalla Playa XL Gran Absorción',
    description: 'Toalla de playa gigante (100x180cm) con diseño exclusivo. Ultra absorbente y de secado rápido. Incluye bolso de transporte.',
    price: 35.50,
    stock: 40,
    image: '/images/toalla-playa.jpg',
    category: 'toalla',
    subcategory: 'playa',
    tags: ['grande', 'playa', 'absorbente', 'diseño']
  },
  {
    name: 'Toalla Yoga Mat Fitness',
    description: 'Toalla especial para yoga y fitness. Material antideslizante y absorbente. Tamaño estándar 61x183cm. Fácil limpieza.',
    price: 28.75,
    stock: 35,
    image: '/images/toalla-yoga.jpg',
    category: 'toalla',
    subcategory: 'fitness',
    tags: ['yoga', 'fitness', 'antideslizante', 'deportivo']
  },
  {
    name: 'Toalla de Mano Lujo Rayón Bambú',
    description: 'Set de 4 toallas de mano de rayón de bambú. Naturalmente antibacterial y ecológico. Súper suave al tacto. 40x70cm cada una.',
    price: 55.00,
    stock: 25,
    image: '/images/toalla-bambu.jpg',
    category: 'toalla',
    subcategory: 'mano',
    tags: ['bambu', 'ecologico', 'suave', 'antibacterial']
  },
  {
    name: 'Toalla Corporal Turkish Cotton',
    description: 'Toalla corporal tradicional turca de 550 GSM. Tejido especial que mejora con cada lavado. Secado rápido y duradero.',
    price: 32.00,
    stock: 45,
    image: '/images/toalla-turkish.jpg',
    category: 'toalla',
    subcategory: 'corporal',
    tags: ['turco', 'durable', 'clasico', 'absorbente']
  }
];

// Conexión a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Limpiar base de datos
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️ Base de datos limpiada');
  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error);
  }
};

// Insertar datos iniciales
const seedDatabase = async () => {
  try {
    // Insertar usuarios
    console.log('📝 Creando usuarios...');
    for (const userData of initialUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Usuario creado: ${userData.email}`);
    }

    // Insertar productos
    console.log('📦 Creando productos de perfumes y toallas...');
    for (const productData of initialProducts) {
      const product = new Product(productData);
      await product.save();
      console.log(`✅ Producto creado: ${productData.name}`);
    }

    // Crear algunos pedidos de ejemplo
    console.log('🛒 Creando pedidos de ejemplo...');
    const users = await User.find({ role: 'client' });
    const products = await Product.find();

    if (users.length > 0 && products.length > 0) {
      const exampleOrders = [
        {
          user: {
            id: users[0]._id,
            name: users[0].name,
            email: users[0].email
          },
          product: {
            id: products[0]._id,
            name: products[0].name,
            price: products[0].price
          },
          quantity: 1,
          totalPrice: products[0].price,
          status: 'Entregado'
        },
        {
          user: {
            id: users[1]._id,
            name: users[1].name,
            email: users[1].email
          },
          product: {
            id: products[1]._id,
            name: products[1].name,
            price: products[1].price
          },
          quantity: 2,
          totalPrice: products[1].price * 2,
          status: 'Pendiente'
        }
      ];

      for (const orderData of exampleOrders) {
        const order = new Order(orderData);
        await order.save();
        console.log(`✅ Pedido creado para ${orderData.user.name}`);
      }
    }

    console.log('\n🎉 Base de datos poblada exitosamente');
    console.log('\n📋 Resumen:');
    console.log(`   - Usuarios: ${await User.countDocuments()}`);
    console.log(`   - Productos: ${await Product.countDocuments()}`);
    console.log(`   - Pedidos: ${await Order.countDocuments()}`);
    console.log('\n🔐 Credenciales de prueba:');
    console.log('   Admin: diegoghc7002@gmail.com / admin123');
    console.log('   Cliente 1: juan.perez@gmail.com / cliente123');
    console.log('   Cliente 2: maria.garcia@gmail.com / cliente456');
    console.log('\n🛍️ Nuevos productos disponibles:');
    console.log('   🌸 Perfumes: Chanel, Dior, Tom Ford, Viktor&Rolf');
    console.log('   🏖️ Toallas: Premium, Spa, Playa, Yoga, Bambú, Turkish');

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  }
};

// Función principal
const main = async () => {
  console.log('🌟 Iniciando seed de Las Rojas - Perfumes y Toallas...');
  
  await connectDB();
  
  // Verificar si se quiere limpiar primero
  if (process.argv.includes('--clear')) {
    await clearDatabase();
  }
  
  await seedDatabase();
  
  await mongoose.disconnect();
  console.log('\n👋 Desconectado de MongoDB. Proceso completado.');
  process.exit(0);
};

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = { seedDatabase, clearDatabase };