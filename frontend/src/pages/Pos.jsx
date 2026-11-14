import { useState } from 'react'
import DataState from '../components/DataState'
import PosItem from '../components/pos/PosItem'
import Ticket from '../components/pos/Ticket'
import { useProducts } from '../hooks/useProducts'
import { useTicket } from '../hooks/useTicket'
import { norm } from '../utils/format'

// Punto de venta: productos reales a la izquierda y el ticket a la derecha.
export default function Pos() {
  const { productos, cargando, error, cargar } = useProducts()
  const { agregar } = useTicket()
  const [busqueda, setBusqueda] = useState('')
  const q = norm(busqueda.trim())
  const lista = productos.filter((p) => !q || norm(`${p.nombre} ${p.codigo}`).includes(q))

  return (
    <section className="space-y-6">
      <h1 className="font-title text-2xl font-bold text-titulo">Punto de Venta y Caja</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <input type="search" className="campo campo-grande" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar producto para el ticket…" aria-label="Buscar producto en caja" />
          <DataState loading={cargando} error={error} onRetry={cargar} label="Cargando productos…">
            <div className="grid max-h-[550px] gap-3 overflow-y-auto sm:grid-cols-2">
              {lista.map((p) => <PosItem key={p._id} product={p} onAdd={agregar} />)}
              {lista.length === 0 && <p className="col-span-full py-8 text-center font-mono text-xs text-apagado">{productos.length ? 'Sin resultados.' : 'Todavía no hay productos en la base de datos.'}</p>}
            </div>
          </DataState>
        </div>
        <Ticket />
      </div>
    </section>
  )
}
