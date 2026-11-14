import { useEffect, useMemo, useState } from 'react'
import DataState from '../components/DataState'
import Icon from '../components/Icon'
import DailyDetail from '../components/reports/DailyDetail'
import InventoryReport from '../components/reports/InventoryReport'
import KpiCards from '../components/reports/KpiCards'
import ProfitRanking from '../components/reports/ProfitRanking'
import SalesByProduct from '../components/reports/SalesByProduct'
import UnitsComparison from '../components/reports/UnitsComparison'
import { useCapabilities } from '../hooks/useCapabilities'
import { useProducts } from '../hooks/useProducts'
import { getMonthlyReport } from '../services/reportService'
import { etiquetaMes, ultimosMeses } from '../utils/format'
import { descargarCsv, filasDelReporte } from '../utils/reports'

const MESES = ultimosMeses(12)

const COLUMNAS_CSV = [
  { titulo: 'Producto', valor: (f) => f.nombre }, { titulo: 'Código', valor: (f) => f.codigo }, { titulo: 'Categoría', valor: (f) => f.categoria },
  { titulo: 'Unidad', valor: (f) => f.unidad }, { titulo: 'Unidades ingresadas', valor: (f) => f.ingresadas }, { titulo: 'Unidades vendidas', valor: (f) => f.vendidas },
  { titulo: 'Rotación (%)', valor: (f) => (f.ingresadas > 0 ? Math.round((f.vendidas / f.ingresadas) * 100) : '') }, { titulo: 'Ventas (CRC, sin IVA)', valor: (f) => f.ingresos },
  { titulo: 'Costo (CRC)', valor: (f) => f.costo }, { titulo: 'Ganancia (CRC)', valor: (f) => f.ganancia }, { titulo: 'Margen real (%)', valor: (f) => f.margenReal },
]

function Seccion({ titulo, nota, children }) {
  return (
    <div className="space-y-3 break-inside-avoid">
      <div><h2 className="font-title text-lg font-bold text-oro-claro">{titulo}</h2>{nota && <p className="mt-1 text-xs text-apagado">{nota}</p>}</div>
      {children}
    </div>
  )
}

// REPORTES. El reporte principal es el MENSUAL (el diario queda como detalle plegado dentro del mes).
//  - Con la extensión del backend: ventas por producto, unidades ingresadas frente a vendidas, y productos más y menos
//    rentables, con datos reales de MongoDB y comparación contra el mes anterior.
//  - Con el backend básico: reporte de inventario (valor, rentabilidad por precios, alertas y vencimientos).
export default function Reports() {
  const { full } = useCapabilities()
  const { productos, cargando: cargandoProductos, error: errorProductos, cargar } = useProducts()
  const [mes, setMes] = useState(MESES[0])
  const [reporte, setReporte] = useState(null)
  const [cargando, setCargando] = useState(full)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!full) return undefined
    let activo = true
    setCargando(true); setError('')
    getMonthlyReport(mes).then((r) => activo && setReporte(r)).catch((e) => activo && setError(e.message)).finally(() => activo && setCargando(false))
    return () => { activo = false }
  }, [full, mes])

  const filas = useMemo(() => (reporte ? filasDelReporte(reporte, productos) : []), [reporte, productos])

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-title text-2xl font-bold text-titulo">{full ? 'Reportes Mensuales' : 'Reportes de Inventario'}</h1>
          <p className="mt-1 text-xs text-apagado">{full ? `Resumen de ${etiquetaMes(mes)}, comparado con el mes anterior.` : 'Datos reales de la base de datos.'}</p>
        </div>
        {full && (
          <div className="no-imprimir flex flex-wrap items-end gap-2">
            <div>
              <label className="etiqueta" htmlFor="reporte-mes">Mes</label>
              <select id="reporte-mes" className="campo !w-auto" value={mes} onChange={(e) => setMes(e.target.value)}>{MESES.map((m) => <option key={m} value={m}>{etiquetaMes(m)}</option>)}</select>
            </div>
            <button type="button" className="boton-suave" disabled={!reporte} onClick={() => descargarCsv(`reporte-${mes}.csv`, COLUMNAS_CSV, filas)}><Icon name="descargar" size={14} />CSV</button>
            <button type="button" className="boton-suave" onClick={() => window.print()}><Icon name="imprimir" size={14} />Imprimir / PDF</button>
          </div>
        )}
      </div>

      {full ? (
        <DataState loading={cargando || cargandoProductos} error={error || errorProductos} onRetry={error ? () => setMes((m) => m) : cargar} label="Calculando el reporte del mes…">
          {reporte && (
            <>
              <KpiCards reporte={reporte} />
              <Seccion titulo="Ventas por producto" nota="Lo vendido, el costo y la ganancia real de cada producto en el mes (precios y costos de cada venta).">
                <SalesByProduct rows={filas} />
              </Seccion>
              <Seccion titulo="Unidades ingresadas vs vendidas" nota="Cuántas unidades entraron al inventario y cuántas se vendieron: así se distinguen los productos de alta y baja rotación.">
                <UnitsComparison rows={filas} />
              </Seccion>
              <Seccion titulo="Productos más y menos rentables" nota="Ordenados con la ganancia real del mes. Los que no se vendieron aparecen al final.">
                <ProfitRanking rows={filas} />
              </Seccion>
              <DailyDetail days={reporte.porDia} />
            </>
          )}
        </DataState>
      ) : (
        <>
          <div className="nota">
            <strong>Reportes de ventas no disponibles.</strong> Las ventas por producto, las unidades ingresadas frente a vendidas y la rentabilidad real
            necesitan que el backend guarde ventas y movimientos de stock. Se agregan con la carpeta <strong>backend-extension</strong> (instrucciones en su LEEME.md).
            Mientras tanto, estos son los reportes de inventario con datos reales.
          </div>
          <DataState loading={cargandoProductos} error={errorProductos} onRetry={cargar} label="Cargando productos…">
            <InventoryReport products={productos} />
          </DataState>
        </>
      )}
    </section>
  )
}
