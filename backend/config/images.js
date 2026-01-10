// Configuración de imágenes y productos para Las Rojas - Perfumes y Toallas

const productImages = {
  // PERFUMES
  'perfume-chanel.jpg': {
    path: '/backend/public/images/perfume-chanel.jpg',
    suggestedSize: '400x400',
    description: 'Imagen del perfume Chanel N°5'
  },
  'perfume-dior.jpg': {
    path: '/backend/public/images/perfume-dior.jpg',
    suggestedSize: '400x400',
    description: 'Imagen del perfume Dior Sauvage'
  },
  'perfume-tomford.jpg': {
    path: '/backend/public/images/perfume-tomford.jpg',
    suggestedSize: '400x400',
    description: 'Imagen del perfume Tom Ford Black Orchid'
  },
  'perfume-flowerbomb.jpg': {
    path: '/backend/public/images/perfume-flowerbomb.jpg',
    suggestedSize: '400x400',
    description: 'Imagen del perfume Viktor&Rolf Flowerbomb'
  },

  // TOALLAS
  'toalla-premium.jpg': {
    path: '/backend/public/images/toalla-premium.jpg',
    suggestedSize: '600x400',
    description: 'Imagen de la toalla de baño premium'
  },
  'toalla-spa.jpg': {
    path: '/backend/public/images/toalla-spa.jpg',
    suggestedSize: '600x400',
    description: 'Imagen del juego de toallas spa'
  },
  'toalla-playa.jpg': {
    path: '/backend/public/images/toalla-playa.jpg',
    suggestedSize: '600x400',
    description: 'Imagen de la toalla de playa XL'
  },
  'toalla-yoga.jpg': {
    path: '/backend/public/images/toalla-yoga.jpg',
    suggestedSize: '600x400',
    description: 'Imagen de la toalla de yoga'
  },
  'toalla-bambu.jpg': {
    path: '/backend/public/images/toalla-bambu.jpg',
    suggestedSize: '600x400',
    description: 'Imagen de las toallas de mano de bambú'
  },
  'toalla-turkish.jpg': {
    path: '/backend/public/images/toalla-turkish.jpg',
    suggestedSize: '600x400',
    description: 'Imagen de la toalla corporal turca'
  }
};

// CONFIGURACIÓN DE SERVIDOR PARA IMÁGENES
const express = require('express');
const path = require('path');

// Agregar esto a tu server.js para servir imágenes estáticas
const setupStaticFiles = (app) => {
  // Servir imágenes de productos
  app.use('/images', express.static(path.join(__dirname, 'public/images')));
  
  console.log('📁 Servidor de imágenes configurado en: /backend/public/images');
};

module.exports = { productImages, setupStaticFiles };