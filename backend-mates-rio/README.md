# Backend - Mates Río API REST

Servidor backend desarrollado en Node.js y Express para la plataforma de comercio electrónico de **Mates Río**.

## Arquitectura del Proyecto

```text
backend-mates-rio/
├── .env.example              # Variables de entorno de referencia
├── .gitignore                # Archivos ignorados por git
├── package.json              # Dependencias y scripts
├── server.js                 # Punto de entrada del servidor HTTP
└── src/
    ├── app.js                # Configuración de Express, CORS y middlewares
    ├── config/
    │   └── db.js             # Conexión a base de datos (MongoDB/PostgreSQL/Supabase)
    ├── controllers/          # Lógica de negocio
    │   ├── authController.js     # Login y perfiles
    │   ├── ordersController.js   # Gestión de pedidos y estados
    │   └── productsController.js # Catálogo, filtros y stock
    ├── data/                 # Datos iniciales / Seed
    │   ├── initialProducts.json  # Catálogo base de 22 productos Mates Río
    │   └── initialUsers.json     # Credenciales de administradores
    ├── middlewares/          # Middlewares de Express
    │   ├── authMiddleware.js     # Validación de tokens de sesión
    │   └── errorHandler.js       # Manejo centralizado de 404 y 500
    ├── models/               # Modelos de datos
    │   ├── Order.js              # Modelo de Órdenes
    │   ├── Product.js            # Modelo de Productos
    │   └── User.js               # Modelo de Usuarios
    └── routes/               # Rutas y endpoints REST
        ├── authRoutes.js         # /api/auth/*
        ├── index.js              # Enrutador principal y /api/health
        ├── ordersRoutes.js       # /api/orders/*
        └── productsRoutes.js     # /api/products/*
```

## Endpoints Disponibles

### 🩺 Sistema
- `GET /api/health`: Estado del servidor y tiempo de actividad.

### 🧉 Productos
- `GET /api/products`: Lista de productos (admite query params: `?category=mates`, `?search=imperial`, `?minPrice=30000`, `?maxPrice=80000`).
- `GET /api/products/:id`: Obtiene un producto por ID.
- `POST /api/products`: Crear un nuevo producto (requiere autorización de administrador).
- `PUT /api/products/:id`: Actualizar datos o stock de un producto (requiere autorización).
- `DELETE /api/products/:id`: Eliminar un producto (requiere autorización).

### 📦 Órdenes / Pedidos
- `GET /api/orders`: Lista de órdenes registradas (requiere autorización).
- `GET /api/orders/:id`: Detalle de una orden específica.
- `POST /api/orders`: Registrar una nueva compra o pedido desde el checkout/personalizador.
- `PATCH /api/orders/:id/status`: Actualizar estado (`pendiente`, `en_produccion`, `enviado`, `entregado`, `cancelado`).

### 🔐 Autenticación
- `POST /api/auth/login`: Iniciar sesión administrativa con email y password.
- `GET /api/auth/me`: Obtener información del usuario autenticado.

## Instalación y Ejecución

1. Navegar a esta carpeta:
```bash
cd backend-mates-rio
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo de entorno `.env` a partir del ejemplo:
```bash
cp .env.example .env
```

4. Iniciar en modo desarrollo:
```bash
npm run dev
```

El servidor quedará disponible en [http://localhost:5000](http://localhost:5000).
