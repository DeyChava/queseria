import { FACTOR_STOCK_BAJO } from './constants'

// Estado del stock según el stockMinimo de cada producto:
//   crítico (stock <= stockMinimo, igual que "bajoStock" del backend) · bajo (hasta el doble) · normal
export const estadoStock = (p) =>
  p.stock <= p.stockMinimo ? 'crit' : p.stock <= p.stockMinimo * FACTOR_STOCK_BAJO ? 'bajo' : 'normal'

export const ETIQUETA_ESTADO = { crit: 'CRÍTICO', bajo: 'STOCK BAJO', normal: 'NORMAL' }

// Resumen para las tarjetas del panel de inventario (todo calculado con los productos reales)
export function resumenInventario(productos) {
  const c = { normal: 0, bajo: 0, crit: 0 }
  productos.forEach((p) => { c[estadoStock(p)]++ })
  return {
    total: productos.length,
    alertas: c.bajo + c.crit,
    criticos: c.crit,
    bajos: c.bajo,
    proveedores: new Set(productos.map((p) => (p.proveedor || '').trim().toLowerCase()).filter(Boolean)).size,
  }
}
