# La Quesería — Backend

API en Node.js + Express + MongoDB (Mongoose). Cubre los 5 puntos del README del proyecto:
usuarios y roles, perfiles, inventario con historial de movimientos, ventas y reportes mensuales.

## Puesta en marcha

```bash
cd backend
npm install
```

1. **Pon el `.env`** en esta carpeta: **`backend/.env`** (junto a `server.js`). Ya está creado con notas;
   solo completa donde dice `PEGA AQUÍ`. La plantilla sin secretos es `backend/.env.example`.
2. Crea el administrador (una sola vez): `npm run seed:admin`
3. Enciende el servidor: `npm run dev` (desarrollo) o `npm start`
4. En `frontend/` crea también su `.env` (ya está creado; falta `VITE_CLOUDINARY_CLOUD_NAME`) y corre `npm run dev`.

Si falta algo en el `.env`, el servidor no arranca y dice exactamente qué variable falta.

### Variables del `.env`

| Variable | Para qué sirve | Secreta |
|---|---|---|
| `PORT` | Puerto del servidor (5000) | No |
| `FRONTEND_URL` | Dirección del frontend; solo ella puede usar la API (CORS) | No |
| `MONGO_URI` | Conexión a MongoDB Atlas (con el nombre de la base, por ejemplo `/queseria`) | **Sí** |
| `JWT_SECRET` | Firma las sesiones. Mínimo 32 caracteres aleatorios | **Sí** |
| `JWT_EXPIRES_IN` | Duración de la sesión (`8h`) | No |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Fotos de productos y perfiles | Key y Secret: **Sí** |
| `ADMIN_NOMBRE`, `ADMIN_CORREO`, `ADMIN_PASSWORD` | Datos del primer administrador (solo `seed:admin`; contraseña de 12+ caracteres) | Password: **Sí** |
| `CODIGO_ADMIN`, `CODIGO_JEFE`, `CODIGO_EMPLEADO` | Código que se pide en "Crear cuenta" para cada rol. Vacío = ese rol no se puede registrar | **Sí** |
| `TRUST_PROXY` | `true` solo si se publica detrás de un proxy | No |

## Estructura

```
backend/
├── server.js            Arranque: valida el .env, conecta a MongoDB y enciende el servidor
├── app.js               Configura Express (seguridad, CORS, rutas, manejo de errores)
├── config/              env.js · db.js · cloudinary.js · roles.js · constantes.js (IVA, zona horaria)
├── models/              Usuario · Producto · MovimientoStock · Venta · Contador
├── routes/              Qué URL existe y qué rol puede usarla
├── controllers/         Reciben la petición y responden (auth, usuarios, productos, imagenes, ventas, reportes)
├── services/            La lógica importante: stockService · ventaService · reporteService
├── middlewares/         auth (token y roles) · errores · limitadores · subida · validarId
├── utils/               Fechas, números, validaciones, contraseñas, serializadores
├── seed/                crearAdmin.js
└── tests/               Pruebas automáticas (npm test)
```

## Endpoints y permisos

| Método y ruta | Quién | Qué hace |
|---|---|---|
| `GET /api/ping` | Público | El backend está vivo |
| `GET /api/auth/estado` | Público | `{ extension: true, hayUsuarios }` (el frontend lo usa para mostrar el login) |
| `POST /api/auth/registro` | Público + código | Crea cuenta. La primera del sistema es administrador sin código; las demás piden el código de su rol |
| `POST /api/auth/login` | Público | Devuelve `{ token, usuario }`; valida también el rol de acceso elegido |
| `GET /api/auth/yo` | Con sesión | Usuario conectado |
| `GET /api/usuarios` | Admin | Lista de usuarios |
| `PATCH /api/usuarios/yo` | Con sesión | Cambia nombre o foto (`{ nombre?, foto? }`) |
| `POST /api/usuarios/yo/password` | Con sesión | `{ actual, nueva }` |
| `DELETE /api/usuarios/yo` | Con sesión | Elimina la propia cuenta (`{ password }`) |
| `PATCH /api/usuarios/:id/rol` | Admin | Cambia el rol de otro usuario |
| `POST /api/usuarios/:id/restablecer-password` | Admin | Contraseña temporal (se muestra una sola vez; cierra sus sesiones) |
| `DELETE /api/usuarios/:id` | Admin | Elimina un usuario |
| `GET /api/productos`, `GET /api/productos/:id` | Todos | Catálogo (`?buscar=&categoria=&bajoStock=`) |
| `POST/PUT/DELETE /api/productos` | Admin | Crear, editar, eliminar (se desactiva: conserva el historial) |
| `POST /api/productos/:id/stock` | Admin, Jefe | Entrada, salida o ajuste `{ delta, nota, tipo? }` |
| `GET /api/productos/:id/movimientos` | Admin, Jefe | Historial de movimientos del producto |
| `POST /api/imagenes` | Con sesión | Sube una foto (campo `imagen`, JPG/PNG/WebP, 5 MB) |
| `POST /api/ventas` | Todos | Registra la venta `{ items: [{ producto, cantidad }], recibido }` |
| `GET /api/ventas?mes=AAAA-MM` · `?fecha=AAAA-MM-DD` | Todos | Admin y jefe ven todas; el empleado solo las suyas |
| `GET /api/reportes/mensual?mes=AAAA-MM` | Admin, Jefe | Reporte del mes |

