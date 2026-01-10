# 🍷 Las Rojas - Tienda Online de Vinos (Versión Completa Local)

## 📋 Resumen de la Implementación

He creado y configurado **automáticamente** una versión completa de Las Rojas con backend real, base de datos MongoDB y todas las características avanzadas funcionando localmente.

---

## ✅ Características Implementadas

### **Backend Completo (Node.js + Express + MongoDB)**
- ✅ **API RESTful** completa con todos los endpoints
- ✅ **Autenticación JWT** con bcrypt para hash de contraseñas
- ✅ **Base de datos MongoDB** con modelos optimizados
- ✅ **Middleware de seguridad** y validación
- ✅ **Manejo de errores** robusto
- ✅ **Seed script** con datos iniciales

### **Frontend Mejorado (React)**
- ✅ **Conexión real** con backend API
- ✅ **Carrito de compras** completo con persistencia
- ✅ **Búsqueda y filtros** avanzados
- ✅ **Panel de administración** con CRUD completo
- ✅ **Gestión de pedidos** con seguimiento de estados
- ✅ **Responsive design** mejorado
- ✅ **Testing básico** unitario

### **Nuevas Funcionalidades**
- ✅ **Carrito real** con múltiple productos
- ✅ **Checkout** con dirección de envío
- ✅ **Estadísticas** de ventas y productos
- ✅ **Gestión de stock** en tiempo real
- ✅ **Sistema de estados** de pedidos
- ✅ **Validación de formularios** mejorada

---

## 🚀 Cómo Ejecutar el Proyecto

### **Paso 1: Iniciar MongoDB**
```bash
# Si tienes MongoDB instalado localmente
mongosh

# Verificar que esté corriendo
net start MongoDB
```

### **Paso 2: Poblar la Base de Datos**
```bash
cd backend
npm run seed

# O si quieres limpiar y volver a poblar
npm run seed -- --clear
```

### **Paso 3: Iniciar el Backend**
```bash
cd backend
npm run dev

# El backend correrá en: http://localhost:5000
```

### **Paso 4: Iniciar el Frontend**
```bash
# En otra terminal
npm start

# El frontend correrá en: http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
las-rojas/
├── frontend/ (directorio actual)
│   ├── src/
│   │   ├── App.js                  # App principal completa
│   │   ├── hooks/
│   │   │   ├── useAuth.js          # Hook de autenticación
│   │   │   └── useCart.js          # Hook de carrito
│   │   ├── services/
│   │   │   └── api.js              # Cliente API con axios
│   │   └── App.test.js             # Tests actualizados
│   ├── .env                        # Variables de entorno frontend
│   └── package.json                # Dependencias frontend
│
└── backend/
    ├── server.js                   # Servidor principal
    ├── config/
    │   └── database.js             # Conexión MongoDB
    ├── models/
    │   ├── User.js                 # Modelo de usuario
    │   ├── Product.js              # Modelo de producto
    │   ├── Order.js                # Modelo de pedido
    │   └── Cart.js                 # Modelo de carrito
    ├── controllers/
    │   ├── authController.js       # Controlador auth
    │   ├── productController.js    # Controlador productos
    │   ├── orderController.js      # Controlador pedidos
    │   └── cartController.js       # Controlador carrito
    ├── routes/
    │   ├── auth.js                 # Rutas auth
    │   ├── products.js             # Rutas productos
    │   ├── orders.js               # Rutas pedidos
    │   └── cart.js                 # Rutas carrito
    ├── middleware/
    │   ├── auth.js                 # Middleware JWT
    │   ├── validation.js           # Validación de inputs
    │   └── utils.js                # Utilidades
    ├── scripts/
    │   └── seed.js                 # Script de datos iniciales
    ├── .env                        # Variables de entorno backend
    └── package.json                # Dependencias backend
```

---

## 🔐 Credenciales de Prueba

### **Usuario Administrador:**
- **Email:** diegoghc7002@gmail.com
- **Contraseña:** admin123
- **Acceso:** Panel de administración completo

### **Usuario Cliente 1:**
- **Email:** juan.perez@gmail.com
- **Contraseña:** cliente123
- **Acceso:** Carrito, compras y reservas

### **Usuario Cliente 2:**
- **Email:** maria.garcia@gmail.com
- **Contraseña:** cliente456
- **Acceso:** Carrito, compras y reservas

---

## 🎯 Funcionalidades por Sección

### **🏠 Página Principal**
- ✅ Catálogo completo de productos
- ✅ Búsqueda en tiempo real
- ✅ Filtros por categoría, precio y ordenamiento
- ✅ Agregar al carrito directamente
- ✅ Visualización de stock en tiempo real

