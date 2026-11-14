import { useEffect, useState } from 'react'
import { useCapabilities } from '../../hooks/useCapabilities'
import { useProducts } from '../../hooks/useProducts'
import { CATEGORIAS_SUGERIDAS, UNIDADES } from '../../utils/constants'
import { FORMULARIO_VACIO, NUBE_CLOUDINARY, aFormulario, categoriasPresentes, margenPct, urlImagen } from '../../utils/products'
import Field from '../Field'
import Modal from '../Modal'

const FORMATOS = ['image/jpeg', 'image/png', 'image/webp'] // los mismos que acepta el backend
const MAX_BYTES = 5 * 1024 * 1024                          // 5 MB, igual que el backend

// Formulario para registrar o editar un producto (product = null para registrar).
// Obligatorios del backend: nombre, precioCompra y precioVenta. La foto se sube con POST /api/imagenes.
export default function ProductModal({ product, onClose }) {
  const { productos, guardar } = useProducts()
  const { full } = useCapabilities()
  const editando = !!product
  const [f, setF] = useState(() => (product ? aFormulario(product) : FORMULARIO_VACIO))
  const [archivo, setArchivo] = useState(null)
  const [vista, setVista] = useState(() => (product ? urlImagen(product.imagen, 300) : ''))
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const cambiar = (campo) => (e) => setF({ ...f, [campo]: e.target.value })

  useEffect(() => () => { if (vista.startsWith('blob:')) URL.revokeObjectURL(vista) }, [vista])

  const elegirFoto = (e) => {
    const foto = e.target.files[0]
    if (!foto) return
    if (!FORMATOS.includes(foto.type)) return setError('Solo se aceptan imágenes JPG, PNG o WebP.')
    if (foto.size > MAX_BYTES) return setError('La imagen pesa más de 5 MB.')
    setError(''); setArchivo(foto); setVista(URL.createObjectURL(foto))
  }

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    const r = await guardar(f, archivo, product)
    setEnviando(false)
    if (r.error) return setError(r.error)
    onClose()
  }

  const categorias = [...new Set([...categoriasPresentes(productos), ...CATEGORIAS_SUGERIDAS])]
  const margen = f.precioCompra !== '' && f.precioVenta !== '' ? margenPct(Number(f.precioCompra), Number(f.precioVenta)) : null
  const stockBloqueado = full && editando   // con la extensión el stock se cambia desde Inventario (queda en el historial)

  return (
    <Modal title={editando ? 'Editar Producto' : 'Agregar Nuevo Producto'} onClose={onClose} wide>
      <form onSubmit={enviar} className="space-y-3">
        <Field id="p-nombre" label="Nombre del Producto" value={f.nombre} onChange={cambiar('nombre')} required maxLength={80} placeholder="Ej: Queso Parmesano Añejo" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="p-codigo" label="Código SKU" value={f.codigo} onChange={cambiar('codigo')} maxLength={20} placeholder="QS-9901" autoComplete="off" />
          <div>
            <Field id="p-categoria" label="Categoría" value={f.categoria} onChange={cambiar('categoria')} list="lista-categorias" placeholder="Escribe o elige una" />
            <datalist id="lista-categorias">{categorias.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field id="p-unidad" label="Se vende por"><select id="p-unidad" className="campo" value={f.unidad} onChange={cambiar('unidad')}>{UNIDADES.map((u) => <option key={u}>{u}</option>)}</select></Field>
          <Field id="p-compra" label="Precio de Compra (₡)" type="number" min="0" step="1" value={f.precioCompra} onChange={cambiar('precioCompra')} required placeholder="3000" />
          <Field id="p-venta" label="Precio de Venta (₡)" type="number" min="0" step="1" value={f.precioVenta} onChange={cambiar('precioVenta')} required placeholder="4500" hint={margen !== null ? `Margen de ganancia: ${margen} %` : undefined} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field id="p-stock" label={editando ? 'Stock actual' : 'Stock inicial'} type="number" min="0" step="any" value={f.stock} onChange={cambiar('stock')} placeholder="50" disabled={stockBloqueado} hint={stockBloqueado ? 'Cámbialo desde Inventario' : undefined} />
          <Field id="p-minimo" label="Stock Mínimo" type="number" min="0" step="any" value={f.stockMinimo} onChange={cambiar('stockMinimo')} hint="Aviso de stock bajo" />
          <Field id="p-dias" label="Días de Vida" type="number" min="0" step="1" value={f.diasVida} onChange={cambiar('diasVida')} hint="Cuánto dura (opcional)" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="p-fecha" label="Fecha de Compra" type="date" value={f.fechaCompra} onChange={cambiar('fechaCompra')} />
          <Field id="p-proveedor" label="Proveedor" value={f.proveedor} onChange={cambiar('proveedor')} maxLength={60} placeholder="Nombre del proveedor" />
        </div>
        <Field id="p-descripcion" label="Descripción Breve"><textarea id="p-descripcion" rows={2} className="campo" value={f.descripcion} onChange={cambiar('descripcion')} placeholder="Textura, sabor, detalles del producto..." /></Field>
        <div>
          <label className="etiqueta" htmlFor="p-foto">Fotografía (JPG, PNG o WebP, máx. 5 MB)</label>
          <div className="flex items-center gap-3">
            {vista && <img src={vista} alt="Vista previa" width={64} height={64} className="h-16 w-16 rounded-lg bg-campo object-contain" />}
            <input id="p-foto" type="file" className="campo" accept={FORMATOS.join(',')} onChange={elegirFoto} />
          </div>
          {!NUBE_CLOUDINARY && <p className="mt-1 font-mono text-[10px] text-tenue">Para ver las fotos en el catálogo falta VITE_CLOUDINARY_CLOUD_NAME en frontend/.env</p>}
        </div>
        <p role="alert" className="error-texto">{error}</p>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="boton-suave" onClick={onClose}>Cancelar</button>
          <button type="submit" className="boton-oro" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar Producto'}</button>
        </div>
      </form>
    </Modal>
  )
}
