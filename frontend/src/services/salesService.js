import { api } from './api'
import { redondear } from '../utils/format'

// Registrar una venta. "lines" = [{ _id, qty }] (el _id del producto y la cantidad).
//  - Con la extensión (full): POST /api/ventas { items:[{ producto, cantidad }], recibido }. El servidor recalcula
//    precios, IVA y total, descuenta el stock sin dejarlo negativo, y guarda la venta y sus movimientos.
//    Devuelve la venta guardada.
//  - Backend básico: no existe endpoint de ventas, así que solo se DESCUENTA EL STOCK con PUT /api/productos/:id
//    (uno por producto; si alguno falla se devuelve el de los anteriores). Devuelve null: la venta no queda guardada.
export async function createSale({ lines, products, received, full }) {
  if (full) {
    const { data } = await api.post('/ventas', { items: lines.map((l) => ({ producto: l._id, cantidad: l.qty })), recibido: received })
    return data
  }
  const hechos = []
  try {
    for (const linea of lines) {
      const p = products.find((x) => x._id === linea._id)
      await api.put(`/productos/${p._id}`, { stock: Math.max(0, redondear(p.stock - linea.qty)) })
      hechos.push(p)
    }
  } catch (error) {
    for (const p of hechos.reverse()) {
      try { await api.put(`/productos/${p._id}`, { stock: p.stock }) } catch { /* se corrige al recargar */ }
    }
    throw error
  }
  return null
}
