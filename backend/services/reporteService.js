import { ZONA_HORARIA } from "../config/constantes.js";
import MovimientoStock from "../models/MovimientoStock.js";
import Venta from "../models/venta.js";
import { redondear } from "../utils/numeros.js";
import { rangoDelMes, sumarMeses } from "../utils/fechas.js";

const enRango = ({ desde, hasta }) => ({ createdAt: { $gte: desde, $lt: hasta } });
const margen = (ganancia, ingresos) => (ingresos > 0 ? Math.round((ganancia / ingresos) * 100) : 0);

const TOTALES_VACIOS = {
  transacciones: 0, ingresos: 0, ivaCobrado: 0, totalCobrado: 0,
  costo: 0, ganancia: 0, ticketPromedio: 0, unidades: 0,
};

// A. Reporte general del mes. Ingresos y ganancia van SIN IVA (el IVA no es del negocio).
async function totalesDelMes(rango) {
  const [fila] = await Venta.aggregate([
    { $match: enRango(rango) },
    { $group: {
      _id: null,
      transacciones: { $sum: 1 },
      ingresos: { $sum: "$subtotal" },
      ivaCobrado: { $sum: "$iva" },
      totalCobrado: { $sum: "$total" },
      costo: { $sum: "$costoTotal" },
      ganancia: { $sum: "$ganancia" },
      unidades: { $sum: { $sum: "$productos.cantidad" } },
    } },
  ]);
  if (!fila) return { ...TOTALES_VACIOS };
  const { _id, ...totales } = fila;
  return {
    ...totales,
    unidades: redondear(totales.unidades, 3),
    // Ticket promedio = lo que paga en promedio cada cliente por compra (con IVA)
    ticketPromedio: redondear(totales.totalCobrado / totales.transacciones),
  };
}

// B. Una fila por producto: ingresadas (movimientos de entrada) frente a vendidas (ventas del mes)
async function filasPorProducto(rango) {
  const [vendidos, ingresados] = await Promise.all([
    Venta.aggregate([
      { $match: enRango(rango) },
      { $unwind: "$productos" },
      { $group: {
        _id: "$productos.producto",
        nombre: { $last: "$productos.nombre" },
        codigo: { $last: "$productos.codigo" },
        unidad: { $last: "$productos.unidad" },
        vendidas: { $sum: "$productos.cantidad" },
        ingresos: { $sum: "$productos.subtotal" },
        costo: { $sum: "$productos.costo" },
      } },
    ]),
    MovimientoStock.aggregate([
      { $match: { ...enRango(rango), tipo: "entrada" } },
      { $group: {
        _id: "$producto",
        nombre: { $last: "$nombreProducto" },
        unidad: { $last: "$unidad" },
        ingresadas: { $sum: "$cantidad" },
      } },
    ]),
  ]);

  const filas = new Map();
  for (const v of vendidos) filas.set(String(v._id), { ...v, ingresadas: 0 });
  for (const i of ingresados) {
    const clave = String(i._id);
    filas.set(clave, { ...i, ...filas.get(clave), ingresadas: i.ingresadas });
  }

  return [...filas.entries()].map(([producto, f]) => {
    const ingresos = redondear(f.ingresos ?? 0);
    const costo = redondear(f.costo ?? 0);
    const ganancia = ingresos - costo;
    const vendidas = redondear(f.vendidas ?? 0, 3);
    const ingresadas = redondear(f.ingresadas, 3);
    return {
      producto, nombre: f.nombre, codigo: f.codigo, unidad: f.unidad,
      ingresadas, vendidas, ingresos, costo, ganancia,
      margenReal: margen(ganancia, ingresos),
      rotacion: ingresadas > 0 ? redondear(vendidas / ingresadas, 2) : null,
    };
  }).sort((a, b) => b.ganancia - a.ganancia || b.vendidas - a.vendidas);
}

// C. Ventas de cada día (con la hora de Costa Rica)
function ventasPorDia(rango) {
  return Venta.aggregate([
    { $match: enRango(rango) },
    { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: ZONA_HORARIA } },
      total: { $sum: "$subtotal" },
      transacciones: { $sum: 1 },
      unidades: { $sum: { $sum: "$productos.cantidad" } },
    } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, dia: "$_id", total: 1, transacciones: 1, unidades: { $round: ["$unidades", 3] } } },
  ]);
}

// D. Más y menos rentables (solo cuentan los productos que se vendieron)
function rentabilidad(filas, cuantos = 5) {
  const vendidos = filas.filter((f) => f.vendidas > 0);   // ya vienen ordenados de mayor a menor ganancia
  return {
    masRentables: vendidos.slice(0, cuantos),
    menosRentables: vendidos.slice(-cuantos).reverse(),
  };
}

export async function reporteMensual(mes) {
  const rango = rangoDelMes(mes);
  const rangoAnterior = rangoDelMes(sumarMeses(mes, -1));

  const [totales, anterior, productos, porDia] = await Promise.all([
    totalesDelMes(rango),
    totalesDelMes(rangoAnterior),
    filasPorProducto(rango),
    ventasPorDia(rango),
  ]);

  return { mes, totales, anterior, productos, porDia, rentabilidad: rentabilidad(productos) };
}
