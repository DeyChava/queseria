import mongoose from "mongoose";
import { DECIMALES_STOCK, IVA, MAX_LINEAS_VENTA } from "../config/constantes.js";
import { siguienteNumero } from "../models/Contador.js";
import MovimientoStock from "../models/MovimientoStock.js";
import Producto from "../models/Producto.js";
import Venta from "../models/venta.js";
import { ErrorHttp } from "../utils/errores.js";
import { exigirCantidadAdmitida, leerNumero, redondear } from "../utils/numeros.js";
import { modificarStock, revertirStock } from "./stockService.js";

// Valida las líneas que manda el punto de venta y junta las repetidas: Map(productoId -> cantidad)
function agruparLineas(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ErrorHttp(400, "Agrega al menos un producto a la venta");
  }
  if (items.length > MAX_LINEAS_VENTA) {
    throw new ErrorHttp(400, `Una venta admite como máximo ${MAX_LINEAS_VENTA} líneas`);
  }

  const cantidades = new Map();
  for (const item of items) {
    const id = String(item?.producto ?? "");
    const cantidad = redondear(leerNumero(item?.cantidad), DECIMALES_STOCK);
    if (!mongoose.isValidObjectId(id)) throw new ErrorHttp(400, "Hay un producto con identificador inválido");
    if (!Number.isFinite(cantidad) || cantidad <= 0) throw new ErrorHttp(400, "Todas las cantidades deben ser mayores que cero");
    cantidades.set(id, redondear((cantidades.get(id) || 0) + cantidad, DECIMALES_STOCK));
  }
  return cantidades;
}

// Registra una venta completa. Los precios y costos salen SIEMPRE de la base de datos, nunca del navegador.
export async function registrarVenta({ items, recibido, usuario }) {
  const cantidades = agruparLineas(items);
  const pagado = leerNumero(recibido);
  if (!Number.isFinite(pagado) || pagado < 0) throw new ErrorHttp(400, "El monto recibido no es válido");

  const productos = await Producto.find({ _id: { $in: [...cantidades.keys()] }, activo: true });
  if (productos.length !== cantidades.size) {
    throw new ErrorHttp(404, "Uno o más productos ya no existen. Actualiza el catálogo");
  }

  // --- Cálculo con los datos reales del producto ---
  let sumaVenta = 0;
  let sumaGravada = 0;   // lo vendido en productos que SÍ llevan IVA
  let sumaCosto = 0;
  const lineas = productos.map((producto) => {
    const cantidad = cantidades.get(String(producto._id));
    exigirCantidadAdmitida(producto.unidad, cantidad, producto.nombre);
    if (producto.stock < cantidad) {
      throw new ErrorHttp(409, `Inventario insuficiente de ${producto.nombre}. Disponible: ${producto.stock} ${producto.unidad}`);
    }
    const aplicaIva = producto.aplicaIva !== false;   // los productos antiguos (sin el campo) llevan IVA
    sumaVenta += producto.precioVenta * cantidad;
    sumaCosto += producto.precioCompra * cantidad;
    if (aplicaIva) sumaGravada += producto.precioVenta * cantidad;
    return {
      producto: producto._id,
      nombre: producto.nombre,
      codigo: producto.codigo,
      unidad: producto.unidad,
      aplicaIva,
      cantidad,
      precioUnitario: producto.precioVenta,
      costoUnitario: producto.precioCompra,
      subtotal: redondear(producto.precioVenta * cantidad, 2),
      costo: redondear(producto.precioCompra * cantidad, 2),
    };
  });

  // Mismo cálculo que el punto de venta: se redondea a colones enteros. El IVA solo se cobra sobre los productos
  // que lo llevan; los que no, se suman al subtotal pero no pagan impuesto.
  const subtotal = redondear(sumaVenta);
  const iva = redondear(redondear(sumaGravada) * IVA);
  const total = subtotal + iva;
  const costoTotal = redondear(sumaCosto);
  if (pagado < total) throw new ErrorHttp(400, "El monto recibido no alcanza");

  // --- Descuento de inventario (atómico por producto) ---
  const descontadas = [];
  const movimientos = [];
  let venta;
  try {
    for (const linea of lineas) {
      const actualizado = await modificarStock(linea.producto, -linea.cantidad);
      if (!actualizado) {
        throw new ErrorHttp(409, `Inventario insuficiente de ${linea.nombre}. Actualiza el catálogo e inténtalo de nuevo`);
      }
      descontadas.push(linea);
      movimientos.push({
        producto: linea.producto,
        nombreProducto: linea.nombre,
        unidad: linea.unidad,
        tipo: "venta",
        cantidad: -linea.cantidad,
        stockAnterior: redondear(actualizado.stock + linea.cantidad, DECIMALES_STOCK),
        stockNuevo: actualizado.stock,
        usuario: usuario.id,
        usuarioNombre: usuario.nombre,
      });
    }

    venta = await Venta.create({
      numero: await siguienteNumero("venta"),
      productos: lineas,
      subtotal, iva, total, costoTotal,
      ganancia: subtotal - costoTotal,
      recibido: pagado,
      vuelto: redondear(pagado - total),
      usuario: usuario.id,
      usuarioNombre: usuario.nombre,
    });

    // Cada venta queda en el historial como una salida de stock (de aquí salen los reportes)
    await MovimientoStock.insertMany(movimientos.map((m) => ({ ...m, venta: venta._id })));
  } catch (error) {
    // Si algo falla a mitad de camino se devuelve todo como estaba
    await Promise.all(descontadas.map((l) => revertirStock(l.producto, -l.cantidad)));
    if (venta) {
      await Venta.deleteOne({ _id: venta._id });
      await MovimientoStock.deleteMany({ venta: venta._id });
    }
    throw error;
  }

  return venta;
}
