import { crc, etiquetaDia } from '../../utils/format'

// Detalle por día del mes. Es secundario: el reporte principal es el mensual, así que aquí queda plegado.
export default function DailyDetail({ days }) {
  const max = Math.max(1, ...days.map((d) => d.total))
  return (
    <details className="tarjeta group overflow-hidden">
      <summary className="cursor-pointer list-none px-5 py-4 font-mono text-xs font-semibold uppercase text-oro-pastel hover:bg-fila">
        Detalle diario del mes <span className="ml-2 text-tenue normal-case">({days.length} {days.length === 1 ? 'día con ventas' : 'días con ventas'})</span>
      </summary>
      <div className="space-y-2 border-t border-linea p-5">
        {days.length === 0 && <p className="text-center font-mono text-xs text-tenue">Este mes todavía no hay ventas.</p>}
        {days.map((d) => (
          <div key={d.dia} className="flex items-center gap-3 font-mono text-xs">
            <span className="w-16 shrink-0 text-apagado">{etiquetaDia(d.dia)}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-campo"><div className="h-full rounded-full bg-oro" style={{ width: `${(d.total / max) * 100}%` }} /></div>
            <span className="w-24 shrink-0 text-right font-bold text-oro-claro">{crc(d.total)}</span>
            <span className="w-14 shrink-0 text-right text-tenue">{d.transacciones} {d.transacciones === 1 ? 'venta' : 'ventas'}</span>
          </div>
        ))}
      </div>
    </details>
  )
}
