// Cargar productos desde localStorage o usar datos por defecto
const getStoredProducts = () => {
  const stored = localStorage.getItem('mockProducts');
  if (stored) {
    return JSON.parse(stored);
  }
  
  const defaultProducts = [
    {
      _id: '1',
      name: 'Bandidos for Men',
      description: 'Perfume masculino con notas audaces y persistentes',
      price: 45.99,
      stock: 50,
      category: 'perfume-masculino',
      image: '👨'
    },
    {
      _id: '2',
      name: 'Platinum Force',
      description: 'Fragancia masculina elegante y sofisticada',
      price: 32.50,
      stock: 30,
      category: 'perfume-masculino',
      image: '⚡'
    },
    {
      _id: '3',
      name: 'Motion Mens Fragance Kit',
      description: 'Kit de fragancias masculinas versátiles para toda ocasión',
      price: 89.99,
      stock: 15,
      category: 'perfume-masculino',
      image: '🎁'
    },
    {
      _id: '4',
      name: 'Sweet Chic',
      description: 'Perfume femenino dulce y encantador',
      price: 28.75,
      stock: 25,
      category: 'perfume-femenino',
      image: '👩'
    },
    {
      _id: '5',
      name: 'Nouri de Nult LBEL',
      description: 'Fragancia femenina nutritiva y elegante',
      price: 35.00,
      stock: 40,
      category: 'perfume-femenino',
      image: '💎'
    },
    {
      _id: '6',
      name: 'Florella Rose',
      description: 'Perfume femenino con notas florales delicadas',
      price: 42.00,
      stock: 20,
      category: 'perfume-femenino',
      image: '🌹'
    }
  ];
  
  localStorage.setItem('mockProducts', JSON.stringify(defaultProducts));
  return defaultProducts;
};

const mockProducts = getStoredProducts();

// Cargar órdenes desde localStorage
const getStoredOrders = () => {
  const stored = localStorage.getItem('mockOrders');
  return stored ? JSON.parse(stored) : [];
};

let mockOrders = getStoredOrders();

// Cargar carrito desde localStorage
const getStoredCart = () => {
  const stored = localStorage.getItem('mockCart');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    items: [],
    totalAmount: 0
  };
};

let mockCart = getStoredCart();

// Simular delay de red
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Sistema de almacenamiento de usuarios
const getStoredUsers = () => {
  const stored = localStorage.getItem('mockUsers');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Usuario admin por defecto
  const defaultUsers = [
    {
      id: 'admin-1',
      name: 'Administrador',
      email: 'admin@lasrojas.com',
      password: 'admin123', // En producción esto debería estar hasheado
      role: 'admin'
    }
  ];
  
  localStorage.setItem('mockUsers', JSON.stringify(defaultUsers));
  return defaultUsers;
};

const saveUser = (user) => {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem('mockUsers', JSON.stringify(users));
  return user;
};

const findUserByEmail = (email) => {
  const users = getStoredUsers();
  return users.find(user => user.email === email);
};

// Métodos mock para auth
export const authAPI = {
  register: async (userData) => {
    await delay();
    
    // Verificar si el usuario ya existe
    const existingUser = findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }
    
    // Crear nuevo usuario
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email,
      password: userData.password, // En producción esto debería estar hasheado
      role: userData.email === 'admin@lasrojas.com' ? 'admin' : 'client',
      phone: '',
      address: ''
    };
    
    // Guardar usuario
    saveUser(user);
    
    // Crear token
    const token = 'mock-token-' + Math.random().toString(36).substr(2, 9);
    
    // Devolver usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user;
    return { data: { user: userWithoutPassword, token } };
  },
  
  login: async (credentials) => {
    await delay();
    
    // Buscar usuario por email
    const user = findUserByEmail(credentials.email);
    
    if (!user) {
      throw new Error('Email no encontrado');
    }
    
    // Verificar contraseña
    if (user.password !== credentials.password) {
      throw new Error('Contraseña incorrecta');
    }
    
    // Crear token
    const token = 'mock-token-' + Math.random().toString(36).substr(2, 9);
    
    // Devolver usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user;
    return { data: { user: userWithoutPassword, token } };
  },
  
  verifyToken: async () => {
    await delay();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      return { data: { user } };
    }
    throw new Error('Token inválido');
  },
  
  getProfile: async () => {
    await delay();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return { data: { user } };
  },
  
  updateProfile: async (userData) => {
    await delay();
    
    // Obtener usuario actual desde localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.id) {
      throw new Error('Usuario no encontrado');
    }
    
    // Actualizar usuario en la base de datos
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    // Actualizar datos (sin contraseña)
    const updatedUserData = { ...users[userIndex], ...userData };
    users[userIndex] = updatedUserData;
    localStorage.setItem('mockUsers', JSON.stringify(users));
    
    // Actualizar usuario en localStorage
    const { password, ...userWithoutPassword } = updatedUserData;
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    return { data: { user: userWithoutPassword } };
  },
  
  changePassword: async () => {
    await delay();
    return { data: { message: 'Contraseña actualizada exitosamente' } };
  }
};

