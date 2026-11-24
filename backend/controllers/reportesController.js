import { reporteMensual } from "../services/reporteService.js";
import { mesActual, validarMes } from "../utils/fechas.js";

// GET /api/reportes/mensual?mes=AAAA-MM (sin mes: el mes actual)
export async function obtenerReporteMensual(req, res) {
  const mes = validarMes(req.query.mes ?? mesActual());
  res.json(await reporteMensual(mes));
}