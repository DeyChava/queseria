import { crc } from '../../utils/format'
import { variacion } from '../../utils/reports'
import Delta from './Delta'

// Las 4 cifras del mes, cada una comparada con el mes anterior. Las ventas y la ganancia van SIN IVA
// (el IVA que se cobra no es ganancia del negocio).
export default function KpiCards({ reporte }) {
  const { totales: t, anterior: a } = reporte
  const margen = t.ingresos > 0 ? Math.round((t.ganancia / t.ingresos) * 100) : 0
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="metrica"><span className="metrica-etiqueta">Ventas del mes (sin IVA)</span><div className="metrica-valor text-oro-claro">{crc(t.ingresos)}</div><Delta valor={variacion(t.ingresos, a.ingresos)} /></div>
      <div className="metrica"><span className="metrica-etiqueta">Ganancia del mes</span><div className="metrica-valor text-exito">{crc(t.ganancia)}</div><p className="mt-1 font-mono text-[10px] text-apagado">Margen real: {margen} %</p><Delta valor={variacion(t.ganancia, a.ganancia)} /></div>
      <div className="metrica"><span className="metrica-etiqueta">Transacciones</span><div className="metrica-valor">{t.transacciones}</div><Delta valor={variacion(t.transacciones, a.transacciones)} /></div>
      <div className="metrica"><span className="metrica-etiqueta">Ticket promedio</span><div className="metrica-valor">{crc(t.ticketPromedio)}</div><p className="mt-1 font-mono text-[10px] text-apagado">IVA cobrado: {crc(t.ivaCobrado)}</p></div>
    </div>
  )
}