// Métodos mock para productos
export const productsAPI = {
  getProducts: async (params = {}) => {
    await delay();
    let filteredProducts = [...mockProducts];
    
    if (params.search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(params.search.toLowerCase()) ||
        p.description.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    
    if (params.category) {
      filteredProducts = filteredProducts.filter(p => p.category === params.category);
    }
    
    if (params.sortBy) {
      filteredProducts.sort((a, b) => {
        if (params.sortOrder === 'desc') {
          return params.sortBy === 'price' ? b.price - a.price : 
                 params.sortBy === 'name' ? b.name.localeCompare(a.name) :
                 b.stock - a.stock;
        } else {
          return params.sortBy === 'price' ? a.price - b.price : 
                 params.sortBy === 'name' ? a.name.localeCompare(b.name) :
                 a.stock - b.stock;
        }
      });
    }
    
    return { data: filteredProducts };
  },
  
  getProductById: async (id) => {
    await delay();
    const product = mockProducts.find(p => p._id === id);
    if (!product) throw new Error('Producto no encontrado');
    return { data: product };
  },
  
  createProduct: async (productData) => {
    await delay();
    const newProduct = {
      _id: Math.random().toString(36).substr(2, 9),
      ...productData
    };
    mockProducts.push(newProduct);
    localStorage.setItem('mockProducts', JSON.stringify(mockProducts));
    return { data: newProduct };
  },
  
  updateProduct: async (id, productData) => {
    await delay();
    const index = mockProducts.findIndex(p => p._id === id);
    if (index === -1) throw new Error('Producto no encontrado');
    mockProducts[index] = { ...mockProducts[index], ...productData };
    localStorage.setItem('mockProducts', JSON.stringify(mockProducts));
    return { data: mockProducts[index] };
  },
  
  deleteProduct: async (id) => {
    await delay();
    const index = mockProducts.findIndex(p => p._id === id);
    if (index === -1) throw new Error('Producto no encontrado');
    mockProducts.splice(index, 1);
    localStorage.setItem('mockProducts', JSON.stringify(mockProducts));
    return { data: { message: 'Producto eliminado' } };
  },
  
  getLowStockProducts: async () => {
    await delay();
    const lowStock = mockProducts.filter(p => p.stock < 20);
    return { data: lowStock };
  },
  
  getProductStats: async () => {
    await delay();
    const stats = {
      totalProducts: mockProducts.length,
      totalStock: mockProducts.reduce((sum, p) => sum + p.stock, 0),
      lowStockProducts: mockProducts.filter(p => p.stock < 20).length,
      categories: {
        'perfume-masculino': mockProducts.filter(p => p.category === 'perfume-masculino').length,
        'perfume-femenino': mockProducts.filter(p => p.category === 'perfume-femenino').length
      }
    };
    return { data: { stats } };
  },
  
  updateStock: async (id, stockData) => {
    await delay();
    const product = mockProducts.find(p => p._id === id);
    if (!product) throw new Error('Producto no encontrado');
    product.stock = stockData.stock;
    localStorage.setItem('mockProducts', JSON.stringify(mockProducts));
    return { data: product };
  }
};

// Métodos mock para órdenes
export const ordersAPI = {
  createOrder: async (orderData) => {
    await delay();
    const newOrder = {
      _id: Math.random().toString(36).substr(2, 9),
      ...orderData,
      orderDate: new Date().toISOString(),
      status: 'Pendiente'
    };
    mockOrders.push(newOrder);
    localStorage.setItem('mockOrders', JSON.stringify(mockOrders));
    return { data: newOrder };
  },
  
  getUserOrders: async () => {
    await delay();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userOrders = mockOrders.filter(o => o.user.id === user.id);
    return { data: userOrders };
  },
  
  getAllOrders: async () => {
    await delay();
    return { data: mockOrders };
  },
  
  getOrderById: async (id) => {
    await delay();
    const order = mockOrders.find(o => o._id === id);
    if (!order) throw new Error('Orden no encontrada');
    return { data: order };
  },
  
  updateOrderStatus: async (id, statusData) => {
    await delay();
    const order = mockOrders.find(o => o._id === id);
    if (!order) throw new Error('Orden no encontrada');
    order.status = statusData.status;
    localStorage.setItem('mockOrders', JSON.stringify(mockOrders));
    return { data: order };
  },
  
  cancelOrder: async (id) => {
    await delay();
    const order = mockOrders.find(o => o._id === id);
    if (!order) throw new Error('Orden no encontrada');
    order.status = 'Cancelado';
    return { data: order };
  },
  
  getOrderStats: async () => {
    await delay();
    const totalRevenue = mockOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const stats = {
      totalOrders: mockOrders.length,
      totalRevenue,
      pendingOrders: mockOrders.filter(o => o.status === 'Pendiente').length,
      confirmedOrders: mockOrders.filter(o => o.status === 'Confirmado').length,
      deliveredOrders: mockOrders.filter(o => o.status === 'Entregado').length
    };
    return { data: { stats } };
  }
};

// Métodos mock para carrito
export const cartAPI = {
  getCart: async () => {
    await delay();
    return { data: { cart: mockCart } };
  },
  
  addToCart: async (itemData) => {
    await delay();
    const product = mockProducts.find(p => p._id === itemData.productId);
    if (!product) throw new Error('Producto no encontrado');
    
    const existingItem = mockCart.items.find(item => item.product._id === itemData.productId);
    if (existingItem) {
      existingItem.quantity += itemData.quantity;
    } else {
      mockCart.items.push({
        _id: Math.random().toString(36).substr(2, 9),
        product,
        quantity: itemData.quantity,
        price: product.price
      });
    }
    
    mockCart.totalAmount = mockCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    localStorage.setItem('mockCart', JSON.stringify(mockCart));
    return { data: { message: 'Producto agregado al carrito' } };
  },
  
  updateCartItem: async (itemId, quantityData) => {
    await delay();
    const item = mockCart.items.find(i => i._id === itemId);
    if (!item) throw new Error('Item no encontrado en el carrito');
    
    item.quantity = quantityData.quantity;
    mockCart.totalAmount = mockCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    localStorage.setItem('mockCart', JSON.stringify(mockCart));
    return { data: { message: 'Cantidad actualizada' } };
  },
  
  removeFromCart: async (itemId) => {
    await delay();
    const index = mockCart.items.findIndex(i => i._id === itemId);
    if (index === -1) throw new Error('Item no encontrado en el carrito');
    
    mockCart.items.splice(index, 1);
    mockCart.totalAmount = mockCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    localStorage.setItem('mockCart', JSON.stringify(mockCart));
    return { data: { message: 'Item eliminado del carrito' } };
  },
  
  clearCart: async () => {
    await delay();
    mockCart.items = [];
    mockCart.totalAmount = 0;
    localStorage.setItem('mockCart', JSON.stringify(mockCart));
    return { data: { message: 'Carrito vaciado' } };
  },
  
  checkout: async (checkoutData) => {
    await delay();
    if (mockCart.items.length === 0) throw new Error('El carrito está vacío');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const orders = [];
    
    mockCart.items.forEach(item => {
      const order = {
        _id: Math.random().toString(36).substr(2, 9),
        user,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        orderDate: new Date().toISOString(),
        status: 'Pendiente',
        shippingAddress: checkoutData.shippingAddress,
        notes: checkoutData.notes
      };
      orders.push(order);
      mockOrders.push(order);
    });
    
    mockCart.items = [];
    mockCart.totalAmount = 0;
    
    return { data: { orders, totalOrders: orders.length } };
  }
};