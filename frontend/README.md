# La Quesería — Frontend

React + Vite + Tailwind. Es tu diseño HTML convertido a una aplicación conectada al backend (`axios` + `react-router-dom`),
con modo claro opcional y diseño responsive (celular, tableta y escritorio).

## Cómo ejecutarlo

1. **Backend** (carpeta `backend`): con tu `.env` ya listo, `npm install` y `npm run dev` (queda en `http://localhost:5000`).
2. **Frontend** (carpeta `frontend`): `npm install` y `npm run dev`. Abre `http://localhost:5173`.
3. En `frontend/.env` debe estar `VITE_API_URL=http://localhost:5000/api` y, para ver las fotos, `VITE_CLOUDINARY_CLOUD_NAME`
   con el nombre de tu nube de Cloudinary (es un dato público). Hay un modelo en `frontend/.env.example`.

Si el catálogo se ve vacío es porque la base de datos aún no tiene productos: usa **Agregar Nuevo Producto**.
Un mensaje rojo con "Reintentar" significa que el backend está apagado o su `.env` está mal.

## Dos modos, detectados solos

El frontend pregunta al backend `GET /api/auth/estado`:

| | Backend actual (modo básico) | Backend con la carpeta `backend-extension` (modo completo) |
|---|---|---|
| Acceso | Se abre sin sesión | Inicio de sesión con rol: Administrador, Jefe de inventario o Empleado |
| Productos | Catálogo, registrar, editar, eliminar, fotos | Igual, pero solo el administrador crea, edita y elimina |
| Inventario | Ajuste de stock (sin historial) | Ajuste de stock con historial de ingresos |
| Punto de venta | Descuenta el stock; la venta no queda guardada | Guarda la venta, calcula IVA y total en el servidor |
| Reportes | Reportes de inventario: valor, rentabilidad por precios, alertas y vencimientos | **Reportes mensuales**: ventas por producto, ingresadas vs vendidas, más y menos rentables, comparación con el mes anterior y detalle diario |
| Usuarios y perfil | No disponible | Usuarios y roles, mi perfil con foto, cambio de contraseña, eliminar cuenta |

El frontend no guarda nada simulado en el navegador: solo el token de sesión y la preferencia de modo claro/oscuro.

## Roles (modo completo)

| Módulo | Administrador | Jefe de inventario | Empleado |
|---|:-:|:-:|:-:|
| Catálogo | Sí | Sí | Sí |
| Crear, editar y eliminar productos | Sí | No | No |
| Inventario y stock | Sí | Sí | No |
| Punto de venta | Sí | Sí | Sí |
| Reportes mensuales | Sí | Sí | No |
| Usuarios y roles | Sí | No | No |
| Mi perfil | Sí | Sí | Sí |

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Versión de producción |
| `npm run lint` | Revisa el código (oxlint) |

## Estructura de `src/`

```
main.jsx · App.jsx        Arranque (proveedores) y rutas
index.css                 Tailwind, colores y tipografías de tu diseño (modo oscuro y claro)
services/                 Conexión con el backend: api.js (axios + token), productService, stockService,
                          salesService, reportService, authService, userService, systemService
context/                  Estado compartido: Toast, Capabilities (qué soporta el backend), Auth, Products, Ticket
hooks/                    useAuth, useProducts, useTicket, useCheckout, useToast, useCapabilities, useServerStatus, useTheme
utils/                    Funciones puras: format, products, inventory, sales, reports, constants, icons
components/               Navbar, Layout, Modal, ProductCard, Toast... y subcarpetas products/, inventory/, pos/, reports/, users/
pages/                    Login, Catalog, Inventory, Pos, Reports, Users, Profile
```

Lo que el backend actual no puede hacer y cómo agregarlo está en `PENDIENTES_BACKEND.md` y en `backend-extension/LEEME.md`.
