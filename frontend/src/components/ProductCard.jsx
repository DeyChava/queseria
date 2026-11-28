import { useState } from 'react'
import { useTicket } from '../hooks/useTicket'
import { cantidad, crc, fechaCorta, unidadCorta } from '../utils/format'
import { iconoDeCategoria } from '../utils/icons'
import { ETIQUETA_ESTADO, estadoStock } from '../utils/inventory'
import { urlImagen, vencimiento } from '../utils/products'
import Icon from './Icon'

// Tarjeta de producto de tu diseño: foto arriba (object-contain), código y categoría en etiquetas,
// proveedor, nombre en Cinzel, descripción y precio. Todo sale de los campos reales del producto.
export default function ProductCard({ product: p }) {
  const { agregar } = useTicket()
  const [fallo, setFallo] = useState(false)
  const url = urlImagen(p.imagen)
  const estado = estadoStock(p)
  const venc = vencimiento(p)
  const colorStock = estado === 'crit' ? 'text-peligro' : estado === 'bajo' ? 'text-oro' : 'text-apagado'

  return (
    <article className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-linea bg-card shadow-lg transition hover:border-oro/30">
      <div className="relative flex h-64 w-full items-center justify-center overflow-hidden border-b border-linea bg-campo">
        {url && !fallo
          ? <img src={url} alt={p.nombre} loading="lazy" onError={() => setFallo(true)} className="h-full w-full object-contain p-4" />
          : <div className="flex flex-col items-center text-oro"><Icon name={iconoDeCategoria(p.categoria)} size={48} stroke={1.5} /><span className="mt-2 font-mono text-xs text-apagado">Sin Fotografía</span></div>}
        {p.codigo && <span className="absolute left-3 top-3 max-w-[45%] truncate rounded-lg border border-oro/30 bg-black/80 px-2.5 py-1 font-mono text-[10px] text-amber-300 backdrop-blur">#{p.codigo}</span>}
        <span className="absolute right-3 top-3 max-w-[45%] truncate rounded-lg border border-oro/30 bg-black/80 px-2.5 py-1 font-mono text-[10px] text-amber-400 backdrop-blur">{p.categoria}</span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div>
          {p.proveedor && <span className="mb-1 block font-mono text-[11px] text-oro-pastel/70">{p.proveedor}</span>}
          <h3 className="mb-2 font-title text-base font-bold leading-snug text-titulo">{p.nombre}</h3>
          {p.descripcion && <p className="text-xs leading-relaxed text-apagado">{p.descripcion}</p>}
        </div>
        <div className="flex items-end justify-between gap-2 border-t border-linea pt-4">
          <div>
            <span className={`block font-mono text-[10px] uppercase ${colorStock}`}>STOCK: {cantidad(p.stock)} {unidadCorta(p.unidad)}{estado !== 'normal' ? ` · ${ETIQUETA_ESTADO[estado]}` : ''}</span>
            {venc && <span className={`block font-mono text-[10px] uppercase ${venc.estado === 'vencido' ? 'text-peligro' : venc.estado === 'pronto' ? 'text-oro' : 'text-tenue'}`}>{venc.estado === 'vencido' ? 'VENCIDO' : 'VENCE'}: {fechaCorta(venc.fecha)}</span>}
            <span className="font-mono text-xl font-bold text-oro-claro">{crc(p.precioVenta)}</span>
            <span className="ml-1 font-mono text-[10px] uppercase text-tenue">/ {unidadCorta(p.unidad)}</span>
            <span className="ml-1 font-mono text-[10px] uppercase text-tenue" data-testid="etiqueta-iva">{p.aplicaIva === false ? "· sin IVA" : "+ IVA"}</span>
          </div>
          <button type="button" className="boton-oro" onClick={() => agregar(p)} disabled={p.stock <= 0}>
            {p.stock <= 0 ? 'Agotado' : <><Icon name="mas" size={14} />Agregar</>}
          </button>
        </div>
      </div>
    </article>
  )
}
