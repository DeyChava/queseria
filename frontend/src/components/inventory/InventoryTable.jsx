import { useAuth } from '../../hooks/useAuth'
import { useProducts } from '../../hooks/useProducts'
import { cantidad, crc, unidadCorta } from '../../utils/format'
import { ETIQUETA_ESTADO, estadoStock } from '../../utils/inventory'
import Icon from '../Icon'

// Tabla del inventario (columnas de tu diseño). Todo es de MongoDB:
//  - los botones − y + y "+10" cambian el stock (con la extensión queda anotado como ingreso o ajuste)
//  - Editar y Eliminar (solo administrador) abren sus ventanas
export default function InventoryTable({ products, onEdit, onDelete }) {
  const { ajustar } = useProducts()
  const { esAdmin } = useAuth()

  return (
    <div className="tabla-caja">
      <div className="overflow-x-auto">
        <table className="tabla">
          <thead>
            <tr><th>SKU</th><th>Producto</th><th>Categoría</th><th>Precio (₡)</th><th>Stock Actual</th><th>Estado</th><th className="text-right">Acciones</th></tr>
          </thead>
          <tbody>
            {products.length === 0 && <tr><td colSpan={7} className="!py-8 text-center text-tenue">Todavía no hay productos en la base de datos.</td></tr>}
            {products.map((p) => {
              const estado = estadoStock(p)
              return (
                <tr key={p._id}>
                  <td className="text-oro-claro">{p.codigo || '—'}</td>
                  <td className="min-w-52">
                    <b className="text-titulo">{p.nombre}</b>
                    <span className="mt-0.5 block text-[10px] font-normal text-tenue">{p.proveedor || 'Sin proveedor'} · mínimo {cantidad(p.stockMinimo)}</span>
                  </td>
                  <td className="text-apagado">{p.categoria}</td>
                  <td className="font-bold text-oro-claro">{crc(p.precioVenta)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button type="button" className="boton-mini" onClick={() => ajustar(p, -1)} aria-label={`Restar una unidad a ${p.nombre}`}><Icon name="menos" size={12} /></button>
                      <span className="min-w-14 text-center font-bold">{cantidad(p.stock)} <span className="font-normal text-apagado">{unidadCorta(p.unidad)}</span></span>
                      <button type="button" className="boton-mini" onClick={() => ajustar(p, 1)} aria-label={`Sumar una unidad a ${p.nombre}`}><Icon name="mas" size={12} /></button>
                    </div>
                  </td>
                  <td><span className={`estado estado-${estado}`}>{ETIQUETA_ESTADO[estado]}</span></td>
                  <td>
                    <div className="flex flex-wrap justify-end gap-1">
                      <button type="button" className="boton-accion" onClick={() => ajustar(p, 10)}>+10 Reabastecer</button>
                      {esAdmin && <button type="button" className="boton-accion" onClick={() => onEdit(p)} aria-label={`Editar ${p.nombre}`}><Icon name="editar" size={12} />Editar</button>}
                      {esAdmin && <button type="button" className="boton-accion peligro" onClick={() => onDelete(p)} aria-label={`Eliminar ${p.nombre}`}><Icon name="papelera" size={12} /></button>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
