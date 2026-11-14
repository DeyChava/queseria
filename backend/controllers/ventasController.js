import mongoose from "mongoose";
import Producto from "../models/Producto.js";
import Venta from "../models/Venta.js";

// POST /api/ventas: registra la venta y descuenta existencias.
export async function crearVenta(req, res) {
  const { productos, descuento = 0, metodoPago = "efectivo", cliente = "", notas = "" } = req.body;
  const movimientos = [];

  try {
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Agregue al menos un producto a la venta" });
    }
    if (!Number.isFinite(Number(descuento)) || Number(descuento) < 0) {
      return res.status(400).json({ error: "El descuento debe ser un número igual o mayor que cero" });
    }

    // Agrupa líneas repetidas para no descontar dos veces con validaciones separadas.
    const cantidades = new Map();
    for (const linea of productos) {
      const id = String(linea.productoId || linea.producto || "");
      const cantidad = Number(linea.cantidad);
      if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: `Identificador de producto inválido: ${id}` });
      if (!Number.isFinite(cantidad) || cantidad <= 0) return res.status(400).json({ error: "Todas las cantidades deben ser mayores que cero" });
      cantidades.set(id, (cantidades.get(id) || 0) + cantidad);
    }

    const ids = [...cantidades.keys()];
    const encontrados = await Producto.find({ _id: { $in: ids }, activo: true });
    if (encontrados.length !== ids.length) {
      return res.status(404).json({ error: "Uno o más productos no existen o están inactivos" });
    }

    const detalle = [];
    for (const producto of encontrados) {
      const cantidad = cantidades.get(String(producto._id));
      if (producto.stock < cantidad) {
        return res.status(400).json({ error: `Inventario insuficiente para ${producto.nombre}. Disponible: ${producto.stock} ${producto.unidad}` });
      }
      detalle.push({
        producto: producto._id,
        nombre: producto.nombre,
        codigo: producto.codigo,
        unidad: producto.unidad,
        cantidad,
        precioUnitario: producto.precioVenta,
        subtotal: Math.round(cantidad * producto.precioVenta * 100) / 100,
      });
    }

    const subtotal = Math.round(detalle.reduce((s, p) => s + p.subtotal, 0) * 100) / 100;
    const rebaja = Number(descuento);
    if (rebaja > subtotal) return res.status(400).json({ error: "El descuento no puede superar el subtotal" });
    const total = Math.round((subtotal - rebaja) * 100) / 100;

    // Actualización condicional: impide vender stock que otra solicitud ya consumió.
    for (const linea of detalle) {
      const actualizado = await Producto.findOneAndUpdate(
        { _id: linea.producto, activo: true, stock: { $gte: linea.cantidad } },
        { $inc: { stock: -linea.cantidad } },
        { new: true }
      );
      if (!actualizado) throw new Error(`No hay inventario suficiente para ${linea.nombre}. Actualice la venta e inténtelo de nuevo.`);
      movimientos.push({ id: linea.producto, cantidad: linea.cantidad });
    }

    const venta = await Venta.create({
      productos: detalle, subtotal, descuento: rebaja, total,
      metodoPago, cliente, notas,
    });
    return res.status(201).json({ mensaje: "Venta registrada correctamente", venta });
  } catch (error) {
    // Si una línea falla, devuelve las existencias descontadas previamente.
    if (movimientos.length) {
      await Promise.all(movimientos.map(m => Producto.updateOne({ _id: m.id }, { $inc: { stock: m.cantidad } })));
    }
    return res.status(400).json({ error: error.message || "No se pudo registrar la venta" });
  }
}

// GET /api/ventas: historial con filtros opcionales por fecha.
export async function listarVentas(req, res) {
  try {
    const filtro = {};
    if (req.query.desde || req.query.hasta) {
      filtro.createdAt = {};
      if (req.query.desde) filtro.createdAt.$gte = new Date(`${req.query.desde}T00:00:00.000`);
      if (req.query.hasta) filtro.createdAt.$lte = new Date(`${req.query.hasta}T23:59:59.999`);
      if (Object.values(filtro.createdAt).some(d => Number.isNaN(d.getTime()))) return res.status(400).json({ error: "Formato de fecha inválido. Use YYYY-MM-DD" });
    }
    if (req.query.estado) filtro.estado = req.query.estado;
    const limite = Math.min(Math.max(Number(req.query.limite) || 50, 1), 200);
    const ventas = await Venta.find(filtro).sort({ createdAt: -1 }).limit(limite);
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: "No se pudo consultar el historial de ventas" });
  }
}

// GET /api/ventas/:id
export async function obtenerVenta(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Identificador de venta inválido" });
    const venta = await Venta.findById(req.params.id);
    if (!venta) return res.status(404).json({ error: "No se encontró la venta" });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ error: "No se pudo consultar la venta" });
  }
}
