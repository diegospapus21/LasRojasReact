# 🚀 Scripts de Ejecución Automática - Las Rojas

## 📋 Script Principal - Iniciar Todo

### **Windows (run-complete.bat)**
```batch
@echo off
echo 🍷 Iniciando Las Rojas - Versión Completa
echo.

echo 📦 Verificando MongoDB...
net start MongoDB
if errorlevel 1 (
    echo ❌ Error: MongoDB no está instalado o no se pudo iniciar
    echo Por favor, instale MongoDB Community Server
    pause
    exit /b 1
)
echo ✅ MongoDB corriendo

echo.
echo 🗄️ Poblando base de datos...
cd backend
if not exist node_modules (
    echo 📦 Instalando dependencias del backend...
    npm install
)
npm run seed
if errorlevel 1 (
    echo ❌ Error al poblar la base de datos
    pause
    exit /b 1
)
echo ✅ Base de datos poblada

echo.
echo 🔧 Iniciando servidor backend...
start cmd /k "npm run dev"
echo ✅ Backend iniciando en http://localhost:5000

echo.
echo 🎨 Iniciando servidor frontend...
cd ..
start cmd /k "npm start"
echo ✅ Frontend iniciando en http://localhost:3000

echo.
echo 🎉 Las Rojas está corriendo!
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend: http://localhost:5000
echo 📍 API Docs: http://localhost:5000/api/health
echo.
echo 🔐 Credenciales de prueba:
echo    Admin: diegoghc7002@gmail.com / admin123
echo    Cliente: juan.perez@gmail.com / cliente123
echo.
echo Presione cualquier tecla para salir...
pause > nul
```

### **Linux/Mac (run-complete.sh)**
```bash
#!/bin/bash

echo "🍷 Iniciando Las Rojas - Versión Completa"
echo ""

echo "📦 Verificando MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB no está corriendo. Iniciando..."
    sudo systemctl start mongod
    if [ $? -ne 0 ]; then
        echo "❌ Error: No se pudo iniciar MongoDB"
        echo "Por favor, instale MongoDB Community Server"
        exit 1
    fi
fi
echo "✅ MongoDB corriendo"

echo ""
echo "🗄️ Poblando base de datos..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    npm install
fi
npm run seed
if [ $? -ne 0 ]; then
    echo "❌ Error al poblar la base de datos"
    exit 1
fi
echo "✅ Base de datos poblada"

echo ""
echo "🔧 Iniciando servidor backend..."
npm run dev &
BACKEND_PID=$!
echo "✅ Backend iniciando en http://localhost:5000"

echo ""
echo "🎨 Iniciando servidor frontend..."
cd ..
npm start &
FRONTEND_PID=$!
echo "✅ Frontend iniciando en http://localhost:3000"

echo ""
echo "🎉 Las Rojas está corriendo!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend: http://localhost:5000"
echo "📍 API Docs: http://localhost:5000/api/health"
echo ""
echo "🔐 Credenciales de prueba:"
echo "   Admin: diegoghc7002@gmail.com / admin123"
echo "   Cliente: juan.perez@gmail.com / cliente123"
echo ""
echo "Presione Ctrl+C para detener todo"

# Esperar a que el usuario detenga el proceso
wait $BACKEND_PID $FRONTEND_PID
```

## 🛠️ Scripts de Mantenimiento

### **Limpiar y Reiniciar (reset.bat)**
```batch
@echo off
echo 🔄 Reiniciando Las Rojas...

echo 🗑️ Deteniendo procesos...
taskkill /f /im node.exe 2>nul

echo 🗄️ Limpiando base de datos...
cd backend
npm run seed -- --clear

echo 🔧 Reiniciando servicios...
cd ..
start cmd /k "cd backend && npm run dev"
start cmd /k "npm start"

echo ✅ Las Rojas reiniciado exitosamente
pause
```

### **Solo Backend (backend-only.bat)**
```batch
@echo off
echo 🔧 Iniciando solo el backend...

cd backend
if not exist node_modules (
    npm install
)
npm run dev

pause
```

### **Solo Frontend (frontend-only.bat)**
```batch
@echo off
echo 🎨 Iniciando solo el frontend...

if not exist node_modules (
    npm install
)
npm start

pause
```

## 📊 Script de Monitoreo

### **Monitorear Servicios (monitor.bat)**
```batch
@echo off
:loop
cls
echo 📊 Monitoreo de Las Rojas - %date% %time%
echo ========================================

echo.
echo 🔍 Verificando servicios...

rem Verificar MongoDB
sc query MongoDB > nul 2>&1
if errorlevel 1 (
    echo ❌ MongoDB: Detenido
) else (
    echo ✅ MongoDB: Corriendo
)

rem Verificar Backend (puerto 5000)
netstat -an | findstr :5000 > nul
if errorlevel 1 (
    echo ❌ Backend: Detenido (puerto 5000)
) else (
    echo ✅ Backend: Corriendo (puerto 5000)
)

rem Verificar Frontend (puerto 3000)
netstat -an | findstr :3000 > nul
if errorlevel 1 (
    echo ❌ Frontend: Detenido (puerto 3000)
) else (
    echo ✅ Frontend: Corriendo (puerto 3000)
)

echo.
echo 🔄 Actualizando en 10 segundos... (Ctrl+C para salir)
timeout /t 10 > nul
goto loop
```

