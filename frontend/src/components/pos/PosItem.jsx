import { cantidad, crc, unidadCorta } from '../../utils/format'
import { iconoDeCategoria } from '../../utils/icons'
import Icon from '../Icon'

// Producto seleccionable en el punto de venta (tarjeta pequeña de tu diseño).
export default function PosItem({ product: p, onAdd }) {
  return (
    <button type="button" onClick={() => onAdd(p)} disabled={p.stock <= 0}
      className="group flex w-full items-center justify-between gap-3 rounded-xl border border-linea bg-card p-3 text-left transition enabled:hover:border-oro/40 disabled:opacity-50">
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-linea2 bg-campo text-oro"><Icon name={iconoDeCategoria(p.categoria)} /></span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-bold text-titulo transition group-enabled:group-hover:text-oro-claro">{p.nombre}</span>
          <span className="font-mono text-[10px] text-apagado">{crc(p.precioVenta)} · {p.stock <= 0 ? 'Agotado' : `Stock: ${cantidad(p.stock)} ${unidadCorta(p.unidad)}`}</span>
        </span>
      </span>
      <span className="rounded bg-oro/10 px-2.5 py-1 font-mono text-xs font-bold text-oro-claro transition group-enabled:group-hover:bg-oro group-enabled:group-hover:text-sobre-oro">+</span>
    </button>
  )
}
