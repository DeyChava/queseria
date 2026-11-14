import { useState } from 'react'
import DataState from '../components/DataState'
import InventorySummary from '../components/inventory/InventorySummary'
import InventoryTable from '../components/inventory/InventoryTable'
import DeleteProductModal from '../components/products/DeleteProductModal'
import ProductModal from '../components/products/ProductModal'
import { useProducts } from '../hooks/useProducts'

// Panel de inventario con los datos reales: resumen, tabla con ajuste de stock, edición y eliminación.
export default function Inventory() {
  const { productos, cargando, error, cargar } = useProducts()
  const [editar, setEditar] = useState(null)
  const [borrar, setBorrar] = useState(null)

  return (
    <section className="space-y-6">
      <h1 className="font-title text-2xl font-bold text-titulo">Panel de Inventario</h1>
      <DataState loading={cargando} error={error} onRetry={cargar} label="Cargando inventario…">
        <InventorySummary products={productos} />
        <p className="nota">
          <strong>Estado del stock:</strong> depende del <strong>stock mínimo</strong> de cada producto. Crítico si el stock es igual o menor al mínimo;
          bajo hasta el doble del mínimo; normal por encima. Las alertas suman bajo y crítico.
        </p>
        <InventoryTable products={productos} onEdit={setEditar} onDelete={setBorrar} />
      </DataState>
      {editar && <ProductModal product={editar} onClose={() => setEditar(null)} />}
      {borrar && <DeleteProductModal product={borrar} onClose={() => setBorrar(null)} />}
    </section>
  )
}
