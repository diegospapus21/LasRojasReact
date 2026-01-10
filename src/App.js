import React, { useState, createContext, useContext, useEffect } from 'react';
import { Mail, ShoppingCart, User, Package, TrendingUp, LogOut, Menu, X, Search, Filter, Plus, Edit, Trash2, PlusCircle, MinusCircle, RefreshCw, Eye, CheckCircle, XCircle, Truck, Sparkles, Droplet } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { productsAPI, ordersAPI } from './services/api';

// Context para manejo de estado global adicional
const AppContext = createContext();

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider');
  return context;
};

// Provider del contexto
const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productStats, setProductStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Obtener productos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: searchTerm,
        ...filters
      };
      
      // Eliminar filtros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const response = await productsAPI.getProducts(params);
      setProducts(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas de productos (solo admin)
  const fetchProductStats = async () => {
    try {
      const response = await productsAPI.getProductStats();
      setProductStats(response.data.stats);
    } catch (error) {
      console.error('Error obteniendo estadísticas de productos:', error);
    }
  };

  // Obtener estadísticas de pedidos (solo admin)
  const fetchOrderStats = async () => {
    try {
      const response = await ordersAPI.getOrderStats();
      setOrderStats(response.data.stats);
    } catch (error) {
      console.error('Error obteniendo estadísticas de pedidos:', error);
    }
  };

  // Obtener órdenes
  const fetchOrders = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ordersAPI.getAllOrders(params);
      setOrders(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar productos al cambiar filtros o búsqueda
  React.useEffect(() => {
    fetchProducts();
  }, [searchTerm, filters]);

  const value = {
    currentPage,
    setCurrentPage,
    products,
    orders,
    productStats,
    orderStats,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    fetchProducts,
    fetchOrders,
    fetchProductStats,
    fetchOrderStats,
    setError
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Componente de Header actualizado
const Header = () => {
  const { user, logout } = useAuth();
  const { cart, totalItems } = useCart();
  const { setCurrentPage } = useApp();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.logoContainer} onClick={() => setCurrentPage('home')}>
          <img 
            src="/images/logo.png" 
            alt="Las Rojas Logo" 
            style={styles.logoImage}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline';
            }}
          />
          <span style={styles.logoText}>Las Rojas</span>
        </div>
        
        <nav style={styles.nav}>
          <button style={styles.navButton} onClick={() => setCurrentPage('home')}>Inicio</button>
          <button style={styles.navButton} onClick={() => setCurrentPage('contact')}>Contacto</button>
          
          <button 
            style={styles.navButton} 
            onClick={() => setCurrentPage('cart')}
          >
            <ShoppingCart size={18} />
            Carrito {totalItems > 0 && `(${totalItems})`}
          </button>
          
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <button style={styles.navButton} onClick={() => setCurrentPage('admin')}>
                      Panel Admin
                    </button>
                  ) : (
                    <>
                      <button style={styles.navButton} onClick={() => setCurrentPage('profile')}>
                        <User size={18} /> Mi Perfil
                      </button>
                      <button style={styles.navButton} onClick={() => setCurrentPage('myOrders')}>
                        Mis Compras
                      </button>
                    </>
                  )}
                  <button style={styles.navButtonLogout} onClick={logout}>
                    <LogOut size={18} /> Salir
                  </button>
                </>
              ) : (
            <button style={styles.navButton} onClick={() => setCurrentPage('login')}>
              <User size={18} /> Ingresar
            </button>
          )}
        </nav>

        <button style={styles.mobileMenuButton} onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenu && (
        <div style={styles.mobileNav}>
          <button style={styles.mobileNavButton} onClick={() => { setCurrentPage('home'); setMobileMenu(false); }}>Inicio</button>
          <button style={styles.mobileNavButton} onClick={() => { setCurrentPage('contact'); setMobileMenu(false); }}>Contacto</button>
          <button style={styles.mobileNavButton} onClick={() => { setCurrentPage('cart'); setMobileMenu(false); }}>
            <ShoppingCart size={18} /> Carrito {totalItems > 0 && `(${totalItems})`}
          </button>
          {user && (
            <>
              {user.role === 'admin' ? (
                <button style={styles.mobileNavButton} onClick={() => { setCurrentPage('admin'); setMobileMenu(false); }}>Panel Admin</button>
              ) : (
                <button style={styles.mobileNavButton} onClick={() => { setCurrentPage('myOrders'); setMobileMenu(false); }}>Mis Compras</button>
              )}
              <button style={styles.mobileNavButton} onClick={() => { logout(); setMobileMenu(false); }}>Salir</button>
            </>
          )}
          {!user && (
            <button style={styles.mobileNavButton} onClick={() => { setCurrentPage('login'); setMobileMenu(false); }}>Ingresar</button>
          )}
        </div>
      )}
    </header>
  );
};

