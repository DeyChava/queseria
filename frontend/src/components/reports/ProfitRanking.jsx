import { useState } from 'react'
import { cantidad, crc, unidadCorta } from '../../utils/format'
import { rankingRentabilidad } from '../../utils/reports'
import Icon from '../Icon'

function Lista({ titulo, icono, tono, filas }) {
  return (
    <div className="tarjeta overflow-hidden">
      <div className={`flex items-center gap-2 border-b border-linea bg-panel px-5 py-3 font-mono text-xs font-semibold uppercase ${tono}`}><Icon name={icono} size={16} />{titulo}</div>
      {filas.length === 0 && <p className="px-5 py-6 text-center font-mono text-xs text-tenue">Sin datos suficientes este mes.</p>}
      <ol>
        {filas.map((f, i) => (
          <li key={f.producto} className="flex items-center gap-3 border-t border-linea px-5 py-3 first:border-t-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-campo font-mono text-[11px] font-bold text-oro-claro">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-titulo">{f.nombre}</span>
              <span className="font-mono text-[10px] text-tenue">{cantidad(f.vendidas)} {unidadCorta(f.unidad)} vendidas</span>
            </span>
            <span className="text-right font-mono">
              <span className={`block text-sm font-bold ${f.ganancia >= 0 ? 'text-exito' : 'text-peligro'}`}>{crc(f.ganancia)}</span>
              <span className="text-[10px] text-apagado">margen {f.margenReal} %</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

// Productos MÁS y MENOS rentables del mes, por ganancia en colones o por margen en porcentaje.
// Más abajo, los productos que no tuvieron ninguna venta (la rentabilidad más baja: dinero detenido en el estante).
export default function ProfitRanking({ rows }) {
  const [criterio, setCriterio] = useState('ganancia')
  const { mas, menos, sinVentas } = rankingRentabilidad(rows, criterio)
  return (
    <div className="space-y-4">
      <div className="no-imprimir flex gap-2">
        <button type="button" className={`chip ${criterio === 'ganancia' ? 'activo' : ''}`} onClick={() => setCriterio('ganancia')}>Por ganancia (₡)</button>
        <button type="button" className={`chip ${criterio === 'margen' ? 'activo' : ''}`} onClick={() => setCriterio('margen')}>Por margen (%)</button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Lista titulo="Más rentables" icono="trofeo" tono="text-exito" filas={mas} />
        <Lista titulo="Menos rentables" icono="bajar" tono="text-peligro" filas={menos} />
      </div>
      {sinVentas.length > 0 && (
        <div className="nota">
          <strong>Sin ventas este mes ({sinVentas.length}):</strong> {sinVentas.map((f) => f.nombre).join(' · ')}
        </div>
      )}
    </div>
  )
}
