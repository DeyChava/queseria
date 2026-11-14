# Requerimientos pendientes del backend – Sistema de gestión de la quesería

## 1. Inicio de sesión y gestión de usuarios

Se necesita que el sistema de autenticación que permita identificar a cada usuario y controlar sus permisos según su rol.

**Requerimientos:**
- Registro de nuevos usuarios.
- Inicio y cierre de sesión.
- Validación de correo electrónico y contraseña.
- Almacenamiento seguro de las contraseñas mediante cifrado hash.
- Identificación del usuario que inició sesión.
- Control de acceso según el rol asignado.

**Roles del sistema:**
- **Administrador:** acceso completo al sistema, gestión de usuarios y productos.
- **Jefe de inventario:** control de existencias, entradas, salidas y reportes.
- **Empleado:** consulta de productos y registro de ventas.

**Endpoints**
- `POST /api/auth/registro`
- `POST /api/auth/login`
- `GET /api/auth/estado`
- `GET /api/auth/yo`

## 2. Gestión de perfiles y usuarios

Se necesita permitir que los usuarios administren su información personal.

**Requerimientos:**
- Consultar la lista de usuarios registrados.
- Editar el nombre y la fotografía del perfil.
- Cambiar la contraseña.
- Eliminar la propia cuenta.
- Permitir al administrador cambiar los roles de otros usuarios.
- Permitir al administrador eliminar usuarios.
- Restablecer contraseñas de otros usuarios mediante una contraseña temporal.

**Endpoints:**
- `GET /api/usuarios`
- `PATCH /api/usuarios/yo`
- `POST /api/usuarios/yo/password`
- `DELETE /api/usuarios/yo`
- `PATCH /api/usuarios/:id/rol`
- `POST /api/usuarios/:id/restablecer-password`
- `DELETE /api/usuarios/:id`

## 3. Gestión de inventario y movimientos de stock

Actualmente se necesita complementar el inventario con un historial que permita conocer todos los cambios realizados en las existencias.

**Requerimientos:**
- Registrar entradas de productos al inventario.
- Registrar salidas y ajustes de stock.
- Guardar la cantidad modificada.
- Registrar el tipo de movimiento (entrada, salida, ajuste o venta).
- Guardar la fecha del movimiento.
- Identificar al usuario responsable.
- Permitir consultar el historial de movimientos.
- Evitar que las existencias sean negativas.
- Mantener actualizado el stock después de cada operación.

**Endpoints:**
- `POST /api/productos/:id/stock`

El registro de movimientos debe conservar el historial para poder generar los reportes mensuales.

## 4. Registro y almacenamiento de ventas

Se necesita que las ventas realizadas desde el punto de venta del frontend queden almacenadas en la base de datos.

**Requerimientos:**
- Registrar cada venta.
- Guardar los productos vendidos y sus respectivas cantidades.
- Obtener los precios directamente de la base de datos.
- Guardar el costo de cada producto al momento de la venta.
- Calcular el subtotal.
- Calcular el IVA del 13 %.
- Calcular el total de la venta.
- Registrar el monto recibido y el vuelto.
- Guardar la fecha y hora de la venta.
- Identificar al empleado que realizó la venta.
- Descontar automáticamente las unidades vendidas del inventario.
- Registrar cada venta como un movimiento de salida de stock.
- Evitar ventas cuando no exista suficiente inventario.

**Endpoints:**
- `POST /api/ventas`
- `GET /api/ventas?mes=AAAA-MM`
- `GET /api/ventas?fecha=AAAA-MM-DD`

 importante que cada venta conserve los precios y costos originales, aunque posteriormente se modifique la información del producto.

## 5. Reportes mensuales

Se necesita implementar un apartado de reportes que permita consultar el rendimiento de la quesería por mes.

**Requerimientos:**

**A. Reporte general de ventas**
- Total de ventas del mes.
- Cantidad de productos vendidos.
- Ingresos totales sin IVA.
- IVA cobrado.
- Ganancia total.
- Ticket promedio.( ayuda a saber cuánto gasta normalmente cada cliente, Comparar las ventas de diferentes meses, Evaluar si los clientes compran más o menos y ayuda a tomar decisiones para aumentar las ventas.)
- Comparación con el mes anterior.

**B. Reporte por producto**
- Nombre del producto.
- Unidades ingresadas al inventario.
- Unidades vendidas.
- Total vendido en colones.
- Costo de los productos vendidos.
- Ganancia obtenida.
- Margen de rentabilidad.

**C. Reporte diario**
- Ventas realizadas por día.
- Total de ingresos diarios.
- Cantidad de productos vendidos diariamente.

**D. Productos más y menos rentables**
- Identificar los productos que generan mayor ganancia.
- Identificar los productos que generan menor ganancia.
- Comparar la rentabilidad de los productos.

**Endpoints:**
- `GET /api/reportes/mensual?mes=AAAA-MM`

## 6. Seguridad y validaciones

Se requiere garantizar la seguridad y consistencia de la información.

**Requerimientos:**
- Validar los permisos de cada usuario antes de ejecutar operaciones.
- Proteger las rutas que requieren autenticación.
- Evitar que usuarios sin permisos modifiquen productos, usuarios o inventarios.
- Validar los datos recibidos desde el frontend.
- Evitar que se registren ventas con cantidades superiores al stock disponible.
- Mantener al menos una cuenta con rol de administrador.
- Registrar correctamente quién realiza cada operación.
- Evitar que una operación incompleta deje inconsistencias en el inventario.

