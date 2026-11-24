import { DECIMALES_STOCK } from "../config/constantes.js";
import MovimientoStock from "../models/MovimientoStock.js";
import Producto from "../models/Producto.js";
import { ErrorHttp } from "../utils/errores.js";
import { redondear } from "../utils/numeros.js";


export function modificarStock(productoId, delta) {
  const filtro = { _id: productoId, activo: true };
  if (delta < 0) filtro.stock = { $gte: -delta };

  return Producto.findOneAndUpdate(
    filtro,
    [{ $set: { stock: { $round: [{ $add: ["$stock", delta] }, DECIMALES_STOCK] } } }],
    { returnDocument: "after", updatePipeline: true }   // Mongoose 9 exige avisar que el update es un pipeline
  );
}

// Deshace un cambio de stock ya aplicado (cuando algo falla a mitad de una operación)
export function revertirStock(productoId, delta) {
  return Producto.updateOne({ _id: productoId }, { $inc: { stock: -delta } });
}

// Movimiento manual (entrada, salida o ajuste) + registro en el historial
export async function registrarMovimiento({ productoId, delta, tipo, nota, usuario }) {
  const producto = await modificarStock(productoId, delta);

  if (!producto) {
    const existe = await Producto.exists({ _id: productoId, activo: true });
    if (!existe) throw new ErrorHttp(404, "No existe ese producto");
    throw new ErrorHttp(409, "No hay stock suficiente para bajar esa cantidad");
  }

  try {
    await MovimientoStock.create({
      producto: producto._id,
      nombreProducto: producto.nombre,
      unidad: producto.unidad,
      tipo,
      cantidad: delta,
      stockAnterior: redondear(producto.stock - delta, DECIMALES_STOCK),
      stockNuevo: producto.stock,
      nota,
      usuario: usuario.id,
      usuarioNombre: usuario.nombre,
    });
  } catch (error) {
    await revertirStock(productoId, delta);   // sin historial no se deja el cambio
    throw error;
  }

  return producto;
}
