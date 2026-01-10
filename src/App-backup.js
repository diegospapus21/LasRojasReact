import React, { useState, createContext, useContext } from 'react';
import { Mail, ShoppingCart, User, Package, TrendingUp, LogOut, Menu, X } from 'lucide-react';

// Context para manejo de estado global
const AppContext = createContext();

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider');
  return context;
};

// Datos iniciales
const initialProducts = [
  { id: 1, name: 'Vino Reserva Premium', price: 45.99, image: '🍷', stock: 20 },
  { id: 2, name: 'Vino Tinto Clásico', price: 28.50, image: '🍷', stock: 35 },
  { id: 3, name: 'Vino Rosado Especial', price: 32.00, image: '🍷', stock: 25 },
  { id: 4, name: 'Vino Blanco Selección', price: 38.75, image: '🍷', stock: 18 },
  { id: 5, name: 'Champagne Premium', price: 65.00, image: '🥂', stock: 12 },
  { id: 6, name: 'Vino Gran Reserva', price: 89.99, image: '🍷', stock: 8 }
];

// Provider del contexto
const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, email: 'diegoghc7002@gmail.com', password: 'admin123', role: 'admin', name: 'Administrador' }
  ]);
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');

  const isValidGmail = (email) => {
    return email.toLowerCase().endsWith('@gmail.com');
  };

  const register = (email, password, name) => {
    if (!email || !password || !name) {
      return { success: false, message: 'Todos los campos son requeridos' };
    }

    if (!isValidGmail(email) && email !== 'diegoghc7002@gmail.com') {
      return { success: false, message: 'Debe usar un correo de Gmail válido' };
    }

    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Este correo ya está registrado' };
    }

    const newUser = {
      id: users.length + 1,
      email,
      password,
      name,
      role: email === 'diegoghc7002@gmail.com' ? 'admin' : 'client'
    };

    setUsers([...users, newUser]);
    return { success: true, message: 'Registro exitoso' };
  };

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: 'Credenciales incorrectas' };
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    setCurrentPage('home');
  };

  const addToCart = (product) => {
    setCart([...cart, { ...product, orderId: Date.now() }]);
  };

  const createOrder = (productId) => {
    if (!currentUser || currentUser.role !== 'client') return;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newOrder = {
      id: orders.length + 1,
      productId: product.id,
      productName: product.name,
      price: product.price,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      date: new Date().toISOString(),
      status: 'Pendiente'
    };

    setOrders([...orders, newOrder]);
    
    // Reducir stock
    setProducts(products.map(p => 
      p.id === productId ? { ...p, stock: p.stock - 1 } : p
    ));
  };

  const value = {
    currentUser,
    users,
    products,
    orders,
    cart,
    currentPage,
    setCurrentPage,
    register,
    login,
    logout,
    addToCart,
    createOrder
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Componente de Header
const Header = () => {
  const { currentUser, logout, setCurrentPage, cart } = useApp();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <h1 style={styles.logo} onClick={() => setCurrentPage('home')}>🍷 Las Rojas</h1>
        
        <nav style={styles.nav}>
          <button style={styles.navButton} onClick={() => setCurrentPage('home')}>Inicio</button>
          <button style={styles.navButton} onClick={() => setCurrentPage('contact')}>Contacto</button>
          
          {currentUser ? (
            <>
              {currentUser.role === 'admin' ? (
                <button style={styles.navButton} onClick={() => setCurrentPage('admin')}>
                  Panel Admin
                </button>
              ) : (
                <button style={styles.navButton} onClick={() => setCurrentPage('myOrders')}>
                  Mis Compras
                </button>
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
          {currentUser && (
            <>
              {currentUser.role === 'admin' ? (
                <button style={styles.mobileNavButton} onClick={() => { setCurrentPage('admin'); setMobileMenu(false); }}>Panel Admin</button>
              ) : (
                <button style={styles.mobileNavButton} onClick={() => { setCurrentPage('myOrders'); setMobileMenu(false); }}>Mis Compras</button>
              )}
              <button style={styles.mobileNavButton} onClick={() => { logout(); setMobileMenu(false); }}>Salir</button>
            </>
          )}
          {!currentUser && (
            <button style={styles.mobileNavButton} onClick={() => { setCurrentPage('login'); setMobileMenu(false); }}>Ingresar</button>
          )}
        </div>
      )}
    </header>
  );
};

// Página Principal
const HomePage = () => {
  const { products, setCurrentPage, currentUser } = useApp();

  const handleReserve = (productId) => {
    if (!currentUser) {
      alert('Debe iniciar sesión para reservar productos');
      setCurrentPage('login');
      return;
    }
    setCurrentPage('reserve');
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h2 style={styles.heroTitle}>Bienvenido a Las Rojas</h2>
        <p style={styles.heroSubtitle}>Los mejores vinos seleccionados para ti</p>
      </div>

      <div style={styles.productsGrid}>
        {products.map(product => (
          <div key={product.id} style={styles.productCard}>
            <div style={styles.productImage}>{product.image}</div>
            <h3 style={styles.productName}>{product.name}</h3>
            <p style={styles.productPrice}>${product.price.toFixed(2)}</p>
            <p style={styles.productStock}>Stock: {product.stock} unidades</p>
            <button 
              style={product.stock > 0 ? styles.reserveButton : styles.reserveButtonDisabled}
              onClick={() => handleReserve(product.id)}
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? 'Reservar' : 'Agotado'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Página de Reserva
const ReservePage = () => {
  const { products, currentUser, createOrder, setCurrentPage } = useApp();
  const [selectedProduct, setSelectedProduct] = useState('');

  const handleSubmit = () => {
    if (!selectedProduct) {
      alert('Por favor seleccione un producto');
      return;
    }

    createOrder(parseInt(selectedProduct));
    alert('¡Reserva realizada con éxito! Puede ver sus compras en "Mis Compras"');
    setCurrentPage('myOrders');
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.formTitle}>Reservar Producto</h2>
        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Seleccione un producto:</label>
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">-- Seleccione --</option>
              {products.filter(p => p.stock > 0).map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price.toFixed(2)} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Cliente:</label>
            <input 
              type="text" 
              value={currentUser?.name || ''} 
              style={styles.input}
              disabled
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Correo:</label>
            <input 
              type="email" 
              value={currentUser?.email || ''} 
              style={styles.input}
              disabled
            />
          </div>

          <button onClick={handleSubmit} style={styles.submitButton}>
            Confirmar Reserva
          </button>
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

// Página de Login/Registro
const LoginPage = () => {
  const { login, register, setCurrentPage } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleSubmit = () => {
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      alert('Por favor complete todos los campos');
      return;
    }

    if (isLogin) {
      const result = login(formData.email, formData.password);
      if (result.success) {
        setCurrentPage('home');
      } else {
        alert(result.message);
      }
    } else {
      const result = register(formData.email, formData.password, formData.name);
      if (result.success) {
        alert(result.message);
        setIsLogin(true);
      } else {
        alert(result.message);
      }
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

          <button onClick={handleSubmit} style={styles.submitButton}>
            {isLogin ? 'Ingresar' : 'Registrarse'}
          </button>
        </div>

        <button 
          style={styles.toggleButton}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>

        {!isLogin && (
          <div style={styles.infoBox}>
            <p style={styles.infoText}>ℹ️ Use un correo de Gmail válido para registrarse</p>
            <p style={styles.infoText}>👤 Admin: diegoghc7002@gmail.com</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Panel de Cliente - Mis Compras
const MyOrdersPage = () => {
  const { orders, currentUser } = useApp();
  const userOrders = orders.filter(o => o.userId === currentUser?.id);

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
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <h3 style={styles.orderTitle}>Pedido #{order.id}</h3>
                <span style={styles.orderStatus}>{order.status}</span>
              </div>
              <p style={styles.orderDetail}><strong>Producto:</strong> {order.productName}</p>
              <p style={styles.orderDetail}><strong>Precio:</strong> ${order.price.toFixed(2)}</p>
              <p style={styles.orderDetail}><strong>Fecha:</strong> {new Date(order.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Panel de Administrador
const AdminPage = () => {
  const { orders, products, users } = useApp();
  
  const totalSales = orders.reduce((sum, order) => sum + order.price, 0);
  const totalProducts = products.reduce((sum, p) => sum + p.stock, 0);
  const clientCount = users.filter(u => u.role === 'client').length;

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Panel de Administración</h2>
      
      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <TrendingUp size={32} style={{ color: '#721c24' }} />
          <h3 style={styles.statValue}>${totalSales.toFixed(2)}</h3>
          <p style={styles.statLabel}>Ventas Totales</p>
        </div>
        
        <div style={styles.statCard}>
          <Package size={32} style={{ color: '#721c24' }} />
          <h3 style={styles.statValue}>{orders.length}</h3>
          <p style={styles.statLabel}>Pedidos</p>
        </div>
        
        <div style={styles.statCard}>
          <User size={32} style={{ color: '#721c24' }} />
          <h3 style={styles.statValue}>{clientCount}</h3>
          <p style={styles.statLabel}>Clientes</p>
        </div>
        
        <div style={styles.statCard}>
          <ShoppingCart size={32} style={{ color: '#721c24' }} />
          <h3 style={styles.statValue}>{totalProducts}</h3>
          <p style={styles.statLabel}>Stock Total</p>
        </div>
      </div>

      {/* Todos los pedidos */}
      <div style={styles.adminSection}>
        <h3 style={styles.sectionTitle}>Todas las Compras</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>ID</th>
                <th style={styles.tableHeader}>Cliente</th>
                <th style={styles.tableHeader}>Producto</th>
                <th style={styles.tableHeader}>Precio</th>
                <th style={styles.tableHeader}>Fecha</th>
                <th style={styles.tableHeader}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>#{order.id}</td>
                  <td style={styles.tableCell}>{order.userName}</td>
                  <td style={styles.tableCell}>{order.productName}</td>
                  <td style={styles.tableCell}>${order.price.toFixed(2)}</td>
                  <td style={styles.tableCell}>{new Date(order.date).toLocaleDateString()}</td>
                  <td style={styles.tableCell}>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Productos */}
      <div style={styles.adminSection}>
        <h3 style={styles.sectionTitle}>Productos en Venta</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>ID</th>
                <th style={styles.tableHeader}>Producto</th>
                <th style={styles.tableHeader}>Precio</th>
                <th style={styles.tableHeader}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>#{product.id}</td>
                  <td style={styles.tableCell}>{product.name}</td>
                  <td style={styles.tableCell}>${product.price.toFixed(2)}</td>
                  <td style={styles.tableCell}>{product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
  const { currentPage, currentUser } = useApp();

  return (
    <div style={styles.app}>
      <Header />
      <main style={styles.main}>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'reserve' && <ReservePage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'login' && <LoginPage />}
        {currentPage === 'myOrders' && <MyOrdersPage />}
        {currentPage === 'admin' && currentUser?.role === 'admin' && <AdminPage />}
      </main>
      <footer style={styles.footer}>
        <p>© 2026 Las Rojas - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

// Estilos
const styles = {
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
  logo: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    margin: 0,
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
  },
  productImage: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  productName: {
    fontSize: '1.3rem',
    marginBottom: '0.5rem',
    color: '#fff',
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
  reserveButton: {
    backgroundColor: '#721c24',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
    width: '100%',
  },
  reserveButtonDisabled: {
    backgroundColor: '#555',
    color: '#999',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'not-allowed',
    fontWeight: 'bold',
    width: '100%',
  },
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
    border: '2px solid #721c24',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
  },
  select: {
    padding: '0.75rem',
    borderRadius: '5px',
    border: '2px solid #721c24',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
  },
  textarea: {
    padding: '0.75rem',
    borderRadius: '5px',
    border: '2px solid #721c24',
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
  adminSection: {
    marginBottom: '3rem',
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
  footer: {
    backgroundColor: '#721c24',
    padding: '1.5rem',
    textAlign: 'center',
    marginTop: '3rem',
  },
};

export default App;