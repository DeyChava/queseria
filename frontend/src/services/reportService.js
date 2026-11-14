import { api } from './api'

// GET /api/reportes/mensual?mes=AAAA-MM  (solo con la extensión; administrador y jefe)
// Devuelve { mes, totales, anterior, productos: [...], porDia: [...] } calculado por el servidor con las ventas
// y los movimientos de stock REALES guardados en MongoDB.
export async function getMonthlyReport(mes) {
  const { data } = await api.get('/reportes/mensual', { params: { mes } })
  return data
}
