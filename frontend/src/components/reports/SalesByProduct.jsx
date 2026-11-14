import { cantidad, crc, unidadCorta } from '../../utils/format'

// REPORTE MENSUAL DE VENTAS POR PRODUCTO: unidades vendidas, lo vendido en colones, el costo y la ganancia real
// (calculados con el precio y el costo de cada venta, así no cambian si después se edita el producto).
export default function SalesByProduct({ rows }) {
  const vendidos = rows.filter((f) => f.vendidas > 0)
  return (
    <div className="tabla-caja">
      <div className="overflow-x-auto">
        <table className="tabla">
          <thead><tr><th>Producto</th><th className="text-right">Vendidas</th><th className="text-right">Ventas (₡)</th><th className="text-right">Costo (₡)</th><th className="text-right">Ganancia (₡)</th><th className="text-right">Margen</th></tr></thead>
          <tbody>
            {vendidos.length === 0 && <tr><td colSpan={6} className="!py-8 text-center text-tenue">Este mes todavía no hay ventas registradas.</td></tr>}
            {vendidos.map((f) => (
              <tr key={f.producto}>
                <td className="min-w-52"><b className="text-titulo">{f.nombre}</b><span className="mt-0.5 block text-[10px] font-normal text-tenue">{f.codigo || 'Sin código'} · {f.categoria || 'Sin categoría'}</span></td>
                <td className="text-right">{cantidad(f.vendidas)} <span className="text-apagado">{unidadCorta(f.unidad)}</span></td>
                <td className="text-right text-oro-claro">{crc(f.ingresos)}</td>
                <td className="text-right text-apagado">{crc(f.costo)}</td>
                <td className={`text-right font-bold ${f.ganancia >= 0 ? 'text-exito' : 'text-peligro'}`}>{crc(f.ganancia)}</td>
                <td className="text-right">{f.margenReal} %</td>
              </tr>
            ))}
          </tbody>
          {vendidos.length > 1 && (
            <tfoot>
              <tr className="border-t border-linea bg-panel font-bold">
                <td className="text-oro-pastel">TOTAL DEL MES</td><td />
                <td className="text-right text-oro-claro">{crc(vendidos.reduce((a, f) => a + f.ingresos, 0))}</td>
                <td className="text-right text-apagado">{crc(vendidos.reduce((a, f) => a + f.costo, 0))}</td>
                <td className="text-right text-exito">{crc(vendidos.reduce((a, f) => a + f.ganancia, 0))}</td><td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