Los errores siempre responden `{ "error": "mensaje" }`.

## Reglas que cumple el sistema

- **Stock**: solo cambia con movimientos (entrada, salida, ajuste o venta). Cada movimiento guarda cantidad, tipo, fecha,
  usuario, stock anterior y nuevo. La resta es **atómica**: dos ventas al mismo tiempo no pueden dejar el stock en negativo.
- **Ventas**: los precios y costos salen de la base de datos, nunca del navegador. Cada venta guarda precio y costo del
  momento, subtotal, IVA 13 %, total, recibido, vuelto, fecha y quién vendió. Si algo falla a mitad, el stock se devuelve.
- **Reportes** (siempre con hora de Costa Rica, UTC−6): ventas del mes sin IVA, IVA cobrado, ganancia, ticket promedio y
  comparación con el mes anterior; por producto: ingresadas, vendidas, ventas, costo, ganancia y margen; ventas por día;
  más y menos rentables. Las "unidades ingresadas" cuentan solo los movimientos de tipo *entrada*.
- **Seguridad**: contraseñas con bcrypt, sesión con JWT, CORS limitado al frontend, `helmet`, límite de intentos en
  login y registro, el sistema nunca se queda sin administradores.

## Pruebas

```bash
npm test                                   # 24 pruebas que no necesitan base de datos
MONGO_URI_TEST=mongodb://127.0.0.1:27017/queseria_test npm test   # +12 pruebas con MongoDB real
```
La base de pruebas **se borra al empezar**; por eso su nombre debe contener `test` (si no, se salta).

## Revisión del trabajo del compañero (puntos 1 y 2)

**Estaba bien:** contraseñas con bcrypt (costo 12), JWT, middleware de roles, cuenta de administrador creada por script,
validación de correo y contraseña, no se puede cambiar el propio rol, endpoints de los puntos 1 y 2 presentes.

**Se corrigió:**

1. `productosController.js` tenía marcas de conflicto de Git (`<<<<<<< HEAD`): el servidor no podía ni arrancar. Se resolvió
   conservando la versión que desactiva en vez de borrar (así no se rompe el historial de ventas).
2. `ventasController.js` importaba `models/Venta.js` pero el archivo se llamaba `venta.js`: funciona en Windows y falla en
   Mac, Linux y en cualquier hosting.
3. Productos, imágenes y ventas **no pedían sesión**: cualquiera podía crear o borrar productos, subir fotos y vender.
4. Productos aceptaba `req.body` completo: se podía mandar `stock`, `activo` o `creadoPor`. Ahora solo pasan los campos permitidos.
5. Los nombres no coincidían con el frontend (`correo`/`email`, `administrador`/`admin`, `{mensaje}`/`{error}`, lista de
   usuarios como objeto/arreglo, `/auth/estado` privado/público, perfil con archivo/con `foto`, `passwordActual`/`actual`...).
   Se unificó con lo que ya usa el frontend. Una contraseña incorrecta en el perfil devolvía 401, y el frontend lo toma como
   "sesión vencida" y cerraba la sesión: ahora responde 400.
6. CORS abierto a todo, sin límite de intentos de login, sin `helmet` y sin respuesta 404 para rutas inexistentes.
7. Dependencias con vulnerabilidades conocidas (`mongoose`, `body-parser`): actualizadas. Quedan 2 avisos moderados de
   `nodemon`, que solo se usa en desarrollo.
8. El frontend manda el nombre de la foto de perfil en JSON; para que nadie pueda hacer borrar la foto de otro producto o usuario, una foto solo se borra de Cloudinary cuando ya nadie más la usa.

## Si ya tenían datos en Atlas

- Cuentas creadas con el backend anterior tenían roles `administrador` / `jefe_inventario`. Corre `npm run seed:admin`
  (deja tu cuenta como `admin`) y para las demás cambia el rol desde "Usuarios y roles" o créalas de nuevo.
- La colección `ventas` anterior tenía otros campos: bórrala si solo eran pruebas.
- Los productos que ya tienen stock pero ningún movimiento aparecerán con 0 "ingresadas" ese mes. Para que cuenten, registra
  su ingreso con el botón **+** de Inventario.
