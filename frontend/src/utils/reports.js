import { ROTACION_ALTA, ROTACION_MEDIA } from './constants'
import { estadoStock } from './inventory'
import { margenPct, vencimiento } from './products'

// ================= REPORTE MENSUAL DE VENTAS (con la extensión del backend) =================

// Clasificación por rotación = vendidas ÷ ingresadas del mes
export function clasificarRotacion(fila) {
  if (fila.ingresadas === 0 && fila.vendidas === 0) return { texto: 'Sin movimiento', tono: 'neutro' }
  if (fila.ingresadas === 0) return { texto: 'Vendió stock previo', tono: 'normal' } // no ingresó nada este mes pero sí vendió
  const rot = fila.vendidas / fila.ingresadas
  if (rot >= ROTACION_ALTA) return { texto: 'Alta rotación', tono: 'normal' }
  if (rot >= ROTACION_MEDIA) return { texto: 'Rotación media', tono: 'bajo' }
  return { texto: 'Baja rotación', tono: 'crit' }
}

// Une las filas del reporte (solo productos con movimiento) con TODOS los productos actuales,
// para que los que no se movieron aparezcan como "Sin movimiento" (son los de más baja rotación).
export function filasDelReporte(reporte, productos) {
  const mapa = new Map((reporte?.productos || []).map((f) => [String(f.producto), f]))
  const filas = productos.map((p) => {
    const f = mapa.get(p._id)
    mapa.delete(p._id)
    return { producto: p._id, nombre: p.nombre, codigo: p.codigo, categoria: p.categoria, unidad: p.unidad, stockActual: p.stock,
      ingresadas: 0, vendidas: 0, ingresos: 0, costo: 0, ganancia: 0, margenReal: 0, rotacion: null, ...(f || {}) }
  })
  // productos con movimiento que ya no existen (eliminados): se muestran igual, con lo que registró el servidor
  for (const f of mapa.values()) filas.push({ stockActual: null, ...f, nombre: `${f.nombre} (eliminado)` })
  return filas.map((f) => ({ ...f, clase: clasificarRotacion(f) })).sort((a, b) => b.ganancia - a.ganancia || b.vendidas - a.vendidas)
}

// Más y menos rentables del mes. "criterio": 'ganancia' (₡) o 'margen' (%). Solo cuentan los que tuvieron ventas.
// Si hay pocos productos, la lista se reparte a la mitad para que ninguno salga en las dos columnas.
export function rankingRentabilidad(filas, criterio = 'ganancia', n = 5) {
  const clave = criterio === 'margen' ? 'margenReal' : 'ganancia'
  const conVentas = filas.filter((f) => f.vendidas > 0).sort((a, b) => b[clave] - a[clave] || b.ganancia - a.ganancia)
  const arriba = Math.min(n, Math.ceil(conVentas.length / 2))
  const abajo = Math.min(n, Math.floor(conVentas.length / 2))
  return {
    mas: conVentas.slice(0, arriba),
    menos: conVentas.slice(conVentas.length - abajo).reverse(),   // el menos rentable primero
    sinVentas: filas.filter((f) => f.vendidas === 0 && f.stockActual !== null),
  }
}

// Variación porcentual contra el mes anterior (null si el mes anterior no tuvo nada)
export const variacion = (actual, previo) => (previo > 0 ? Math.round(((actual - previo) / previo) * 100) : null)

// Descarga la tabla como CSV (abre bien en Excel)
export function descargarCsv(nombreArchivo, columnas, filas) {
  const celda = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const texto = [columnas.map((c) => celda(c.titulo)).join(','), ...filas.map((f) => columnas.map((c) => celda(c.valor(f))).join(','))].join('\r\n')
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(new Blob(['\ufeff' + texto], { type: 'text/csv;charset=utf-8' }))
  enlace.download = nombreArchivo
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}

// ================= REPORTE DE INVENTARIO (con cualquier backend; datos reales de /api/productos) =================

const valorCosto = (p) => p.valorAlCosto ?? Math.round(p.stock * p.precioCompra)
const valorVenta = (p) => p.valorAlaVenta ?? Math.round(p.stock * p.precioVenta)

export function valorDelInventario(productos) {
  const costo = productos.reduce((a, p) => a + valorCosto(p), 0)
  const venta = productos.reduce((a, p) => a + valorVenta(p), 0)
  return { costo, venta, ganancia: venta - costo }
}

// Rentabilidad POTENCIAL por producto (según precios, no según ventas): margen y ganancia por unidad y con el stock actual
export const rentabilidadPotencial = (productos) =>
  productos.map((p) => ({ p, margen: margenPct(p.precioCompra, p.precioVenta), gananciaUnidad: p.precioVenta - p.precioCompra, gananciaStock: Math.round(p.stock * (p.precioVenta - p.precioCompra)) }))

export const productosConAlerta = (productos) =>
  productos.filter((p) => estadoStock(p) !== 'normal').sort((a, b) => a.stock / (a.stockMinimo || 1) - b.stock / (b.stockMinimo || 1))

export const productosPorVencer = (productos) =>
  productos.map((p) => ({ p, venc: vencimiento(p) })).filter((x) => x.venc && x.venc.estado !== 'ok').sort((a, b) => a.venc.dias - b.venc.dias)