// Página Principal actualizada
const HomePage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { products, loading, searchTerm, setSearchTerm, filters, setFilters } = useApp();

  const handleAddToCart = async (product) => {
    if (!user) {
      alert('Debe iniciar sesión para agregar productos al carrito');
      return;
    }

    const result = await addToCart(product._id, 1);
    if (result.success) {
      alert(`${product.name} agregado al carrito`);
    } else {
      alert(result.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h2 style={styles.heroTitle}>Bienvenido a Las Rojas</h2>
        <p style={styles.heroSubtitle}>Los mejores perfumes seleccionados para ti</p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <Search size={20} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar perfumes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.filters}>
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            style={styles.filterSelect}
          >
            <option value="">Todas las categorías</option>
            <option value="perfume-masculino">Perfumes Masculinos</option>
            <option value="perfume-femenino">Perfumes Femeninos</option>
          </select>
          
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            style={styles.filterSelect}
          >
            <option value="name">Ordenar por nombre</option>
            <option value="price">Ordenar por precio</option>
            <option value="stock">Ordenar por stock</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <p>Cargando productos...</p>
        </div>
      ) : (
        <div style={styles.productsGrid}>
          {products.map(product => (
            <div key={product._id} style={styles.productCard}>
              {product.image.startsWith('/images/') ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  style={styles.productImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div style={styles.productImage}>{product.image}</div>
              )}
              {product.image.startsWith('/images/') && (
                <div style={{
                  ...styles.productImage,
                  display: 'none'
                }}>
                  {product.category === 'perfume-masculino' ? '👨' : '👩'}
                </div>
              )}
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.productDescription}>{product.description}</p>
              <p style={styles.productPrice}>${product.price.toFixed(2)}</p>
              <p style={styles.productStock}>Stock: {product.stock} unidades</p>
              <button 
                style={product.stock > 0 ? styles.addToCartButton : styles.addButtonDisabled}
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? <><PlusCircle size={18} /> Agregar al Carrito</> : 'Agotado'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Página de Carrito
const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart, checkout, totalAmount, isEmpty } = useCart();
  const { user } = useAuth();
  const { setCurrentPage } = useApp();
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: {
      street: '',
      city: '',
      department: '',
      zipCode: '',
      phone: ''
    },
    notes: ''
  });

  const handleCheckout = async () => {
    if (!user) {
      alert('Debe iniciar sesión para procesar el pedido');
      setCurrentPage('login');
      return;
    }

    if (isEmpty) {
      alert('El carrito está vacío');
      return;
    }

    // Validar datos de envío
    const { street, city, department, phone } = checkoutData.shippingAddress;
    if (!street || !city || !department || !phone) {
      alert('Por favor complete todos los datos de envío');
      return;
    }

    const result = await checkout(checkoutData);
    if (result.success) {
      alert(`¡Pedido creado exitosamente! Se generaron ${result.data.totalOrders} pedidos.`);
      setCurrentPage('myOrders');
    } else {
      alert(result.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <p>Cargando carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Mi Carrito</h2>
      
      {isEmpty ? (
        <div style={styles.emptyState}>
          <ShoppingCart size={48} style={{ color: '#721c24' }} />
          <p>No hay productos en el carrito</p>
          <button 
            style={styles.continueShoppingButton}
            onClick={() => setCurrentPage('home')}
          >
            Continuar Comprando
          </button>
        </div>
      ) : (
        <>
          <div style={styles.cartItems}>
            {cart.items.map(item => (
              <div key={item._id} style={styles.cartItem}>
                <div style={styles.itemInfo}>
                  {item.product.image.startsWith('/images/') ? (
                <img 
                  src={item.product.image} 
                  alt={item.product.name}
                  style={styles.itemImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div style={styles.itemImage}>{item.product.image}</div>
              )}
              {item.product.image.startsWith('/images/') && (
                <div style={{
                  ...styles.itemImage,
                  display: 'none'
                }}>
                  {item.product.category === 'perfume-masculino' ? '👨' : '👩'}
                </div>
              )}
                  <div style={styles.itemDetails}>
                    <h4 style={styles.itemName}>{item.product.name}</h4>
                    <p style={styles.itemPrice}>${item.price.toFixed(2)} c/u</p>
                  </div>
                </div>
                
                <div style={styles.itemControls}>
                  <div style={styles.quantityControls}>
                    <button 
                      style={styles.quantityButton}
                      onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                    >
                      <MinusCircle size={16} />
                    </button>
                    <span style={styles.quantityText}>{item.quantity}</span>
                    <button 
                      style={styles.quantityButton}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      <PlusCircle size={16} />
                    </button>
                  </div>
                  
                  <p style={styles.itemTotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  
                  <button 
                    style={styles.removeButton}
                    onClick={() => removeFromCart(item._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.cartSummary}>
            <div style={styles.summarySection}>
              <h3 style={styles.summaryTitle}>Resumen del Pedido</h3>
              <div style={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Envío:</span>
                <span>Gratis</span>
              </div>
                <div style={{
                  ...styles.summaryRow,
                  ...styles.summaryTotal
                }}>
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div style={styles.shippingSection}>
              <h3 style={styles.summaryTitle}>Datos de Envío</h3>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  placeholder="Dirección"
                  value={checkoutData.shippingAddress.street}
                  onChange={(e) => setCheckoutData({
                    ...checkoutData,
                    shippingAddress: {...checkoutData.shippingAddress, street: e.target.value}
                  })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={checkoutData.shippingAddress.city}
                  onChange={(e) => setCheckoutData({
                    ...checkoutData,
                    shippingAddress: {...checkoutData.shippingAddress, city: e.target.value}
                  })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  placeholder="Departamento"
                  value={checkoutData.shippingAddress.department}
                  onChange={(e) => setCheckoutData({
                    ...checkoutData,
                    shippingAddress: {...checkoutData.shippingAddress, department: e.target.value}
                  })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={checkoutData.shippingAddress.phone}
                  onChange={(e) => setCheckoutData({
                    ...checkoutData,
                    shippingAddress: {...checkoutData.shippingAddress, phone: e.target.value}
                  })}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.checkoutActions}>
              <button 
                style={styles.continueShoppingButton}
                onClick={() => setCurrentPage('home')}
              >
                Continuar Comprando
              </button>
              <button 
                style={styles.checkoutButton}
                onClick={handleCheckout}
              >
                Procesar Pedido
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Página de Login/Registro actualizada
const LoginPage = () => {
  const { login, register } = useAuth();
  const { setCurrentPage } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      alert('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        alert(isLogin ? '¡Bienvenido!' : '¡Registro exitoso!');
        
        // Usar el user del resultado directamente, no del localStorage
        if (isLogin && result.user) {
          console.log('Login successful, user role:', result.user.role);
          if (result.user.role === 'admin') {
            setCurrentPage('admin');
          } else {
            setCurrentPage('home');
          }
        } else {
          setCurrentPage('home');
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.formTitle}>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        
        <div style={styles.form}>
          {!isLogin && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre:</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={styles.input}
                required
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Email (Gmail):</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
              placeholder="ejemplo@gmail.com"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña:</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <button 
            onClick={handleSubmit} 
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Procesando...' : (isLogin ? 'Ingresar' : 'Registrarse')}
          </button>
        </div>

        <button 
          style={styles.toggleButton}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>ℹ️ Use cualquier email y contraseña para registrar un nuevo cliente</p>
          <p style={styles.infoText}>👤 <strong>Credenciales de Admin:</strong></p>
          <p style={styles.infoText}>📧 Email: admin@lasrojas.com</p>
          <p style={styles.infoText}>🔑 Contraseña: admin123</p>
        </div>
      </div>
    </div>
  );
};

// Panel de Cliente - Mis Compras actualizado
const MyOrdersPage = () => {
  const { user } = useAuth();
  const { orders } = useApp();
  const [userOrders, setUserOrders] = useState([]);

  React.useEffect(() => {
    if (user && orders.length > 0) {
      const filteredOrders = orders.filter(order => order.user.id === user.id);
      setUserOrders(filteredOrders);
    }
  }, [user, orders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return '#ff9800';
      case 'Confirmado': return '#2196f3';
      case 'Enviado': return '#9c27b0';
      case 'Entregado': return '#4caf50';
      case 'Cancelado': return '#f44336';
      default: return '#666';
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Mis Compras</h2>
      
      {userOrders.length === 0 ? (
        <div style={styles.emptyState}>
          <ShoppingCart size={48} style={{ color: '#721c24' }} />
          <p>No tienes compras registradas</p>
        </div>
      ) : (
        <div style={styles.ordersContainer}>
          {userOrders.map(order => (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <h3 style={styles.orderTitle}>Pedido #{order._id.slice(-8)}</h3>
                 <span style={{
                   ...styles.orderStatus,
                   backgroundColor: getStatusColor(order.status)
                 }}>
                  {order.status}
                </span>
              </div>
              <p style={styles.orderDetail}><strong>Producto:</strong> {order.product.name}</p>
              <p style={styles.orderDetail}><strong>Cantidad:</strong> {order.quantity}</p>
              <p style={styles.orderDetail}><strong>Precio Unitario:</strong> ${order.product.price.toFixed(2)}</p>
              <p style={styles.orderDetail}><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</p>
              <p style={styles.orderDetail}><strong>Fecha:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
              {order.notes && (
                <p style={styles.orderDetail}><strong>Notas:</strong> {order.notes}</p>
              )}
              {order.shippingAddress && (
                <div style={styles.shippingInfo}>
                  <p style={styles.orderDetail}><strong>Dirección de envío:</strong></p>
                  <p style={styles.orderDetail}>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                  <p style={styles.orderDetail}>{order.shippingAddress.department}</p>
                  <p style={styles.orderDetail}>📞 {order.shippingAddress.phone}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Panel de Administrador actualizado
const AdminPage = () => {
  const { 
    orders, 
    productStats, 
    orderStats, 
    fetchOrders, 
    fetchProductStats, 
    fetchOrderStats,
    setCurrentPage 
  } = useApp();

  React.useEffect(() => {
    fetchOrders();
    fetchProductStats();
    fetchOrderStats();
  }, [fetchOrders, fetchProductStats, fetchOrderStats]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, { status: newStatus });
      alert('Estado del pedido actualizado exitosamente');
      fetchOrders();
      setShowOrderDetails(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return '#ff9800';
      case 'Confirmed': return '#2196f3';
      case 'Enviado': return '#9c27b0';
      case 'Entregado': return '#4caf50';
      case 'Cancelado': return '#f44336';
      default: return '#666';
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Panel de Administración</h2>
      
      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <TrendingUp size={32} style={{ color: '#721c24' }} />
          <h3 style={styles.statValue}>${orderStats?.totalRevenue?.toFixed(2) || '0.00'}</h3>
          <p style={styles.statLabel}>Ventas Totales</p>
        </div>
        
        <div style={styles.statCard}>
          <Package size={32} style={{ color: '#721c24' }} />
          <h3 style={styles.statValue}>{orderStats?.totalOrders || 0}</h3>
          <p style={styles.statLabel}>Pedidos</p>
        </div>
        
        <div style={styles.statCard}>
          <User size={32} style={{ color: '#721c24' }} />
          <h3 style={styles.statValue}>--</h3>
          <p style={styles.statLabel}>Clientes</p>
        </div>
        
        <div style={styles.statCard}>
          <ShoppingCart size={32} style={{ color: '#721c24' }} />
          <h3 style={styles.statValue}>{productStats?.totalStock || 0}</h3>
          <p style={styles.statLabel}>Stock Total</p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={styles.actionsSection}>
        <h3 style={styles.sectionTitle}>Acciones Rápidas</h3>
        <div style={styles.actionsGrid}>
          <button 
            style={styles.actionButton}
            onClick={() => setCurrentPage('products')}
          >
            <Package size={20} />
            Gestionar Productos
          </button>
          <button 
            style={styles.actionButton}
            onClick={() => setCurrentPage('lowStock')}
          >
            <RefreshCw size={20} />
            Stock Bajo
          </button>
        </div>
      </div>

      {/* Todos los pedidos */}
      <div style={styles.adminSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Todos los Pedidos</h3>
          <button 
            style={styles.refreshButton}
            onClick={fetchOrders}
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>ID</th>
                <th style={styles.tableHeader}>Cliente</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Producto</th>
                <th style={styles.tableHeader}>Cantidad</th>
                <th style={styles.tableHeader}>Total</th>
                <th style={styles.tableHeader}>Fecha</th>
                <th style={styles.tableHeader}>Estado</th>
                <th style={styles.tableHeader}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} style={styles.tableRow}>
                  <td style={styles.tableCell}>#{order._id.slice(-8)}</td>
                  <td style={styles.tableCell}>{order.user.name}</td>
                  <td style={styles.tableCell}>{order.user.email}</td>
                  <td style={styles.tableCell}>{order.product.name}</td>
                  <td style={styles.tableCell}>{order.quantity}</td>
                  <td style={styles.tableCell}>${order.totalPrice.toFixed(2)}</td>
                  <td style={styles.tableCell}>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(order.status)
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <button 
                      style={styles.actionIconButton}
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles del pedido */}
      {showOrderDetails && selectedOrder && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Detalles del Pedido</h3>
              <button 
                style={styles.modalCloseButton}
                onClick={() => setShowOrderDetails(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalContent}>
              <p><strong>ID:</strong> #{selectedOrder._id}</p>
              <p><strong>Cliente:</strong> {selectedOrder.user.name}</p>
              <p><strong>Email:</strong> {selectedOrder.user.email}</p>
              <p><strong>Producto:</strong> {selectedOrder.product.name}</p>
              <p><strong>Cantidad:</strong> {selectedOrder.quantity}</p>
              <p><strong>Total:</strong> ${selectedOrder.totalPrice.toFixed(2)}</p>
              <p><strong>Estado Actual:</strong> {selectedOrder.status}</p>
              
              {selectedOrder.shippingAddress && (
                <div>
                  <p><strong>Dirección de envío:</strong></p>
                  <p>{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}</p>
                  <p>{selectedOrder.shippingAddress.department}</p>
                  <p>📞 {selectedOrder.shippingAddress.phone}</p>
                </div>
              )}
              
              <div style={styles.statusActions}>
                <h4>Actualizar Estado:</h4>
                <div style={styles.statusButtons}>
                  {selectedOrder.status === 'Pendiente' && (
                    <>
                      <button 
                        style={{
                          ...styles.statusButton,
                          backgroundColor: '#2196f3'
                        }}
                        onClick={() => updateOrderStatus(selectedOrder._id, 'Confirmado')}
                      >
                        <CheckCircle size={16} /> Confirmar
                      </button>
                      <button 
                        style={{
                          ...styles.statusButton,
                          backgroundColor: '#f44336'
                        }}
                        onClick={() => updateOrderStatus(selectedOrder._id, 'Cancelado')}
                      >
                        <XCircle size={16} /> Cancelar
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'Confirmado' && (
                    <button 
                      style={{
                        ...styles.statusButton,
                        backgroundColor: '#9c27b0'
                      }}
                      onClick={() => updateOrderStatus(selectedOrder._id, 'Enviado')}
                    >
                      <Truck size={16} /> Enviar
                    </button>
                  )}
                  {selectedOrder.status === 'Enviado' && (
                    <button 
                      style={{
                        ...styles.statusButton,
                        backgroundColor: '#4caf50'
                      }}
                      onClick={() => updateOrderStatus(selectedOrder._id, 'Entregado')}
                    >
                      <CheckCircle size={16} /> Entregar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Página de Gestión de Productos
const ProductsManagementPage = () => {
  try {
    const { products, fetchProducts, fetchProductStats } = useApp();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: 'perfume-masculino',
      image: ''
    });

    useEffect(() => {
      try {
        if (fetchProducts) fetchProducts();
        if (fetchProductStats) fetchProductStats();
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }, []);

    const handleSubmit = async () => {
      if (!formData.name || !formData.description || !formData.price || !formData.stock) {
        alert('Por favor complete todos los campos');
        return;
      }

      try {
        if (editingProduct) {
          await productsAPI.updateProduct(editingProduct._id, {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock)
          });
          alert('Producto actualizado exitosamente');
        } else {
          await productsAPI.createProduct({
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            image: formData.image || (formData.category === 'perfume-masculino' ? '👨' : '👩')
          });
          alert('Producto creado exitosamente');
        }
        
        fetchProducts();
        fetchProductStats();
        setShowAddForm(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: 'perfume-masculino',
          image: ''
        });
      } catch (error) {
        alert(error.message);
      }
    };

    const handleEdit = (product) => {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        image: product.image
      });
      setShowAddForm(true);
    };

    const handleDelete = async (productId) => {
      if (confirm('¿Está seguro de eliminar este producto?')) {
        try {
          await productsAPI.deleteProduct(productId);
          alert('Producto eliminado exitosamente');
          fetchProducts();
          fetchProductStats();
        } catch (error) {
          alert(error.message);
        }
      }
    };

    const handleCancel = () => {
      setShowAddForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: 'perfume-masculino',
        image: ''
      });
    };

    return (
      <div style={styles.container}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.pageTitle}>Gestión de Productos</h2>
          <button 
            style={styles.actionButton}
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={20} /> Agregar Producto
          </button>
        </div>

        {/* Formulario para agregar/editar producto */}
        {showAddForm && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
                <button 
                  style={styles.modalCloseButton}
                  onClick={handleCancel}
                >
                  <X size={20} />
                </button>
              </div>
              <div style={styles.modalContent}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombre:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Descripción:</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={styles.textarea}
                    rows="3"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Precio:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stock:</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Categoría:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={styles.filterSelect}
                  >
                    <option value="perfume-masculino">Perfume Masculino</option>
                    <option value="perfume-femenino">Perfume Femenino</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Imagen del Producto:</label>
                  <div style={styles.imageUploadSection}>
                    <div style={styles.imageUploadOptions}>
                      <button 
                        type="button"
                        style={{
                          ...styles.buttonOption,
                          ...(formData.image && !formData.image.startsWith('/images/') ? styles.buttonOptionActive : {})
                        }}
                        onClick={() => setFormData({...formData, image: ''})}
                      >
                        Emoji por defecto
                      </button>
                       <button 
                         type="button"
                         style={{
                           ...styles.buttonOption,
                           ...(formData.image && formData.image.startsWith('/images/') ? styles.buttonOptionActive : {})
                         }}
                         onClick={() => {
                           const availableFiles = ['p2.jpg', 'p4.jpg', 'p6.jpg', 'p7.jpg'];
                           const fileOptions = availableFiles.map((file, index) => `${index + 1}. ${file}`).join('\n');
                           
                           const imageName = prompt(`Ingrese el nombre del archivo de imagen:\n\nArchivos disponibles:\n${fileOptions}\n\nO escriba otro nombre:`);
                           if (imageName) {
                             const cleanName = imageName.trim();
                             const imagePath = `/images/${cleanName}`;
                             setFormData({...formData, image: imagePath});
                             console.log('Setting image path to:', imagePath);
                           }
                         }}
                       >
                        Imagen local
                      </button>
                    </div>
                     <div style={styles.imagePreview}>
                      {formData.image && formData.image.startsWith('/images/') ? (
                        <img 
                          src={formData.image} 
                          alt="Vista previa"
                          style={styles.previewImage}
                          onError={(e) => {
                            console.error('Error loading image:', formData.image);
                            alert(`Imagen no encontrada: ${formData.image}\n\nAsegúrese de que el archivo existe en public/images/\n\nArchivos disponibles: p2.jpg, p4.jpg, p6.jpg, p7.jpg`);
                            setFormData({...formData, image: ''});
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', formData.image);
                          }}
                        />
                      ) : (
                        <div style={styles.previewEmoji}>
                          {formData.category === 'perfume-masculino' ? '👨' : '👩'}
                        </div>
                      )}
                    </div>
                    <p style={styles.imageHelpText}>
                      💡 Para usar imágenes locales: coloque sus archivos en la carpeta "public/images" y luego haga clic en "Imagen local".<br/>
                      📁 Archivos disponibles: p2.jpg, p4.jpg, p6.jpg, p7.jpg<br/>
                      🔍 Si la imagen no carga, revise el nombre exacto del archivo y que esté en public/images/
                    </p>
                  </div>
                </div>
                <div style={styles.statusButtons}>
                  <button 
                    style={styles.statusButton}
                    onClick={handleSubmit}
                  >
                    {editingProduct ? <Edit size={16} /> : <Plus size={16} />}
                    {editingProduct ? 'Actualizar' : 'Crear'}
                  </button>
                  <button 
                    style={{
                      ...styles.statusButton,
                      backgroundColor: '#666'
                    }}
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de productos */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>ID</th>
                <th style={styles.tableHeader}>Nombre</th>
                <th style={styles.tableHeader}>Descripción</th>
                <th style={styles.tableHeader}>Precio</th>
                <th style={styles.tableHeader}>Stock</th>
                <th style={styles.tableHeader}>Categoría</th>
                <th style={styles.tableHeader}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products?.map(product => (
                <tr key={product._id} style={styles.tableRow}>
                  <td style={styles.tableCell}>#{product._id.slice(-6)}</td>
                  <td style={styles.tableCell}>{product.name}</td>
                  <td style={styles.tableCell}>{product.description}</td>
                  <td style={styles.tableCell}>${product.price.toFixed(2)}</td>
                  <td style={{
                    ...styles.tableCell,
                    ...(product.stock < 20 ? { color: '#f44336', fontWeight: 'bold' } : {})
                  }}>
                    {product.stock}
                  </td>
                  <td style={styles.tableCell}>
                    {product.category === 'perfume-masculino' ? 'Masculino' : 'Femenino'}
                  </td>
                  <td style={styles.tableCell}>
                    <button 
                      style={{
                        ...styles.actionIconButton,
                        backgroundColor: '#2196f3',
                        marginRight: '0.5rem'
                      }}
                      onClick={() => handleEdit(product)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      style={{
                        ...styles.actionIconButton,
                        backgroundColor: '#f44336'
                      }}
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error en ProductsManagementPage:', error);
    return (
      <div style={styles.container}>
        <h2 style={styles.pageTitle}>Error</h2>
        <p>Error: {error.message}</p>
      </div>
    );
  }
};

// Página de Stock Bajo
const LowStockPage = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('LowStockPage mounted');
    const fetchLowStock = async () => {
      try {
        const response = await productsAPI.getLowStockProducts();
        setLowStockProducts(response.data);
      } catch (error) {
        console.error('Error loading low stock products:', error);
        alert(error.message || 'Error al cargar productos con stock bajo');
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
  }, []);

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await productsAPI.updateStock(productId, { stock: parseInt(newStock) });
      alert('Stock actualizado exitosamente');
      
      // Refrescar la lista
      const response = await productsAPI.getLowStockProducts();
      setLowStockProducts(response.data);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <p>Cargando productos con stock bajo...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.pageTitle}>Productos con Stock Bajo</h2>
        <span style={styles.warningBadge}>
          <RefreshCw size={16} /> {lowStockProducts.length} productos
        </span>
      </div>

      {lowStockProducts.length === 0 ? (
        <div style={styles.emptyState}>
          <CheckCircle size={48} style={{ color: '#4caf50' }} />
          <p>¡Todos los productos tienen stock suficiente!</p>
        </div>
      ) : (
        <div style={styles.warningBox}>
          <p style={styles.warningText}>
            ⚠️ Los siguientes productos tienen menos de 20 unidades en stock. 
            Considere reabastecer pronto para evitar ventas perdidas.
          </p>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>Producto</th>
              <th style={styles.tableHeader}>Categoría</th>
              <th style={styles.tableHeader}>Stock Actual</th>
              <th style={styles.tableHeader}>Precio</th>
              <th style={styles.tableHeader}>Estado</th>
              <th style={styles.tableHeader}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.map(product => (
              <tr key={product._id} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <div style={styles.productInfo}>
                    <span style={styles.productImage}>{product.image}</span>
                    <div>
                      <div style={styles.productName}>{product.name}</div>
                      <div style={styles.productDescription}>{product.description}</div>
                    </div>
                  </div>
                </td>
                <td style={styles.tableCell}>
                  {product.category === 'perfume-masculino' ? 'Masculino' : 'Femenino'}
                </td>
                <td style={[styles.tableCell, { color: '#f44336', fontWeight: 'bold' }]}>
                  {product.stock} unidades
                </td>
                <td style={styles.tableCell}>${product.price.toFixed(2)}</td>
                <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: '#f44336'
                    }}>
                    Crítico
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.stockUpdateContainer}>
                    <input
                      type="number"
                      defaultValue={product.stock}
                      min="0"
                      style={styles.stockInput}
                      id={`stock-${product._id}`}
                    />
                    <button 
                      style={{
                        ...styles.statusButton,
                        backgroundColor: '#4caf50'
                      }}
                      onClick={() => {
                        const input = document.getElementById(`stock-${product._id}`);
                        handleUpdateStock(product._id, input.value);
                      }}
                    >
                      Actualizar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Página de Perfil de Cliente
const ProfilePage = () => {
  const { user } = useAuth();
  const { updateProfile, changePassword } = useAuth();
  const { orders } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      alert('Perfil actualizado exitosamente');
      setIsEditing(false);
    } else {
      alert(result.message);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      alert('Contraseña cambiada exitosamente');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      alert(result.message);
    }
  };

  const userOrders = orders.filter(order => order.user.id === user?.id);

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Mi Perfil</h2>
      
      <div style={styles.profileGrid}>
        {/* Información Personal */}
        <div style={styles.profileSection}>
          <h3 style={styles.sectionTitle}>Información Personal</h3>
          {isEditing ? (
            <div style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  style={{...styles.input, backgroundColor: '#555'}}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Teléfono:</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={styles.input}
                  placeholder="Ingrese su teléfono"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Dirección:</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={styles.input}
                  placeholder="Ingrese su dirección"
                />
              </div>
              <div style={styles.buttonGroup}>
                <button
                  style={styles.submitButton}
                  onClick={handleUpdateProfile}
                >
                  Guardar Cambios
                </button>
                <button
                  style={styles.toggleButton}
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      address: user?.address || ''
                    });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.profileInfo}>
              <p style={styles.profileInfoText}><strong>Nombre:</strong> {user?.name}</p>
              <p style={styles.profileInfoText}><strong>Email:</strong> {user?.email}</p>
              <p style={styles.profileInfoText}><strong>Teléfono:</strong> {user?.phone || 'No especificado'}</p>
              <p style={styles.profileInfoText}><strong>Dirección:</strong> {user?.address || 'No especificada'}</p>
              <p style={styles.profileInfoText}><strong>Rol:</strong> {user?.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
              <button
                style={styles.submitButton}
                onClick={() => setIsEditing(true)}
              >
                Editar Perfil
              </button>
            </div>
          )}
        </div>

        {/* Cambio de Contraseña */}
        <div style={styles.profileSection}>
          <h3 style={styles.sectionTitle}>Seguridad</h3>
          {isChangingPassword ? (
            <div style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contraseña Actual:</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nueva Contraseña:</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Confirmar Nueva Contraseña:</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.buttonGroup}>
                <button
                  style={styles.submitButton}
                  onClick={handleChangePassword}
                >
                  Cambiar Contraseña
                </button>
                <button
                  style={styles.toggleButton}
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.profileInfo}>
              <p style={styles.profileInfoText}>********</p>
              <button
                style={styles.submitButton}
                onClick={() => setIsChangingPassword(true)}
              >
                Cambiar Contraseña
              </button>
            </div>
          )}
        </div>

        {/* Resumen de Compras */}
        <div style={styles.profileSection}>
          <h3 style={styles.sectionTitle}>Resumen de Compras</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem'}}>
            <div style={styles.statCard}>
              <h3 style={styles.statValue}>{userOrders.length}</h3>
              <p style={styles.statLabel}>Total de Pedidos</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statValue}>
                ${userOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}
              </h3>
              <p style={styles.statLabel}>Total Gastado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Página de Contacto
const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      alert('Por favor complete todos los campos');
      return;
    }
    
    // Simulación de envío de correo
    const mailtoLink = `mailto:diegoghc7002@gmail.com?subject=Contacto desde Las Rojas&body=Nombre: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0AMensaje: ${formData.message}`;
    window.location.href = mailtoLink;
    
    alert('Abriendo su cliente de correo para enviar el mensaje...');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.formTitle}>Contáctanos</h2>
        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre:</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email:</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mensaje:</label>
            <textarea 
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              style={styles.textarea}
              rows="5"
              required
            />
          </div>

          <button onClick={handleSubmit} style={styles.submitButton}>
            <Mail size={18} /> Enviar Mensaje
          </button>
        </div>

        <div style={styles.contactInfo}>
          <p style={styles.contactText}>📧 diegoghc7002@gmail.com</p>
          <p style={styles.contactText}>📍 San Salvador, El Salvador</p>
        </div>
      </div>
    </div>
  );
};

// App Principal
const App = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

const MainApp = () => {
  const { user } = useAuth();
  const { currentPage } = useApp();

  return (
    <div style={styles.app}>
      <Header />
      <main style={styles.main}>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'cart' && <CartPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'login' && <LoginPage />}
        {currentPage === 'myOrders' && user && <MyOrdersPage />}
        {currentPage === 'profile' && user && <ProfilePage />}
        {currentPage === 'admin' && user?.role === 'admin' && <AdminPage />}
        {currentPage === 'products' && user?.role === 'admin' && <ProductsManagementPage />}
        {currentPage === 'lowStock' && user?.role === 'admin' && <LowStockPage />}
      </main>
      <footer style={styles.footer}>
        <p>© 2026 Las Rojas - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

// Estilos actualizados
const styles = {
  // Estilos existentes...
  app: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    backgroundColor: '#721c24',
    padding: '1rem 2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  logoImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  logoText: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
    whiteSpace: 'nowrap',
  },
  nav: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  navButton: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '2px solid transparent',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navButtonLogout: {
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  mobileMenuButton: {
    display: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  },
  mobileNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#5a1419',
    borderRadius: '8px',
  },
  mobileNavButton: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: 'none',
    padding: '0.75rem',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '1rem',
    borderRadius: '5px',
  },
  main: {
    minHeight: 'calc(100vh - 200px)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  hero: {
    textAlign: 'center',
    padding: '3rem 0',
    background: 'linear-gradient(135deg, #721c24 0%, #000 100%)',
    borderRadius: '10px',
    marginBottom: '3rem',
  },
  heroTitle: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    color: '#ccc',
  },
  
  // Sección de búsqueda y filtros
  searchSection: {
    backgroundColor: '#2a2a2a',
    padding: '2rem',
    borderRadius: '10px',
    marginBottom: '3rem',
    border: '2px solid #721c24',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#721c24',
  },
  searchInput: {
    width: '100%',
    padding: '1rem 1rem 1rem 3rem',
    borderRadius: '5px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#721c24',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
  },
  filters: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '0.75rem',
    borderRadius: '5px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#721c24',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
    minWidth: '200px',
  },
  
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
  },
  productCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: '10px',
    padding: '1.5rem',
    textAlign: 'center',
    transition: 'transform 0.3s, box-shadow 0.3s',
    border: '2px solid #721c24',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem auto',
  },
  productName: {
    fontSize: '1.3rem',
    marginBottom: '0.5rem',
    color: '#fff',
    textAlign: 'center',
  },
  productDescription: {
    color: '#ccc',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: '1.5rem',
    color: '#721c24',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  productStock: {
    color: '#999',
    marginBottom: '1rem',
  },
  addToCartButton: {
    backgroundColor: '#721c24',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: 'auto',
  },
  addButtonDisabled: {
    backgroundColor: '#555',
    color: '#999',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'not-allowed',
    fontWeight: 'bold',
    width: '100%',
  },
  
  // Página de Carrito
  cartItems: {
    marginBottom: '2rem',
  },
  cartItem: {
    backgroundColor: '#2a2a2a',
    padding: '1.5rem',
    borderRadius: '10px',
    marginBottom: '1rem',
    border: '2px solid #721c24',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
  },
  itemImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '6px',
    fontSize: '3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
    color: '#fff',
  },
  itemPrice: {
    color: '#721c24',
    fontWeight: 'bold',
  },
  itemControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  quantityButton: {
    backgroundColor: '#721c24',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  quantityText: {
    fontSize: '1rem',
    fontWeight: 'bold',
    minWidth: '30px',
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#721c24',
    minWidth: '80px',
  },
  removeButton: {
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  
  cartSummary: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  summarySection: {
    backgroundColor: '#2a2a2a',
    padding: '2rem',
    borderRadius: '10px',
    border: '2px solid #721c24',
  },
  shippingSection: {
    backgroundColor: '#2a2a2a',
    padding: '2rem',
    borderRadius: '10px',
    border: '2px solid #721c24',
  },
  summaryTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#721c24',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  summaryTotal: {
    borderTop: '2px solid #721c24',
    paddingTop: '0.5rem',
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
  checkoutActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    gridColumn: '1 / -1',
  },
  continueShoppingButton: {
    backgroundColor: '#666',
    color: '#fff',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    flex: 1,
  },
  checkoutButton: {
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: 1,
  },
  
  // Estilos de formulario (existentes)
  formContainer: {
    maxWidth: '600px',
    margin: '2rem auto',
    backgroundColor: '#2a2a2a',
    padding: '2rem',
    borderRadius: '10px',
    border: '2px solid #721c24',
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: '2rem',
    color: '#721c24',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '5px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#721c24',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
  },
  textarea: {
    padding: '0.75rem',
    borderRadius: '5px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#721c24',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  submitButton: {
    backgroundColor: '#721c24',
    color: '#fff',
    border: 'none',
    padding: '1rem',
    borderRadius: '5px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.3s',
  },
  toggleButton: {
    marginTop: '1rem',
    backgroundColor: 'transparent',
    color: '#721c24',
    border: 'none',
    padding: '0.5rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  infoBox: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#1a1a1a',
    borderRadius: '5px',
    border: '1px solid #721c24',
  },
  infoText: {
    margin: '0.5rem 0',
    fontSize: '0.9rem',
    color: '#ccc',
  },
  contactInfo: {
    marginTop: '2rem',
    textAlign: 'center',
  },
  contactText: {
    fontSize: '1.1rem',
    margin: '0.5rem 0',
  },
  pageTitle: {
    fontSize: '2.5rem',
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#721c24',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#2a2a2a',
    borderRadius: '10px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#2a2a2a',
    borderRadius: '10px',
  },
  ordersContainer: {
    display: 'grid',
    gap: '1.5rem',
  },
  orderCard: {
    backgroundColor: '#2a2a2a',
    padding: '1.5rem',
    borderRadius: '10px',
    border: '2px solid #721c24',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  orderTitle: {
    fontSize: '1.3rem',
    margin: 0,
  },
  orderStatus: {
    backgroundColor: '#721c24',
    color: '#fff',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
  },
  orderDetail: {
    margin: '0.5rem 0',
    fontSize: '1rem',
  },
  shippingInfo: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#1a1a1a',
    borderRadius: '5px',
  },
  
  // Panel de administración
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  statCard: {
    backgroundColor: '#2a2a2a',
    padding: '2rem',
    borderRadius: '10px',
    textAlign: 'center',
    border: '2px solid #721c24',
  },
  statValue: {
    fontSize: '2rem',
    color: '#721c24',
    margin: '0.5rem 0',
  },
  statLabel: {
    fontSize: '1rem',
    color: '#999',
  },
  actionsSection: {
    marginBottom: '3rem',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  actionButton: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: '2px solid #721c24',
    padding: '1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.3s',
  },
  refreshButton: {
    backgroundColor: '#721c24',
    color: '#fff',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  adminSection: {
    marginBottom: '3rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    marginBottom: '1rem',
    color: '#721c24',
  },
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: '#2a2a2a',
    borderRadius: '10px',
    padding: '1rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    borderBottom: '2px solid #721c24',
  },
  tableHeader: {
    padding: '1rem',
    textAlign: 'left',
    color: '#721c24',
    fontWeight: 'bold',
  },
  tableRow: {
    borderBottom: '1px solid #444',
  },
  tableCell: {
    padding: '1rem',
  },
  statusBadge: {
    color: '#fff',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
  },
  actionIconButton: {
    backgroundColor: '#721c24',
    color: '#fff',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  
  // Estilos adicionales para gestión de productos
  warningBadge: {
    backgroundColor: '#f44336',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    border: '2px solid #f44336',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
  },
  warningText: {
    color: '#721c24',
    margin: 0,
    fontWeight: 'bold',
  },
  productInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  stockUpdateContainer: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  stockInput: {
    width: '80px',
    padding: '0.5rem',
    borderRadius: '4px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#721c24',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '0.9rem',
  },
  imageUploadSection: {
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderColor: '#721c24',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#1a1a1a',
  },
  imageUploadOptions: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  buttonOption: {
    flex: 1,
    padding: '0.75rem',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#721c24',
    borderRadius: '5px',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  buttonOptionActive: {
    backgroundColor: '#721c24',
    borderColor: '#fff',
  },
  imagePreview: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '120px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#444',
    borderRadius: '8px',
    backgroundColor: '#2a2a2a',
    marginBottom: '1rem',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: '6px',
  },
  previewEmoji: {
    fontSize: '4rem',
  },
  imageHelpText: {
    fontSize: '0.85rem',
    color: '#999',
    margin: 0,
    fontStyle: 'italic',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  },
  profileSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: '10px',
    padding: '2rem',
    border: '2px solid #721c24',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  profileInfoText: {
    fontSize: '1.1rem',
    margin: '0.5rem 0',
    padding: '0.5rem',
    backgroundColor: '#1a1a1a',
    borderRadius: '5px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: '#2a2a2a',
    borderRadius: '10px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: '2px solid #721c24',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  modalCloseButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  statusActions: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#1a1a1a',
    borderRadius: '5px',
  },
  statusButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  statusButton: {
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  footer: {
    backgroundColor: '#721c24',
    padding: '1.5rem',
    textAlign: 'center',
    marginTop: '3rem',
  },
  
  // Responsive
  '@media (max-width: 768px)': {
    header: {
      padding: '1rem',
    },
    headerContent: {
      flexWrap: 'wrap',
    },
    logo: {
      fontSize: '1.4rem',
    },
    nav: {
      display: 'none',
    },
    mobileMenuButton: {
      display: 'block',
    },
    mobileNav: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#5a1419',
      borderRadius: '8px',
    },
    container: {
      padding: '1rem',
    },
    hero: {
      padding: '2rem 1rem',
    },
    heroTitle: {
      fontSize: '2rem',
    },
    heroSubtitle: {
      fontSize: '1rem',
    },
    searchSection: {
      padding: '1rem',
    },
    filters: {
      flexDirection: 'column',
    },
    filterSelect: {
      minWidth: 'auto',
      marginBottom: '0.5rem',
    },
    productsGrid: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
    },
    productCard: {
      padding: '1rem',
    },
    productImage: {
      width: '80px',
      height: '80px',
      fontSize: '3rem',
    },
    cartSummary: {
      gridTemplateColumns: '1fr',
    },
    checkoutActions: {
      flexDirection: 'column',
    },
    cartItem: {
      flexDirection: 'column',
      gap: '1rem',
    },
    itemControls: {
      width: '100%',
      justifyContent: 'space-between',
    },
    formContainer: {
      margin: '1rem',
      padding: '1.5rem',
    },
    tableContainer: {
      fontSize: '0.8rem',
    },
    statsGrid: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    actionsGrid: {
      gridTemplateColumns: '1fr',
    },
    modal: {
      width: '95%',
      padding: '1rem',
    },
  },
  '@media (max-width: 480px)': {
    logo: {
      fontSize: '1.2rem',
    },
    heroTitle: {
      fontSize: '1.5rem',
    },
    productsGrid: {
      gridTemplateColumns: '1fr',
    },
    statsGrid: {
      gridTemplateColumns: '1fr',
    },
    tableContainer: {
      overflowX: 'scroll',
    },
    pageTitle: {
      fontSize: '1.8rem',
    },
  }
};

export default App;