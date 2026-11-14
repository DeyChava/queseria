import { api } from './api'
import { redondear } from '../utils/format'

// Cambiar el stock de un producto.
//  - Con la extensión (full): POST /api/productos/:id/stock { delta, nota } -> sube o baja de forma atómica
//    y anota el movimiento (ingreso o ajuste) para el reporte de unidades ingresadas frente a vendidas.
//  - Backend básico: PUT /api/productos/:id con el stock nuevo (no queda historial).
export async function adjustStock(product, delta, { full, nota }) {
  if (full) {
    const { data } = await api.post(`/productos/${product._id}/stock`, { delta, nota })
    return data
  }
  const { data } = await api.put(`/productos/${product._id}`, { stock: Math.max(0, redondear(product.stock + delta)) })
  return data
}
