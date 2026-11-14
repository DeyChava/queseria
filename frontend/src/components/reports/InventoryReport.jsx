import { cantidad, crc, fechaCorta, unidadCorta } from '../../utils/format'
import { ETIQUETA_ESTADO, estadoStock } from '../../utils/inventory'
import { productosConAlerta, productosPorVencer, rentabilidadPotencial, valorDelInventario } from '../../utils/reports'

function Seccion({ titulo, children }) {
  return <div className="space-y-3"><h2 className="font-title text-lg font-bold text-oro-claro">{titulo}</h2>{children}</div>
}

// Reporte de INVENTARIO con los datos reales de /api/productos (sirve con cualquier backend):
// valor del inventario, rentabilidad POTENCIAL por precios (margen y ganancia por unidad), alertas y vencimientos.
export default function InventoryReport({ products }) {
  const valor = valorDelInventario(products)
  const potencial = rentabilidadPotencial(products)
  const porMargen = [...potencial].sort((a, b) => b.margen - a.margen)
  const alertas = productosConAlerta(products)
  const vencen = productosPorVencer(products)
  const mas = porMargen.slice(0, Math.ceil(Math.min(10, porMargen.length) / 2))
  const menos = porMargen.slice(porMargen.length - Math.floor(Math.min(10, porMargen.length) / 2)).reverse()

  const Fila = ({ x }) => (
    <tr key={x.p._id}>
      <td><b className="text-titulo">{x.p.nombre}</b><span className="mt-0.5 block text-[10px] font-normal text-tenue">{x.p.codigo || 'Sin código'}</span></td>
      <td className="text-right font-bold text-exito">{x.margen} %</td>
      <td className="text-right">{crc(x.gananciaUnidad)}</td>
      <td className="text-right text-oro-claro">{crc(x.gananciaStock)}</td>
    </tr>
  )
  const Tabla = ({ filas }) => (
    <div className="tabla-caja"><div className="overflow-x-auto"><table className="tabla">
      <thead><tr><th>Producto</th><th className="text-right">Margen</th><th className="text-right">Ganancia por unidad</th><th className="text-right">Ganancia con el stock actual</th></tr></thead>
      <tbody>{filas.length === 0 ? <tr><td colSpan={4} className="!py-6 text-center text-tenue">Todavía no hay productos.</td></tr> : filas.map((x) => <Fila key={x.p._id} x={x} />)}</tbody>
    </table></div></div>
  )

  return (
    <div className="space-y-8">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="metrica"><span className="metrica-etiqueta">Valor del inventario al costo</span><div className="metrica-valor text-oro-claro">{crc(valor.costo)}</div></div>
        <div className="metrica"><span className="metrica-etiqueta">Valor a precio de venta</span><div className="metrica-valor">{crc(valor.venta)}</div></div>
        <div className="metrica"><span className="metrica-etiqueta">Ganancia potencial</span><div className="metrica-valor text-exito">{crc(valor.ganancia)}</div></div>
      </div>

      <Seccion titulo="Productos más rentables (por precio)"><Tabla filas={mas} /></Seccion>
      <Seccion titulo="Productos menos rentables (por precio)"><Tabla filas={menos} /></Seccion>
      <p className="font-mono text-[10px] text-tenue">Rentabilidad potencial: se calcula con los precios de compra y de venta de cada producto. La rentabilidad real (según lo que se vendió) necesita el historial de ventas de la extensión del backend.</p>

      <Seccion titulo="Productos con stock bajo o crítico">
        <div className="tabla-caja"><div className="overflow-x-auto"><table className="tabla">
          <thead><tr><th>Producto</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr></thead>
          <tbody>
            {alertas.length === 0 && <tr><td colSpan={4} className="!py-6 text-center text-tenue">No hay productos con alerta de stock.</td></tr>}
            {alertas.map((p) => { const e = estadoStock(p); return (
              <tr key={p._id}><td><b className="text-titulo">{p.nombre}</b></td><td>{cantidad(p.stock)} {unidadCorta(p.unidad)}</td><td className="text-apagado">{cantidad(p.stockMinimo)}</td><td><span className={`estado estado-${e}`}>{ETIQUETA_ESTADO[e]}</span></td></tr>) })}
          </tbody>
        </table></div></div>
      </Seccion>

      <Seccion titulo="Vencidos o por vencer">
        <div className="tabla-caja"><div className="overflow-x-auto"><table className="tabla">
          <thead><tr><th>Producto</th><th>Vence</th><th>Días</th><th>Estado</th></tr></thead>
          <tbody>
            {vencen.length === 0 && <tr><td colSpan={4} className="!py-6 text-center text-tenue">No hay productos vencidos ni próximos a vencer (solo se evalúan los que tienen fecha de compra y días de vida).</td></tr>}
            {vencen.map(({ p, venc }) => (
              <tr key={p._id}><td><b className="text-titulo">{p.nombre}</b></td><td>{fechaCorta(venc.fecha)}</td><td>{venc.dias}</td><td><span className={`estado ${venc.estado === 'vencido' ? 'estado-crit' : 'estado-bajo'}`}>{venc.estado === 'vencido' ? 'VENCIDO' : 'POR VENCER'}</span></td></tr>
            ))}
          </tbody>
        </table></div></div>
      </Seccion>
    </div>
  )
}
