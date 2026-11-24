import { ROL } from "../config/roles.js";
import Venta from "../models/venta.js";
import { registrarVenta } from "../services/ventaService.js";
import { ErrorHttp } from "../utils/errores.js";
import { rangoDelDia, rangoDelMes, validarMes } from "../utils/fechas.js";


// POST /api/ventas { items: [{ producto, cantidad }], recibido } -> la venta guardada (con total y vuelto)
export async function crearVenta(req, res) {
  const venta = await registrarVenta({
    items: req.body.items,
    recibido: req.body.recibido,
    usuario: req.usuario,
  });
  res.status(201).json(venta);
}

// GET /api/ventas?mes=AAAA-MM | ?fecha=AAAA-MM-DD   (sin filtros: las 50 más recientes)
// Administrador y jefe ven todas; el empleado solo las que él registró.
export async function listarVentas(req, res) {
  const { mes, fecha } = req.query;
  const filtro = {};
  let limite = 0;

  if (fecha) {
    const { desde, hasta } = rangoDelDia(fecha);
    filtro.createdAt = { $gte: desde, $lt: hasta };
  } else if (mes) {
    const { desde, hasta } = rangoDelMes(validarMes(mes));
    filtro.createdAt = { $gte: desde, $lt: hasta };
  } else {
    limite = Math.min(Math.max(Number(req.query.limite) || 50, 1), 200);
  }
  if (req.usuario.rol === ROL.EMPLEADO) filtro.usuario = req.usuario.id;

  res.json(await Venta.find(filtro).sort({ createdAt: -1 }).limit(limite));
}

// GET /api/ventas/:id
export async function obtenerVenta(req, res) {
  const venta = await Venta.findById(req.params.id);
  const esAjena = venta && req.usuario.rol === ROL.EMPLEADO && String(venta.usuario) !== req.usuario.id;
  if (!venta || esAjena) throw new ErrorHttp(404, "No se encontró la venta");
  res.json(venta);
}