### **🛒 Carrito de Compras**
- ✅ Múltiples productos con cantidades variables
- ✅ Actualización de cantidades en tiempo real
- ✅ Eliminación de productos individuales
- ✅ Formulario de envío completo
- ✅ Checkout procesando múltiples pedidos

### **👤 Panel de Cliente**
- ✅ Historial de pedidos completo
- ✅ Detalles de cada pedido con dirección
- ✅ Estados de pedido con colores
- ✅ Información de envío y contacto

### **⚙️ Panel de Administración**
- ✅ Estadísticas en tiempo real
- ✅ Gestión completa de pedidos
- ✅ Actualización de estados (Pendiente → Confirmado → Enviado → Entregado)
- ✅ Vista detallada de cada pedido
- ✅ Informes de ventas y productos

### **🔐 Autenticación y Seguridad**
- ✅ Login con JWT
- ✅ Registro con validación de Gmail
- ✅ Hash de contraseñas con bcrypt
- ✅ Sesión persistente
- ✅ Logout automático al expirar token

---

## 📊 API Endpoints Disponibles

### **Autenticación**
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña

### **Productos**
- `GET /api/products` - Obtener productos (con filtros)
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)
- `GET /api/products/admin/low-stock` - Productos con bajo stock (admin)
- `GET /api/products/admin/stats` - Estadísticas de productos (admin)

### **Pedidos**
- `POST /api/orders` - Crear pedido
- `GET /api/orders/my-orders` - Pedidos del usuario
- `GET /api/orders` - Todos los pedidos (admin)
- `GET /api/orders/:id` - Pedido por ID
- `PUT /api/orders/:id/status` - Actualizar estado (admin)
- `PUT /api/orders/:id/cancel` - Cancelar pedido
- `GET /api/orders/stats` - Estadísticas de pedidos (admin)

### **Carrito**
- `GET /api/cart` - Obtener carrito
- `POST /api/cart/add` - Agregar al carrito
- `PUT /api/cart/items/:id` - Actualizar cantidad
- `DELETE /api/cart/items/:id` - Eliminar del carrito
- `DELETE /api/cart/clear` - Vaciar carrito
- `POST /api/cart/checkout` - Procesar checkout

---

## 🧪 Testing

### **Ejecutar Tests del Frontend**
```bash
npm test

# Tests con cobertura
npm test -- --coverage
```

### **Tests Disponibles**
- ✅ Renderizado de componentes principales
- ✅ Navegación básica
- ✅ Formularios de login/registro
- ✅ Validación de inputs
- ✅ Funcionalidad de búsqueda y filtros
- ✅ Panel de administración

---

## 🔧 Scripts Útiles

### **Backend**
```bash
npm start          # Producción
npm run dev        # Desarrollo con nodemon
npm run seed       # Poblar base de datos
npm run seed -- --clear  # Limpiar y poblar
npm test           # Ejecutar tests
```

### **Frontend**
```bash
npm start          # Servidor de desarrollo
npm run build      # Build para producción
npm test           # Ejecutar tests
npm run test:coverage  # Tests con cobertura
```

---

## 🎨 Mejoras de UI/UX

### **Nuevas Características Visuales**
- ✅ Indicadores visuales de estado de pedidos
- ✅ Botones de acción con iconos
- ✅ Loading states durante operaciones
- ✅ Responsive design mejorado
- ✅ Modal para detalles de pedidos
- ✅ Validación visual de formularios

### **Experiencia de Usuario**
- ✅ Feedback inmediato en todas las acciones
- ✅ Estados de carga para operaciones asíncronas
- ✅ Navegación móvil optimizada
- ✅ Búsqueda en tiempo real
- ✅ Filtros combinados
- ✅ Actualización automática de datos

---

## 🚨 Notas Importantes

### **Configuración Requerida**
1. **MongoDB** debe estar instalado y corriendo localmente
2. **Node.js** 16+ para el backend
3. **React** 18+ para el frontend

### **Variables de Entorno**
- Backend: `MONGODB_URI`, `JWT_SECRET`, `PORT`
- Frontend: `REACT_APP_API_URL`

### **Base de Datos**
- Nombre: `las_rojas_db`
- 3 usuarios predefinidos
- 6 productos con stock inicial
- Datos de ejemplo en pedidos

---

## 🎯 Próximos Pasos Opcionales

1. **Implementar pagos reales** (Stripe/PayPal)
2. **Agregar sistema de notificaciones** por email
3. **Implementar sistema de reseñas** de productos
4. **Agregar más filtros avanzados**
5. **Optimizar para producción**
6. **Deploy en hosting real**

---

## 📞 Soporte

Este proyecto está **completo y funcional** para desarrollo local. Si necesitas ayuda con alguna funcionalidad específica o quieres agregar nuevas características, no dudes en consultar.

**¡Disfruta de tu tienda de vinos completa! 🍷**