import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import "./preparar.js";
import jwt from "jsonwebtoken";

const { default: app } = await import("../app.js");
const { default: Usuario } = await import("../models/Usuario.js");

let servidor;
let base;

before(async () => {
  servidor = app.listen(0);
  base = `http://127.0.0.1:${servidor.address().port}/api`;
});
after(() => servidor.close());

const pedir = (ruta, { metodo = "GET", cuerpo, token } = {}) =>
  fetch(base + ruta, {
    method: metodo,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: cuerpo === undefined ? undefined : typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  });

// Simula un usuario ya guardado, sin base de datos
const simularUsuario = (rol) => {
  Usuario.findById = () => ({
    select: async () => ({ _id: "665f1f1f1f1f1f1f1f1f1f1f", nombre: "Prueba", correo: "p@q.com", rol, activo: true }),
  });
  return jwt.sign({ id: "665f1f1f1f1f1f1f1f1f1f1f" }, process.env.JWT_SECRET, { algorithm: "HS256" });
};

test("ping responde sin sesión", async () => {
  const r = await pedir("/ping");
  assert.equal(r.status, 200);
});

test("ruta inexistente: 404 con { error }", async () => {
  const r = await pedir("/nada");
  assert.equal(r.status, 404);
  assert.ok((await r.json()).error);
});

test("sin token, todo lo protegido responde 401", async () => {
  for (const ruta of ["/productos", "/ventas", "/reportes/mensual", "/usuarios", "/auth/yo"]) {
    assert.equal((await pedir(ruta)).status, 401, ruta);
  }
  assert.equal((await pedir("/imagenes", { metodo: "POST" })).status, 401);
});

test("token falso: 401", async () => {
  assert.equal((await pedir("/productos", { token: "abc.def.ghi" })).status, 401);
});

test("login valida los campos antes de consultar la base", async () => {
  const r = await pedir("/auth/login", { metodo: "POST", cuerpo: { email: "a@b.com" } });
  assert.equal(r.status, 400);
});

test("registro valida nombre, correo, contraseña y rol", async () => {
  const base = { nombre: "Ana Pérez", email: "ana@correo.com", password: "12345678", rol: "empleado" };
  for (const cambio of [{ nombre: "A" }, { email: "mal" }, { password: "corta" }, { rol: "dueño" }]) {
    const r = await pedir("/auth/registro", { metodo: "POST", cuerpo: { ...base, ...cambio } });
    assert.equal(r.status, 400, JSON.stringify(cambio));
  }
});

test("JSON dañado: 400 legible", async () => {
  const r = await pedir("/auth/login", { metodo: "POST", cuerpo: "{no es json" });
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /JSON/);
});

test("CORS: solo se permite el frontend configurado", async () => {
  const bueno = await fetch(base + "/ping", { headers: { Origin: "http://localhost:5173" } });
  assert.equal(bueno.headers.get("access-control-allow-origin"), "http://localhost:5173");
  const malo = await fetch(base + "/ping", { headers: { Origin: "http://sitio-malo.com" } });
  assert.equal(malo.headers.get("access-control-allow-origin"), null);
});

test("permisos por rol", async () => {
  const empleado = simularUsuario("empleado");
  assert.equal((await pedir("/productos", { metodo: "POST", token: empleado, cuerpo: {} })).status, 403);
  assert.equal((await pedir("/productos/665f1f1f1f1f1f1f1f1f1f1f/stock", { metodo: "POST", token: empleado, cuerpo: { delta: 1 } })).status, 403);
  assert.equal((await pedir("/reportes/mensual", { token: empleado })).status, 403);
  assert.equal((await pedir("/usuarios", { token: empleado })).status, 403);

  const jefe = simularUsuario("jefe");
  assert.equal((await pedir("/productos", { metodo: "POST", token: jefe, cuerpo: {} })).status, 403);
  assert.equal((await pedir("/usuarios", { token: jefe })).status, 403);
});

test("validaciones previas a la base de datos", async () => {
  const admin = simularUsuario("admin");
  assert.equal((await pedir("/productos/no-es-id", { token: admin })).status, 400);
  assert.equal((await pedir("/productos", { metodo: "POST", token: admin, cuerpo: { nombre: "Queso" } })).status, 400);
  assert.equal((await pedir("/productos/665f1f1f1f1f1f1f1f1f1f1f/stock", { metodo: "POST", token: admin, cuerpo: { delta: 0 } })).status, 400);
  assert.equal((await pedir("/productos/665f1f1f1f1f1f1f1f1f1f1f/stock", { metodo: "POST", token: admin, cuerpo: { delta: -2, tipo: "entrada" } })).status, 400);
  assert.equal((await pedir("/reportes/mensual?mes=2026-99", { token: admin })).status, 400);
  assert.equal((await pedir("/ventas", { metodo: "POST", token: admin, cuerpo: { items: [] } })).status, 400);
  assert.equal((await pedir("/ventas?fecha=2026-02-31", { token: admin })).status, 400);
});
