import { cantidad, unidadCorta } from '../../utils/format'

// Unidades que INGRESARON frente a las que se VENDIERON, por producto, con la rotación del mes.
// Sirve para ver qué productos salen rápido (alta rotación) y cuáles se quedan en el estante (baja rotación).
export default function UnitsComparison({ rows }) {
  const max = Math.max(1, ...rows.flatMap((f) => [f.ingresadas, f.vendidas]))
  const ordenadas = [...rows].sort((a, b) => (b.vendidas / (b.ingresadas || 1)) - (a.vendidas / (a.ingresadas || 1)) || b.vendidas - a.vendidas)
  return (
    <div className="space-y-3">
      <div className="flex gap-4 font-mono text-xs text-apagado">
        <span><i className="mr-1 inline-block h-2 w-3 rounded bg-oro" />Ingresadas</span>
        <span><i className="mr-1 inline-block h-2 w-3 rounded bg-exito" />Vendidas</span>
      </div>
      <div className="tabla-caja">
        <div className="overflow-x-auto">
          <table className="tabla">
            <thead><tr><th>Producto</th><th className="text-right">Ingresadas</th><th className="text-right">Vendidas</th><th className="min-w-40">Comparación</th><th className="text-right">Rotación</th><th>Clasificación</th><th className="text-right">Stock actual</th></tr></thead>
            <tbody>
              {ordenadas.length === 0 && <tr><td colSpan={7} className="!py-8 text-center text-tenue">Todavía no hay productos.</td></tr>}
              {ordenadas.map((f) => (
                <tr key={f.producto}>
                  <td className="min-w-52"><b className="text-titulo">{f.nombre}</b><span className="mt-0.5 block text-[10px] font-normal text-tenue">{f.codigo || 'Sin código'}</span></td>
                  <td className="text-right font-bold text-oro-claro">{cantidad(f.ingresadas)}</td>
                  <td className="text-right font-bold">{cantidad(f.vendidas)}</td>
                  <td>
                    <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-campo"><div className="h-full rounded-full bg-oro" style={{ width: `${(f.ingresadas / max) * 100}%` }} /></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-campo"><div className="h-full rounded-full bg-exito" style={{ width: `${(f.vendidas / max) * 100}%` }} /></div>
                  </td>
                  <td className="text-right">{f.ingresadas > 0 ? `${Math.round((f.vendidas / f.ingresadas) * 100)} %` : '—'}</td>
                  <td><span className={`estado estado-${f.clase.tono}`}>{f.clase.texto}</span></td>
                  <td className="text-right text-apagado">{f.stockActual === null ? '—' : `${cantidad(f.stockActual)} ${unidadCorta(f.unidad)}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="font-mono text-[10px] text-tenue">Rotación = unidades vendidas ÷ unidades ingresadas en el mes: alta desde 60 %, media de 30 a 59 %, baja menos de 30 %. “Vendió stock previo” = vendió sin haber ingresado nada este mes.</p>
    </div>
  )
}