## 🧪 Scripts de Testing

### **Ejecutar Todos los Tests (test-all.bat)**
```batch
@echo off
echo 🧪 Ejecutando todos los tests...

echo.
echo 📊 Tests del Backend...
cd backend
if not exist node_modules (
    npm install
)
npm test

echo.
echo 🎨 Tests del Frontend...
cd ..
npm test -- --coverage

echo.
echo ✅ Todos los tests completados
pause
```

## 📦 Script de Instalación Automática

### **Instalación Completa (install-all.bat)**
```batch
@echo off
echo 📦 Instalación Completa de Las Rojas
echo ==================================

echo.
echo 🗄️ Verificando MongoDB...
mongo --version > nul 2>&1
if errorlevel 1 (
    echo ❌ MongoDB no está instalado
    echo Por favor, descargue e instale MongoDB Community Server
    echo 📥 https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)
echo ✅ MongoDB encontrado

echo.
echo 📦 Instalando dependencias del Backend...
cd backend
if not exist node_modules (
    npm install
    if errorlevel 1 (
        echo ❌ Error instalando dependencias del backend
        pause
        exit /b 1
    )
)
echo ✅ Backend listo

echo.
echo 📦 Instalando dependencias del Frontend...
cd ..
if not exist node_modules (
    npm install
    if errorlevel 1 (
        echo ❌ Error instalando dependencias del frontend
        pause
        exit /b 1
    )
)
echo ✅ Frontend listo

echo.
echo 🗄️ Poblando base de datos inicial...
cd backend
npm run seed
if errorlevel 1 (
    echo ❌ Error poblando la base de datos
    pause
    exit /b 1
)

echo.
echo 🎉 Instalación completada exitosamente!
echo.
echo Para iniciar la aplicación, ejecute:
echo    🔥 run-complete.bat
echo.
pause
```

## 🌟 Script de Bienvenida

### **Bienvenida y Verificación (welcome.bat)**
```batch
@echo off
echo 🍷 Bienvenido a Las Rojas - Tienda Online de Vinos
echo ===============================================
echo.

echo 📋 Estado del Proyecto:
echo ✅ Backend: Node.js + Express + MongoDB
echo ✅ Frontend: React + Axios
echo ✅ Carrito de compras completo
echo ✅ Panel de administración
echo ✅ Autenticación con JWT
echo ✅ Testing unitario
echo.

echo 🎯 Características Implementadas:
echo    • 🛒 Carrito real con múltiples productos
echo    • 📦 Gestión de inventario en tiempo real
echo    • 📊 Panel de administración con estadísticas
echo    • 🔐 Sistema de usuarios con roles
echo    • 📱 Diseño responsive
echo    • 🔍 Búsqueda y filtros avanzados
echo.

echo 📍 Accesos Rápidos:
echo    🏠 Frontend: http://localhost:3000
echo    ⚙️ Backend: http://localhost:5000
echo    📚 API Health: http://localhost:5000/api/health
echo.

echo 🔐 Credenciales de Prueba:
echo    👤 Administrador:
echo       Email: diegoghc7002@gmail.com
echo       Password: admin123
echo.
echo    👤 Cliente:
echo       Email: juan.perez@gmail.com
echo       Password: cliente123
echo.

echo 🚀 Opciones Disponibles:
echo    [1] Iniciar aplicación completa
echo    [2] Solo backend
echo    [3] Solo frontend
echo    [4] Ejecutar tests
echo    [5] Monitorear servicios
echo    [6] Salir
echo.

set /p choice="Seleccione una opción (1-6): "

if "%choice%"=="1" goto run_complete
if "%choice%"=="2" goto backend_only
if "%choice%"=="3" goto frontend_only
if "%choice%"=="4" goto run_tests
if "%choice%"=="5" goto monitor
if "%choice%"=="6" goto exit

echo Opción inválida
pause
goto exit

:run_complete
call run-complete.bat
goto exit

:backend_only
call backend-only.bat
goto exit

:frontend_only
call frontend-only.bat
goto exit

:run_tests
call test-all.bat
goto exit

:monitor
call monitor.bat
goto exit

:exit
echo ¡Gracias por usar Las Rojas!
```

## 📚 Uso de los Scripts

### **Para Windows:**
1. Copia los scripts `.bat` al directorio raíz del proyecto
2. Ejecuta `welcome.bat` para el menú principal
3. Usa `run-complete.bat` para iniciar todo

### **Para Linux/Mac:**
1. Copia los scripts `.sh` al directorio raíz
2. Da permisos de ejecución: `chmod +x *.sh`
3. Ejecuta: `./run-complete.sh`

### **Requisitos Previos:**
- **MongoDB Community Server** instalado
- **Node.js 16+** instalado
- **Git** (opcional, para control de versiones)

### **Notas Importantes:**
- Los scripts verifican automáticamente el estado de MongoDB
- Instalan dependencias si es necesario
- Pueblan la base de datos con datos de prueba
- Proporcionan feedback visual del proceso

Estos scripts hacen que iniciar y mantener Las Rojas sea súper fácil! 🎉