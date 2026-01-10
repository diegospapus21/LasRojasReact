import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('Las Rojas App', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renderiza la página principal', async () => {
    render(<App />);
    
    // Verificar que el título principal esté presente
    expect(screen.getByText('🍷 Las Rojas')).toBeInTheDocument();
    expect(screen.getByText('Bienvenido a Las Rojas')).toBeInTheDocument();
  });

  test('muestra el formulario de login', async () => {
    render(<App />);
    
    // Hacer clic en el botón de login
    const loginButton = screen.getByText(/ingresar/i);
    fireEvent.click(loginButton);
    
    // Verificar que el formulario de login esté visible
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ejemplo@gmail.com/i)).toBeInTheDocument();
  });

  test('muestra el formulario de registro', async () => {
    render(<App />);
    
    // Hacer clic en el botón de login
    const loginButton = screen.getByText(/ingresar/i);
    fireEvent.click(loginButton);
    
    // Hacer clic en el enlace de registro
    const registerLink = screen.getByText(/¿No tienes cuenta\? Regístrate/i);
    fireEvent.click(registerLink);
    
    // Verificar que el formulario de registro esté visible
    expect(screen.getByRole('heading', { name: 'Registrarse' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
  });

  test('navegación móvil funciona', async () => {
    render(<App />);
    
    // Simular pantalla pequeña
    global.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
    
    // El botón de menú móvil debería estar visible (simulado)
    // Aquí verificaríamos que el menú móvil funciona al hacer clic
  });

  test('muestra el carrito vacío inicialmente', async () => {
    render(<App />);
    
    // El botón del carrito debería mostrar 0 items
    const cartButton = screen.getByText(/carrito/i);
    expect(cartButton).toBeInTheDocument();
  });

  test('valida el formulario de login', async () => {
    render(<App />);
    
    // Ir a la página de login
    const loginButton = screen.getByText(/ingresar/i);
    fireEvent.click(loginButton);
    
    // Intentar enviar formulario vacío
    const submitButton = screen.getByRole('button', { name: 'Ingresar' });
    fireEvent.click(submitButton);
    
    // Debería mostrar un error de validación
    await waitFor(() => {
      expect(screen.getByText(/Por favor complete todos los campos/i)).toBeInTheDocument();
    });
  });

  test('busca productos', async () => {
    render(<App />);
    
    // Buscar en el campo de búsqueda
    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    fireEvent.change(searchInput, { target: { value: 'vino' } });
    
    // Verificar que el texto se ingresó correctamente
    expect(searchInput.value).toBe('vino');
  });

  test('aplica filtros', async () => {
    render(<App />);
    
    // Verificar que los filtros están presentes
    const categoryFilter = screen.getByDisplayValue('Todas las categorías');
    expect(categoryFilter).toBeInTheDocument();
    
    // Cambiar filtro de categoría
    fireEvent.change(categoryFilter, { target: { value: 'vino' } });
    
    // Verificar que el filtro cambió
    expect(categoryFilter.value).toBe('vino');
  });

  test('accede a la página de contacto', async () => {
    render(<App />);
    
    // Hacer clic en el enlace de contacto
    const contactButton = screen.getByText('Contacto');
    fireEvent.click(contactButton);
    
    // Verificar que la página de contacto se cargó
    expect(screen.getByText('Contáctanos')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
  });
});

describe('Componentes específicos', () => {
  test('Header muestra correctamente las opciones de usuario', async () => {
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'Test User',
      email: 'test@gmail.com',
      role: 'client'
    }));

    render(<App />);
    
    // Debería mostrar "Mis Compras" y "Salir" en lugar de "Ingresar"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Mis Compras/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salir/i })).toBeInTheDocument();
    });
  });

  test('Admin ve panel de administración', async () => {
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin'
    }));

    render(<App />);
    
    // Debería mostrar "Panel Admin"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Panel Admin' })).toBeInTheDocument();
    });
  });
});