import { resumenInventario } from '../../utils/inventory'

// Tarjetas del panel de inventario (las 3 de tu diseño): total de productos, alertas de stock bajo y proveedores activos.
// Todo se calcula con los productos reales.
export default function InventorySummary({ products }) {
  const r = resumenInventario(products)
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="metrica"><span className="metrica-etiqueta">Total de Productos</span><div className="metrica-valor text-oro-claro">{r.total}</div></div>
      <div className="metrica !border-oro/30 !bg-oro/5">
        <span className="metrica-etiqueta !text-oro">Alertas de Bajo Stock</span>
        <div className="metrica-valor !text-oro">{r.alertas}</div>
        <p className="mt-1 font-mono text-[10px] text-apagado">{r.criticos} críticos · {r.bajos} bajos</p>
      </div>
      <div className="metrica"><span className="metrica-etiqueta">Proveedores Activos</span><div className="metrica-valor">{r.proveedores}</div></div>
    </div>
  )
}
