# Mates Río - Proyecto Integral

Bienvenido a la estructura principal del proyecto **Mates Río**. El proyecto se encuentra modularizado en dos áreas independientes para maximizar la mantenibilidad, escalabilidad y orden:

```text
mates_rio/
├── frontend-mates-rio/    # Todo el código del cliente web (tienda, personalizador, panel admin y assets)
├── backend-mates-rio/     # API REST y servidor Node.js/Express (rutas, controladores, modelos)
├── package.json           # Scripts de orquestación a nivel raíz
└── README.md              # Documentación general
```

---

## 🎨 [Frontend (`frontend-mates-rio`)](./frontend-mates-rio/README.md)
Contiene la aplicación web completa:
- **Tienda**: `index.html`, `catalogo.html`, `promos.html`.
- **Experiencia de Personalización**: `personaliza-tu-mate.html`.
- **Panel de Administración**: `admin.html`.
- **Estilos y Scripts**: Carpetas `css/`, `js/` y `assets/`.

Para iniciar el frontend:
```bash
cd frontend-mates-rio
npm run dev
```
O directamente desde la raíz:
```bash
npm run dev:front
```

---

## ⚙️ [Backend (`backend-mates-rio`)](./backend-mates-rio/README.md)
Contiene la API REST desarrollada en Node.js y Express con arquitectura modular:
- **`src/controllers/`**: Controladores de productos, órdenes y autenticación.
- **`src/models/`**: Modelos de datos y consultas.
- **`src/routes/`**: Endpoints REST con verificación de roles/seguridad.
- **`src/data/`**: Base de datos inicial con los 22 productos y credenciales de Mates Río.

Para instalar y levantar el backend:
```bash
cd backend-mates-rio
npm install
npm run dev
```
O directamente desde la raíz:
```bash
npm run install:all
npm run dev:back
```
El servidor backend correrá en `http://localhost:5000` con su endpoint de comprobación en `http://localhost:5000/api/health`.
