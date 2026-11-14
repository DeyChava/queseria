import { useState } from 'react'
import DataState from '../components/DataState'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/products/ProductModal'
import { useAuth } from '../hooks/useAuth'
import { useProducts } from '../hooks/useProducts'
import { norm } from '../utils/format'
import { categoriasPresentes } from '../utils/products'

// Catálogo y buscador: busca por nombre, código, proveedor o categoría y filtra por categoría.
// Las categorías de los filtros son las que realmente existen en MongoDB. Registrar productos es del administrador.
export default function Catalog() {
  const { productos, cargando, error, cargar } = useProducts()
  const { esAdmin } = useAuth()
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [nuevo, setNuevo] = useState(false)

  const q = norm(busqueda.trim())
  const lista = productos.filter((p) => (categoria === 'Todos' || p.categoria === categoria) && (!q || norm([p.nombre, p.codigo, p.categoria, p.proveedor].join(' ')).includes(q)))

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-linea bg-card p-6 text-center shadow-brillo sm:p-8">
        <div className="mx-auto max-w-2xl space-y-3">
          <h1 className="font-title text-2xl text-oro-claro sm:text-3xl">Consulta Rápida de Productos</h1>
          <p className="text-xs text-apagado sm:text-sm">Busca por nombre, código, proveedor o categoría para ver las existencias disponibles.</p>
          <form className="mx-auto flex max-w-xl flex-col gap-2 pt-4 sm:flex-row" onSubmit={(e) => e.preventDefault()} role="search">
            <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Ej: Mozzarella, QS-9901, Helado…" aria-label="Buscar producto"
              className="w-full rounded-xl border border-oro/40 bg-campo px-4 py-3 text-sm text-titulo placeholder:text-tenue focus:border-oro focus:outline-none" />
            <button type="submit" className="boton-oro !px-6 !py-3">Buscar</button>
          </form>
          <div className="flex flex-wrap justify-center gap-2 pt-3">
            {['Todos', ...categoriasPresentes(productos)].map((c) => (
              <button key={c} type="button" className={`chip ${c === categoria ? 'activo' : ''}`} onClick={() => setCategoria(c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-linea pb-4">
        <div>
          <h2 className="font-title text-xl font-bold text-titulo">Nuestros Productos</h2>
          <p className="mt-1 text-xs text-apagado">{lista.length} {lista.length === 1 ? 'producto' : 'productos'}</p>
        </div>
        {esAdmin && <button type="button" className="boton-oro shrink-0" onClick={() => setNuevo(true)}><Icon name="mas" size={14} />Agregar Nuevo Producto</button>}
      </div>

      <DataState loading={cargando} error={error} onRetry={cargar} label="Cargando productos…">
        {lista.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{lista.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        ) : (
          <p className="py-10 text-center font-mono text-xs text-apagado">{productos.length ? 'No hay productos que coincidan. Prueba con otro nombre, código o categoría.'
            : esAdmin ? 'Todavía no hay productos en la base de datos. Usa "Agregar Nuevo Producto" para registrar el primero.' : 'Todavía no hay productos en el catálogo.'}</p>
        )}
      </DataState>

      {nuevo && <ProductModal product={null} onClose={() => setNuevo(false)} />}
    </section>
  )
}
