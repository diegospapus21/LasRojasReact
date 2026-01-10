# 🌟 GUÍA DE IMÁGENES - PERFUMES Y TOALLAS

## 📸 Dónde Poner Tus Imágenes

### **Ubicación de las imágenes:**
```
C:\Users\Diego Hernandez\las-rojas\backend\public\images\
```

## 🏷️ Nombres de Archivo Requeridos

### **PERFUMES:**
1. `perfume-chanel.jpg` - Chanel N°5 Eau de Parfum
2. `perfume-dior.jpg` - Dior Sauvage Eau de Toilette  
3. `perfume-tomford.jpg` - Tom Ford Black Orchid
4. `perfume-flowerbomb.jpg` - Viktor&Rolf Flowerbomb

### **TOALLAS:**
5. `toalla-premium.jpg` - Toalla de Baño Premium Algodón Egipcio
6. `toalla-spa.jpg` - Juego de Toallas Spa 4 Piezas
7. `toalla-playa.jpg` - Toalla Playa XL Gran Absorción
8. `toalla-yoga.jpg` - Toalla Yoga Mat Fitness
9. `toalla-bambu.jpg` - Toalla de Mano Lujo Rayón Bambú
10. `toalla-turkish.jpg` - Toalla Corporal Turkish Cotton

## 📋 Especificaciones Técnicas

### **Tamaño Recomendado:**
- **Perfumes:** 400x400 píxeles (cuadradas)
- **Toallas:** 600x400 píxeles (rectangulares)
- **Formato:** JPG o PNG
- **Tamaño máximo:** 500KB por imagen

### **Calidad:**
- Alta calidad pero optimizada para web
- Fondo blanco o transparente para productos
- Buena iluminación
- Producto centrado y visible

## 🛠️ Cómo Cambiar Precios y Descripciones

### **Para cambiar PRECIOS:**
Edita el archivo: `backend/scripts/seed.js`

```javascript
// Ejemplo: Cambiar precio del Chanel N°5 de $185.99 a $199.99
{
  name: 'Chanel N°5 Eau de Parfum',
  price: 199.99,  // ← CAMBIA AQUÍ
  stock: 15,
  // ...
}
```

### **Para cambiar DESCRIPCIONES:**
Edita el mismo archivo `backend/scripts/seed.js`

```javascript
// Ejemplo: Cambiar descripción del Chanel
{
  name: 'Chanel N°5 Eau de Parfum',
  description: 'Tu nueva descripción personalizada aquí...', // ← CAMBIA AQUÍ
  // ...
}
```

### **Para cambiar STOCK:**
Edita el mismo archivo `backend/scripts/seed.js`

```javascript
// Ejemplo: Cambiar stock a 50 unidades
{
  name: 'Chanel N°5 Eau de Parfum',
  stock: 50,  // ← CAMBIA AQUÍ
  // ...
}
```

## 🔄 Cómo Aplicar los Cambios

### **Paso 1: Agrega tus imágenes**
1. Copia tus 10 imágenes en: `backend/public/images/`
2. Asegúrate que tengan los nombres exactos mencionados arriba

### **Paso 2: Modifica precios/descripciones**
1. Abre: `backend/scripts/seed.js`
2. Modifica los valores que necesites
3. Guarda el archivo

### **Paso 3: Actualiza la base de datos**
```bash
cd backend
npm run seed -- --clear
```

### **Paso 4: Reinicia el backend**
```bash
npm run dev
```

## 📝 Modificaciones Adicionales

### **Para agregar un NUEVO producto:**
1. Agrega la imagen a `backend/public/images/`
2. Añade el objeto al array `initialProducts` en `seed.js`

```javascript
{
  name: 'Nombre de tu Producto',
  description: 'Descripción detallada...',
  price: 99.99,
  stock: 20,
  image: '/images/nombre-de-tu-imagen.jpg',
  category: 'perfume', // o 'toalla'
  subcategory: 'femenino', // o 'masculino', 'baño', etc.
  tags: ['etiqueta1', 'etiqueta2']
}
```

### **Para eliminar un producto:**
1. Borra su imagen de `backend/public/images/`
2. Elimina el objeto del array `initialProducts` en `seed.js`
3. Ejecuta `npm run seed -- --clear`

## 🎨 Sugerencias de Imágenes

### **Para Perfumes:**
- Foto frontal del frasco
- Con buen iluminación
- Fondo blanco o neutral
- Muestra el logo de la marca claramente

### **Para Toallas:**
- Extendida o doblada elegantemente
- Muestra la textura del tejido
- En ambiente de baño o spa
- Colores realistas

## ⚡ URLs de Acceso a Imágenes

Una vez configurado, tus imágenes serán accesibles en:
```
http://localhost:5000/images/perfume-chanel.jpg
http://localhost:5000/images/toalla-premium.jpg
// etc...
```

## 🚨 Notas Importantes

1. **Los nombres de archivo deben ser EXACTOS** (incluyendo mayúsculas/minúsculas)
2. **Las imágenes deben estar en JPG o PNG**
3. **No uses espacios en los nombres de archivo**
4. **Siempre ejecuta el seed después de hacer cambios**
5. **Haz backup de tus imágenes antes de cambios importantes**

## 📞 Si Necesitas Ayuda

1. **Verifica que las imágenes estén en la carpeta correcta**
2. **Revisa los nombres de archivo**
3. **Ejecuta el seed con --clear para resetear**
4. **Reinicia el servidor backend**

¡Listo! Ahora tu tienda tendrá perfumes y toallas con tus propias imágenes. 🌟🛍️