import React, { useState, createContext, useContext } from 'react';
import { Mail, ShoppingCart, User, Package, TrendingUp, LogOut, Menu, X, Search, Filter, Plus, Edit, Trash2, PlusCircle, MinusCircle } from 'lucide-react';
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
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    fetchProducts,
    fetchOrders,
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
        <h1 style={styles.logo} onClick={() => setCurrentPage('home')}>🍷 Las Rojas</h1>
        
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
        <p style={styles.heroSubtitle}>Los mejores vinos seleccionados para ti</p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <Search size={20} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar productos..."
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
            <option value="vino">Vinos</option>
            <option value="champagne">Champagne</option>
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
              <div style={styles.productImage}>{product.image}</div>
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
                  <div style={styles.itemImage}>{item.product.image}</div>
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
              <div style={[styles.summaryRow, styles.summaryTotal]}>
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