
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import "./preparar.js";

const URI = process.env.MONGO_URI_TEST;
const omitir = !URI || !/test/i.test(URI.split("/").pop());

let mongoose, servidor, base;
const pedir = async (ruta, { metodo = "GET", cuerpo, token } = {}) => {
  const r = await fetch(base + ruta, {
    method: metodo,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  const texto = await r.text();
  return { status: r.status, datos: texto ? JSON.parse(texto) : null };
};
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const s = {};   // estado compartido entre pasos

before(async () => {
  if (omitir) return;
  ({ default: mongoose } = await import("mongoose"));
  await mongoose.connect(URI);
  await mongoose.connection.dropDatabase();
  const { default: app } = await import("../app.js");
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  servidor = app.listen(0);
  base = `http://127.0.0.1:${servidor.address().port}/api`;
});
after(async () => {
  if (omitir) return;
  servidor.close();
  await mongoose.disconnect();
});

const prueba = (nombre, fn) => test(nombre, { skip: omitir && "define MONGO_URI_TEST" }, fn);

prueba("la primera cuenta es administrador y no pide código", async () => {
  assert.equal((await pedir("/auth/estado")).datos.hayUsuarios, false);
  const r = await pedir("/auth/registro", { metodo: "POST", cuerpo: { nombre: "Dueña Quesería", email: "Admin@Correo.com", password: "clave-segura-1", rol: "empleado" } });
  assert.equal(r.status, 201);
  assert.equal(r.datos.usuario.rol, "admin");
  assert.equal(r.datos.usuario.email, "admin@correo.com");
  assert.equal(r.datos.usuario.password, undefined);
  s.admin = r.datos.token;
  s.adminId = r.datos.usuario._id;
  assert.equal((await pedir("/auth/estado")).datos.hayUsuarios, true);
});

prueba("las demás cuentas exigen el código de su rol", async () => {
  const datos = { nombre: "Jefe Inventario", email: "jefe@correo.com", password: "clave-segura-2", rol: "jefe" };
  assert.equal((await pedir("/auth/registro", { metodo: "POST", cuerpo: datos })).status, 403);
  assert.equal((await pedir("/auth/registro", { metodo: "POST", cuerpo: { ...datos, codigoRol: "malo" } })).status, 403);
  assert.equal((await pedir("/auth/registro", { metodo: "POST", cuerpo: { ...datos, rol: "admin", codigoRol: "x" } })).status, 403);  // admin no habilitado
  const jefe = await pedir("/auth/registro", { metodo: "POST", cuerpo: { ...datos, codigoRol: "codigo-jefe" } });
  assert.equal(jefe.status, 201);
  assert.equal(jefe.datos.usuario.rol, "jefe");
  s.jefe = jefe.datos.token;
  const emp = await pedir("/auth/registro", { metodo: "POST", cuerpo: { nombre: "Caja Uno", email: "caja@correo.com", password: "clave-segura-3", rol: "empleado", codigoRol: "codigo-emp" } });
  assert.equal(emp.status, 201);
  s.empleado = emp.datos.token;
  s.empleadoId = emp.datos.usuario._id;
  assert.equal((await pedir("/auth/registro", { metodo: "POST", cuerpo: { ...datos, codigoRol: "codigo-jefe" } })).status, 409);   // correo repetido
});

prueba("login: contraseña, rol de acceso y /yo", async () => {
  assert.equal((await pedir("/auth/login", { metodo: "POST", cuerpo: { email: "jefe@correo.com", password: "mala" } })).status, 401);
  assert.equal((await pedir("/auth/login", { metodo: "POST", cuerpo: { email: "nadie@correo.com", password: "mala" } })).status, 401);
  assert.equal((await pedir("/auth/login", { metodo: "POST", cuerpo: { email: "jefe@correo.com", password: "clave-segura-2", rol: "admin" } })).status, 403);
  const ok = await pedir("/auth/login", { metodo: "POST", cuerpo: { email: "JEFE@correo.com", password: "clave-segura-2", rol: "jefe" } });
  assert.equal(ok.status, 200);
  const yo = await pedir("/auth/yo", { token: ok.datos.token });
  assert.equal(yo.datos.usuario.rol, "jefe");
});

prueba("productos: solo admin crea; el stock inicial se ignora; código único", async () => {
  const datos = { nombre: "Queso Turrialba", codigo: "qt-1", categoria: "Quesos", unidad: "kg", precioCompra: 2500, precioVenta: 4000, stock: 999, activo: false };
  assert.equal((await pedir("/productos", { metodo: "POST", token: s.jefe, cuerpo: datos })).status, 403);
  const r = await pedir("/productos", { metodo: "POST", token: s.admin, cuerpo: datos });
  assert.equal(r.status, 201);
  assert.equal(r.datos.stock, 0);
  assert.equal(r.datos.activo, true);
  assert.equal(r.datos.codigo, "QT-1");
  assert.equal(r.datos.creadoPor, "Dueña Quesería");
  s.queso = r.datos._id;
  assert.equal((await pedir("/productos", { metodo: "POST", token: s.admin, cuerpo: { ...datos, nombre: "Otro", codigo: "QT-1" } })).status, 409);
  const natilla = await pedir("/productos", { metodo: "POST", token: s.admin, cuerpo: { nombre: "Natilla", codigo: "NA-1", precioCompra: 900, precioVenta: 1500 } });
  s.natilla = natilla.datos._id;
  const lista = await pedir("/productos", { token: s.empleado });
  assert.equal(lista.datos.length, 2);
});

prueba("stock: entradas, salidas, ajustes e historial; nunca negativo", async () => {
  let r = await pedir(`/productos/${s.queso}/stock`, { metodo: "POST", token: s.jefe, cuerpo: { delta: 20, nota: "Stock inicial" } });
  assert.equal(r.status, 200);
  assert.equal(r.datos.stock, 20);
  r = await pedir(`/productos/${s.queso}/stock`, { metodo: "POST", token: s.jefe, cuerpo: { delta: -2.5, nota: "Se echó a perder" } });
  assert.equal(r.datos.stock, 17.5);
  r = await pedir(`/productos/${s.queso}/stock`, { metodo: "POST", token: s.jefe, cuerpo: { delta: -100 } });
  assert.equal(r.status, 409);
  r = await pedir(`/productos/${s.queso}/stock`, { metodo: "POST", token: s.admin, cuerpo: { delta: 0.5, tipo: "ajuste", nota: "Conteo" } });
  assert.equal(r.datos.stock, 18);
  await pedir(`/productos/${s.natilla}/stock`, { metodo: "POST", token: s.jefe, cuerpo: { delta: 5 } });
  const h = await pedir(`/productos/${s.queso}/movimientos`, { token: s.jefe });
  assert.deepEqual(h.datos.map((m) => m.tipo).reverse(), ["entrada", "salida", "ajuste"]);
  assert.equal(h.datos[2].usuarioNombre, "Jefe Inventario");   // la entrada más antigua la hizo el jefe
  assert.equal((await pedir(`/productos/${s.queso}/movimientos`, { token: s.empleado })).status, 403);
});

prueba("venta: precios de la base, IVA 13 %, stock descontado, movimiento de venta", async () => {
  const r = await pedir("/ventas", { metodo: "POST", token: s.empleado, cuerpo: { items: [{ producto: s.queso, cantidad: 2.5 }, { producto: s.natilla, cantidad: 1 }], recibido: 20000, precio: 1 } });
  assert.equal(r.status, 201);
  assert.equal(r.datos.subtotal, 11500);
  assert.equal(r.datos.iva, 1495);
  assert.equal(r.datos.total, 12995);
  assert.equal(r.datos.vuelto, 7005);
  assert.equal(r.datos.ganancia, 4350);
  assert.equal(r.datos.usuarioNombre, "Caja Uno");
  s.venta1 = r.datos._id;
  const lista = await pedir("/productos", { token: s.empleado });
  assert.equal(lista.datos.find((p) => p._id === s.queso).stock, 15.5);
  const h = await pedir(`/productos/${s.queso}/movimientos`, { token: s.jefe });
  assert.equal(h.datos[0].tipo, "venta");
  assert.equal(h.datos[0].cantidad, -2.5);
  assert.equal((await pedir("/ventas", { metodo: "POST", token: s.empleado, cuerpo: { items: [{ producto: s.queso, cantidad: 1 }], recibido: 100 } })).status, 400);
  assert.equal((await pedir("/ventas", { metodo: "POST", token: s.empleado, cuerpo: { items: [{ producto: s.queso, cantidad: 500 }], recibido: 9999999 } })).status, 409);
});

prueba("la venta conserva precio y costo aunque el producto cambie después", async () => {
  await pedir(`/productos/${s.queso}`, { metodo: "PUT", token: s.admin, cuerpo: { precioVenta: 9999, precioCompra: 5000, stock: 1 } });
  const venta = await pedir(`/ventas/${s.venta1}`, { token: s.admin });
  assert.equal(venta.datos.productos[0].precioUnitario, 4000);
  assert.equal(venta.datos.productos[0].costoUnitario, 2500);
  const lista = await pedir("/productos", { token: s.admin });
  assert.equal(lista.datos.find((p) => p._id === s.queso).stock, 15.5);   // el PUT no cambia el stock
  await pedir(`/productos/${s.queso}`, { metodo: "PUT", token: s.admin, cuerpo: { precioVenta: 4000, precioCompra: 2500 } });
});

prueba("ventas simultáneas: el stock nunca queda negativo", async () => {
  await pedir(`/productos/${s.natilla}/stock`, { metodo: "POST", token: s.admin, cuerpo: { delta: -4 } });   // quedan 0
  await pedir(`/productos/${s.natilla}/stock`, { metodo: "POST", token: s.admin, cuerpo: { delta: 5 } });    // 5
  const intentos = await Promise.all(Array.from({ length: 6 }, () =>
    pedir("/ventas", { metodo: "POST", token: s.empleado, cuerpo: { items: [{ producto: s.natilla, cantidad: 2 }], recibido: 99999 } })));
  const buenas = intentos.filter((i) => i.status === 201).length;
  assert.equal(buenas, 2);
  assert.ok(intentos.filter((i) => i.status !== 201).every((i) => i.status === 409));
  const lista = await pedir("/productos", { token: s.admin });
  assert.equal(lista.datos.find((p) => p._id === s.natilla).stock, 1);
});

prueba("consultas de ventas por mes y por día; el empleado solo ve las suyas", async () => {
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Costa_Rica" });
  const mes = hoy.slice(0, 7);
  const jefe = await pedir(`/ventas?mes=${mes}`, { token: s.jefe });
  assert.equal(jefe.datos.length, 3);
  assert.equal((await pedir(`/ventas?fecha=${hoy}`, { token: s.admin })).datos.length, 3);
  assert.equal((await pedir("/ventas?mes=2020-01", { token: s.admin })).datos.length, 0);
  // otra persona vende; la caja uno no debe verla
  await pedir("/ventas", { metodo: "POST", token: s.jefe, cuerpo: { items: [{ producto: s.queso, cantidad: 1 }], recibido: 99999 } });
  assert.equal((await pedir(`/ventas?mes=${mes}`, { token: s.empleado })).datos.length, 3);
  assert.equal((await pedir(`/ventas?mes=${mes}`, { token: s.admin })).datos.length, 4);
});

prueba("reporte mensual: totales, ingresadas vs vendidas, por día, comparación y rentabilidad", async () => {
  const mes = new Date().toLocaleDateString("en-CA", { timeZone: "America/Costa_Rica" }).slice(0, 7);
  const r = await pedir(`/reportes/mensual?mes=${mes}`, { token: s.jefe });
  assert.equal(r.status, 200);
  const { totales, anterior, productos, porDia, rentabilidad } = r.datos;

  assert.equal(totales.transacciones, 4);
  // ventas del mes: 11500 (caja) + 3000 y 3000 (natillas) + 4000 (jefe), todas sin IVA
  assert.equal(totales.ingresos, 21500);
  assert.equal(totales.ivaCobrado, 1495 + 390 + 390 + 520);
  assert.equal(totales.ticketPromedio, Math.round((21500 + 2795) / 4));
  assert.equal(anterior.transacciones, 0);
  assert.equal(porDia.length, 1);
  assert.equal(porDia[0].transacciones, 4);

  const queso = productos.find((p) => p.producto === s.queso);
  assert.equal(queso.ingresadas, 20);                        // solo cuentan las ENTRADAS; salidas y ajustes no
  assert.equal(queso.vendidas, 3.5);
  assert.equal(queso.ingresos, 14000);
  assert.equal(queso.costo, 8750);
  assert.equal(queso.ganancia, 5250);
  assert.equal(queso.margenReal, Math.round((5250 / 14000) * 100));

  const natilla = productos.find((p) => p.producto === s.natilla);
  assert.equal(natilla.vendidas, 5);                         // 1 + 2 + 2
  assert.ok(rentabilidad.masRentables[0].ganancia >= rentabilidad.menosRentables[0].ganancia);

  assert.equal((await pedir(`/reportes/mensual?mes=${mes}`, { token: s.empleado })).status, 403);
  const vacio = await pedir("/reportes/mensual?mes=2020-01", { token: s.admin });
  assert.equal(vacio.datos.totales.transacciones, 0);
  assert.equal(vacio.datos.totales.ticketPromedio, 0);
});

prueba("eliminar un producto lo oculta pero conserva el historial", async () => {
  assert.equal((await pedir(`/productos/${s.natilla}`, { metodo: "DELETE", token: s.admin })).status, 200);
  assert.equal((await pedir("/productos", { token: s.admin })).datos.length, 1);
  assert.equal((await pedir("/ventas", { metodo: "POST", token: s.empleado, cuerpo: { items: [{ producto: s.natilla, cantidad: 1 }], recibido: 9999 } })).status, 404);
  const mes = new Date().toLocaleDateString("en-CA", { timeZone: "America/Costa_Rica" }).slice(0, 7);
  const r = await pedir(`/reportes/mensual?mes=${mes}`, { token: s.admin });
  assert.equal(r.datos.productos.find((p) => p.producto === s.natilla).vendidas, 5);
  // el código se libera
  const nuevo = await pedir("/productos", { metodo: "POST", token: s.admin, cuerpo: { nombre: "Natilla 2", codigo: "NA-1", precioCompra: 1, precioVenta: 2 } });
  assert.equal(nuevo.status, 201);
});

prueba("usuarios: lista, roles, perfil, contraseñas y borrado", async () => {
  const lista = await pedir("/usuarios", { token: s.admin });
  assert.equal(Array.isArray(lista.datos), true);
  assert.equal(lista.datos.length, 3);
  assert.ok(lista.datos.every((u) => u.email && u._id && u.password === undefined));

  assert.equal((await pedir(`/usuarios/${s.adminId}/rol`, { metodo: "PATCH", token: s.admin, cuerpo: { rol: "empleado" } })).status, 400);
  const cambio = await pedir(`/usuarios/${s.empleadoId}/rol`, { metodo: "PATCH", token: s.admin, cuerpo: { rol: "jefe" } });
  assert.equal(cambio.datos.usuario.rol, "jefe");
  await pedir(`/usuarios/${s.empleadoId}/rol`, { metodo: "PATCH", token: s.admin, cuerpo: { rol: "empleado" } });

  // perfil propio
  const perfil = await pedir("/usuarios/yo", { metodo: "PATCH", token: s.empleado, cuerpo: { nombre: "Caja Principal", foto: "queseria/foto1" } });
  assert.equal(perfil.datos.usuario.nombre, "Caja Principal");
  assert.equal(perfil.datos.usuario.foto, "queseria/foto1");
  assert.equal((await pedir("/usuarios/yo", { metodo: "PATCH", token: s.empleado, cuerpo: { nombre: " " } })).status, 400);
  assert.equal((await pedir("/usuarios/yo", { metodo: "PATCH", token: s.empleado, cuerpo: { foto: "../../x y" } })).status, 400);
  assert.equal((await pedir("/usuarios/yo", { metodo: "PATCH", token: s.empleado, cuerpo: { foto: "" } })).datos.usuario.foto, "");

  // cambiar contraseña: la incorrecta responde 400 (un 401 cerraría la sesión en el frontend)
  assert.equal((await pedir("/usuarios/yo/password", { metodo: "POST", token: s.empleado, cuerpo: { actual: "mala", nueva: "nueva-clave-99" } })).status, 400);
  assert.equal((await pedir("/usuarios/yo/password", { metodo: "POST", token: s.empleado, cuerpo: { actual: "clave-segura-3", nueva: "corta" } })).status, 400);
  assert.equal((await pedir("/usuarios/yo/password", { metodo: "POST", token: s.empleado, cuerpo: { actual: "clave-segura-3", nueva: "nueva-clave-99" } })).status, 200);
  assert.equal((await pedir("/auth/login", { metodo: "POST", cuerpo: { email: "caja@correo.com", password: "nueva-clave-99" } })).status, 200);

  // restablecer: contraseña temporal + se cierran las sesiones anteriores
  await esperar(1100);
  const reset = await pedir(`/usuarios/${s.empleadoId}/restablecer-password`, { metodo: "POST", token: s.admin });
  assert.equal(reset.status, 200);
  assert.ok(reset.datos.passwordTemporal.length >= 10);
  assert.equal((await pedir("/auth/yo", { token: s.empleado })).status, 401);
  const nuevoLogin = await pedir("/auth/login", { metodo: "POST", cuerpo: { email: "caja@correo.com", password: reset.datos.passwordTemporal } });
  assert.equal(nuevoLogin.status, 200);
  assert.equal((await pedir("/auth/yo", { token: nuevoLogin.datos.token })).status, 200);

  // el último administrador no se puede eliminar
  assert.equal((await pedir("/usuarios/yo", { metodo: "DELETE", token: s.admin, cuerpo: { password: "clave-segura-1" } })).status, 409);
  assert.equal((await pedir(`/usuarios/${s.adminId}`, { metodo: "DELETE", token: s.admin })).status, 400);

  // eliminar la propia cuenta pide contraseña; las ventas se conservan
  assert.equal((await pedir("/usuarios/yo", { metodo: "DELETE", token: nuevoLogin.datos.token, cuerpo: { password: "mala" } })).status, 400);
  assert.equal((await pedir("/usuarios/yo", { metodo: "DELETE", token: nuevoLogin.datos.token, cuerpo: { password: reset.datos.passwordTemporal } })).status, 200);
  assert.equal((await pedir("/auth/yo", { token: nuevoLogin.datos.token })).status, 401);
  const mes = new Date().toLocaleDateString("en-CA", { timeZone: "America/Costa_Rica" }).slice(0, 7);
  const ventas = await pedir(`/ventas?mes=${mes}`, { token: s.admin });
  assert.ok(ventas.datos.some((v) => v.usuarioNombre === "Caja Uno"));

  // el admin elimina a otro usuario
  assert.equal((await pedir(`/usuarios`, { token: s.admin })).datos.length, 2);
  const jefeId = (await pedir("/usuarios", { token: s.admin })).datos.find((u) => u.rol === "jefe")._id;
  assert.equal((await pedir(`/usuarios/${jefeId}`, { metodo: "DELETE", token: s.admin })).status, 200);
});
