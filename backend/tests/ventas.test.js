import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import "./preparar.js";

const { registrarVenta } = await import("../services/ventaService.js");
const { default: Producto } = await import("../models/Producto.js");
const { default: Venta } = await import("../models/venta.js");
const { default: MovimientoStock } = await import("../models/MovimientoStock.js");
const { default: Contador } = await import("../models/Contador.js");

const ID_A = "665f1f1f1f1f1f1f1f1f1f01";
const ID_B = "665f1f1f1f1f1f1f1f1f1f02";
const usuario = { id: "665f1f1f1f1f1f1f1f1f1faa", nombre: "Caja 1" };

// "Base de datos" en memoria para probar la lógica sin MongoDB y aso ver si funciona
let stock, ventasGuardadas, movimientosGuardados, fallarAlCrearVenta;

beforeEach(() => {
  stock = { [ID_A]: 10, [ID_B]: 2.5 };
  ventasGuardadas = [];
  movimientosGuardados = [];
  fallarAlCrearVenta = false;

  const productos = {
    [ID_A]: { _id: ID_A, nombre: "Queso Turrialba", codigo: "QT1", unidad: "kg", precioVenta: 4000, precioCompra: 2500 },
    [ID_B]: { _id: ID_B, nombre: "Natilla", codigo: "NA1", unidad: "unidades", precioVenta: 1500, precioCompra: 900 },
  };

  Producto.find = async ({ _id }) => _id.$in.map((id) => ({ ...productos[id], stock: stock[id] }));
  Producto.findOneAndUpdate = async (filtro, pipeline) => {
    const id = String(filtro._id);
    const delta = pipeline[0].$set.stock.$round[0].$add[1];
    if (filtro.stock && stock[id] < filtro.stock.$gte) return null;
    stock[id] = Math.round((stock[id] + delta) * 1000) / 1000;
    return { ...productos[id], stock: stock[id] };
  };
  Producto.updateOne = async ({ _id }, { $inc }) => { stock[String(_id)] += $inc.stock; };
  Contador.findOneAndUpdate = async () => ({ valor: 7 });
  Venta.create = async (datos) => {
    if (fallarAlCrearVenta) throw new Error("falló la base");
    const venta = { _id: "venta1", ...datos };
    ventasGuardadas.push(venta);
    return venta;
  };
  Venta.deleteOne = async () => { ventasGuardadas.pop(); };
  MovimientoStock.insertMany = async (docs) => { movimientosGuardados.push(...docs); };
  MovimientoStock.deleteMany = async () => { movimientosGuardados.length = 0; };
});

test("calcula subtotal, IVA 13 %, total, costo, ganancia y vuelto con datos de la base", async () => {
  const venta = await registrarVenta({
    items: [{ producto: ID_A, cantidad: 2.5 }, { producto: ID_B, cantidad: 1 }],
    recibido: 20000,
    usuario,
  });
  assert.equal(venta.subtotal, 11500);            // 2.5 × 4000 + 1 × 1500
  assert.equal(venta.iva, 1495);                  // 13 %
  assert.equal(venta.total, 12995);
  assert.equal(venta.costoTotal, 7150);           // 2.5 × 2500 + 900
  assert.equal(venta.ganancia, 4350);             // sin IVA
  assert.equal(venta.vuelto, 7005);
  assert.equal(venta.numero, 7);
  assert.equal(venta.productos[0].precioUnitario > 0, true);
  assert.equal(venta.usuarioNombre, "Caja 1");
});

test("descuenta el stock y guarda un movimiento de venta por línea", async () => {
  await registrarVenta({ items: [{ producto: ID_A, cantidad: 2.5 }], recibido: 99999, usuario });
  assert.equal(stock[ID_A], 7.5);
  assert.equal(movimientosGuardados.length, 1);
  assert.equal(movimientosGuardados[0].tipo, "venta");
  assert.equal(movimientosGuardados[0].cantidad, -2.5);
  assert.equal(movimientosGuardados[0].stockAnterior, 10);
  assert.equal(movimientosGuardados[0].stockNuevo, 7.5);
});

test("suma las líneas repetidas del mismo producto", async () => {
  await registrarVenta({ items: [{ producto: ID_A, cantidad: 1 }, { producto: ID_A, cantidad: 2 }], recibido: 99999, usuario });
  assert.equal(stock[ID_A], 7);
});

test("no vende más de lo que hay y no toca el inventario", async () => {
  await assert.rejects(
    registrarVenta({ items: [{ producto: ID_A, cantidad: 1 }, { producto: ID_B, cantidad: 3 }], recibido: 99999, usuario }),
    (e) => e.status === 409 && /Natilla/.test(e.message),
  );
  assert.deepEqual(stock, { [ID_A]: 10, [ID_B]: 2.5 });
  assert.equal(ventasGuardadas.length, 0);
});

test("rechaza si el monto recibido no alcanza", async () => {
  await assert.rejects(
    registrarVenta({ items: [{ producto: ID_A, cantidad: 1 }], recibido: 4000, usuario }),
    (e) => e.status === 400 && /no alcanza/.test(e.message),
  );
  assert.equal(stock[ID_A], 10);
});

test("si falla al guardar la venta, devuelve el stock", async () => {
  fallarAlCrearVenta = true;
  await assert.rejects(registrarVenta({ items: [{ producto: ID_A, cantidad: 4 }, { producto: ID_B, cantidad: 1 }], recibido: 99999, usuario }));
  assert.deepEqual(stock, { [ID_A]: 10, [ID_B]: 2.5 });
  assert.equal(movimientosGuardados.length, 0);
});

test("valida cantidades, identificadores y que haya líneas", async () => {
  const intentar = (items) => registrarVenta({ items, recibido: 99999, usuario });
  await assert.rejects(intentar([]), (e) => e.status === 400);
  await assert.rejects(intentar([{ producto: "xyz", cantidad: 1 }]), (e) => e.status === 400);
  await assert.rejects(intentar([{ producto: ID_A, cantidad: 0 }]), (e) => e.status === 400);
  await assert.rejects(intentar([{ producto: ID_A, cantidad: -1 }]), (e) => e.status === 400);
  await assert.rejects(intentar([{ producto: ID_A, cantidad: "abc" }]), (e) => e.status === 400);
});