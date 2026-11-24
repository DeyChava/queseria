import assert from "node:assert/strict";
import test from "node:test";
import "./preparar.js";
import { mesActual, rangoDelDia, rangoDelMes, sumarMeses, validarMes } from "../utils/fechas.js";
import { leerNumero, redondear } from "../utils/numeros.js";
import { validarPassword, seleccionar } from "../utils/validaciones.js";

test("sumarMeses cruza el cambio de año", () => {
  assert.equal(sumarMeses("2026-01", -1), "2025-12");
  assert.equal(sumarMeses("2026-12", 1), "2027-01");
  assert.equal(sumarMeses("2026-11", -1), "2026-10");
});

test("el mes se cuenta con la hora de Costa Rica (UTC-6)", () => {
  const { desde, hasta } = rangoDelMes("2026-11");
  assert.equal(desde.toISOString(), "2026-11-01T06:00:00.000Z");
  assert.equal(hasta.toISOString(), "2026-12-01T06:00:00.000Z");
});

test("rangoDelDia valida formato y días inexistentes", () => {
  const { desde, hasta } = rangoDelDia("2026-11-22");
  assert.equal(hasta - desde, 24 * 60 * 60 * 1000);
  assert.throws(() => rangoDelDia("2026-02-31"), /no existe/);
  assert.throws(() => rangoDelDia("22/11/2026"), /AAAA-MM-DD/);
});

test("validarMes rechaza formatos incorrectos", () => {
  assert.equal(validarMes("2026-11"), "2026-11");
  assert.throws(() => validarMes("2026-13"));
  assert.throws(() => validarMes("noviembre"));
  assert.match(mesActual(), /^\d{4}-\d{2}$/);
});

test("números: redondeo y lectura estricta", () => {
  assert.equal(redondear(2.675, 2), 2.68);
  assert.equal(redondear(1234.5), 1235);
  assert.ok(Number.isNaN(leerNumero("")));
  assert.ok(Number.isNaN(leerNumero(null)));
  assert.equal(leerNumero("12.5"), 12.5);
});

test("contraseña: mínimo 8 y máximo 72 bytes", () => {
  assert.throws(() => validarPassword("corta"));
  assert.throws(() => validarPassword("a".repeat(73)));
  assert.equal(validarPassword("suficiente1"), "suficiente1");
});

test("seleccionar ignora campos no permitidos", () => {
  assert.deepEqual(seleccionar({ nombre: "x", activo: false, stock: 99 }, ["nombre"]), { nombre: "x" });
});
