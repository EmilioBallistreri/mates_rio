# Frontend - Mates Río

Este directorio contiene todo el código del cliente web (tienda pública, personalizador interactivo de mates y panel de administración).

## Estructura de Carpetas

- **`index.html`**: Página principal (Home / Hero / Destacados / Reseñas).
- **`catalogo.html`** / **`catalogo/`**: Catálogo completo con filtros de categorías, búsqueda y ordenamiento.
- **`promos.html`** / **`promos/`**: Sección de promociones y combos especiales.
- **`personaliza-tu-mate.html`** / **`personaliza-tu-mate/`**: Experiencia 3D/interactiva de personalización de mates (bombillas, grabados, virolas, etc.).
- **`admin.html`** / **`admin/`**: Panel de control administrativo (gestión de catálogo, métricas, pedidos y stock).
- **`css/`**:
  - `styles.css`: Estilos globales de la tienda, layout, componentes y animaciones.
  - `admin.css`: Estilos dedicados para la interfaz del panel de administración.
- **`js/`**:
  - `products.js`: Catálogo base de productos, sincronización con LocalStorage y utilidades de precios.
  - `app.js`: Lógica principal del e-commerce (carrito, checkout WhatsApp, modales, navegación).
  - `customizer.js`: Motor del personalizador visual de mates y cotizador en vivo.
  - `admin.js`: Lógica del panel administrativo (autenticación, CRUD de productos, órdenes y reportes).
- **`assets/`**:
  - `images/`: Banners, logos, fotos de productos y categorías.

## Cómo ejecutar en desarrollo

Para levantar el servidor web estático localmente:

```bash
# Estando dentro de frontend-mates-rio:
npm run dev
# O utilizando npx serve directamente:
npx serve -l 5005
```

Abrir en el navegador en [http://localhost:5005](http://localhost:5005).
