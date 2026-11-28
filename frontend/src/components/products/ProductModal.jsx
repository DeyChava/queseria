import { useEffect, useState } from 'react'
import { useCapabilities } from '../../hooks/useCapabilities'
import { useProducts } from '../../hooks/useProducts'
import { CATEGORIAS_SUGERIDAS, ETIQUETA_UNIDAD, IVA, UNIDADES } from '../../utils/constants'
import { crc, norm } from '../../utils/format'
import { FORMULARIO_VACIO, NUBE_CLOUDINARY, aFormulario, margenPct, urlImagen } from '../../utils/products'
import Field from '../Field'
import Modal from '../Modal'

const FORMATOS = ['image/jpeg', 'image/png', 'image/webp'] // los mismos que acepta el backend
const MAX_BYTES = 5 * 1024 * 1024                          // 5 MB, igual que el backend
const NUEVA = '__nueva__'                                  // valor de la opción "Agregar nueva categoría"
 

// Formulario para registrar o editar un producto (product = null para registrar).
// Obligatorios del backend: nombre, precioCompra y precioVenta. La foto se sube con POST /api/imagenes.
export default function ProductModal({ product, onClose }) {
  const { categorias: delBackend, guardar, crearCategoria } = useProducts()
  const { full } = useCapabilities()
  const editando = !!product
  const [f, setF] = useState(() => (product ? aFormulario(product) : FORMULARIO_VACIO))
  const [archivo, setArchivo] = useState(null)
  const [vista, setVista] = useState(() => (product ? urlImagen(product.imagen, 300) : ''))
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [creandoCat, setCreandoCat] = useState(false)   // se eligió "Agregar nueva categoría"
  const [nombreCat, setNombreCat] = useState('')
  const [errorCat, setErrorCat] = useState('')
  const [guardandoCat, setGuardandoCat] = useState(false)
  const cambiar = (campo) => (e) => setF({ ...f, [campo]: e.target.value })

  useEffect(() => () => { if (vista.startsWith('blob:')) URL.revokeObjectURL(vista) }, [vista])



  const elegirFoto = (e) => {
    const foto = e.target.files[0]
    if (!foto) return
    if (!FORMATOS.includes(foto.type)) return setError('Solo se aceptan imágenes JPG, PNG o WebP.')
    if (foto.size > MAX_BYTES) return setError('La imagen pesa más de 5 MB.')
    setError(''); setArchivo(foto); setVista(URL.createObjectURL(foto))
  }

   const elegirCategoria = (e) => {
    if (e.target.value === NUEVA) { setCreandoCat(true); setErrorCat(''); return }
    setCreandoCat(false); setErrorCat(''); setF({ ...f, categoria: e.target.value })
   }

    // Guarda la categoría nueva en el backend; si todo sale bien queda elegida y aparece en la lista
    const guardarCategoria = async () => {
      setGuardandoCat(true); setErrorCat('')
      const r = await crearCategoria(nombreCat)
      setGuardandoCat(false)
      if (r.error) return setErrorCat(r.error)
        setF((anterior) => ({ ...anterior, categoria: r.nombre })); setCreandoCat(false); setNombreCat('')
    }


  const enviar = async (e) => {
    e.preventDefault()
   setEnviando(true); setError('')
   let formulario = f
   if (creandoCat) { // si escribió una categoría nueva y no la guardó aparte, se guarda junto con el producto
    formulario = { ...f, categoria: r.nombre }
   }
   const r = await guardar(formulario, archivo, product)
    setEnviando(false)
    if (r.error) return setError(r.error)
    onClose()
  }

  // Las que ya existían (productos y backend) + las sugeridas + la del producto que se edita, sin repetir
  const categorias = (() => {
    const vistas = new Map()
     for (const c of [...delBackend, ...CATEGORIAS_SUGERIDAS, f.categoria]) if (c && !vistas.has(norm(c))) vistas.set(norm(c), c)
      return [...vistas.values()].sort((a, b) => a.localeCompare(b, 'es'))
  })() 
  const unidades = UNIDADES.includes(f.unidad) ? UNIDADES : [...UNIDADES, f.unidad] // producto antiguo con otra unidad
  const precioVenta = Number(f.precioVenta)
  const margen = f.precioCompra !== '' && f.precioVenta !== '' ? margenPct(Number(f.precioCompra), Number(f.precioVenta)) : null
  const stockBloqueado = full && editando   // con la extensión el stock se cambia desde Inventario (queda en el historial)

  return (
    <Modal title={editando ? 'Editar Producto' : 'Agregar Nuevo Producto'} onClose={onClose} wide>
      <form onSubmit={enviar} className="space-y-3">
        <Field id="p-nombre" label="Nombre del Producto" value={f.nombre} onChange={cambiar('nombre')} required maxLength={80} placeholder="Ej: Queso Parmesano Añejo" />
       <div className="grid gap-3 sm:grid-cols-2">
          <Field id="p-codigo" label="Código SKU" value={f.codigo} onChange={cambiar('codigo')} maxLength={20} placeholder="QS-9901" autoComplete="off" />
          <div>
            <Field id="p-categoria" label="Categoría">
              <select id="p-categoria" className="campo" value={creandoCat ? NUEVA : f.categoria} onChange={elegirCategoria}>
                <option value="">Sin categoría</option>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value={NUEVA}>➕ Agregar nueva categoría</option>
              </select>
            </Field>
            {creandoCat && (
              <div className="mt-2 rounded-lg border border-linea2 bg-campo/50 p-2.5" data-testid="nueva-categoria">
                <Field id="p-nueva-categoria" label="Nombre de la nueva categoría" value={nombreCat} maxLength={60} autoFocus autoComplete="off" placeholder="Ej: Postres artesanales"
                  onChange={(e) => { setNombreCat(e.target.value); setErrorCat('') }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); guardarCategoria() } }} />
                <div className="mt-2 flex gap-2">
                  <button type="button" className="boton-oro" onClick={guardarCategoria} disabled={guardandoCat}>{guardandoCat ? 'Guardando…' : 'Guardar categoría'}</button>
                  <button type="button" className="boton-suave" onClick={() => { setCreandoCat(false); setNombreCat(''); setErrorCat('') }}>Cancelar</button>
                </div>
                <p role="alert" className="error-texto mt-1">{errorCat}</p>
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field id="p-unidad" label="Se vende por" hint={editando ? 'No se puede cambiar si ya tiene existencias o movimientos' : undefined}>
            <select id="p-unidad" className="campo" value={f.unidad} onChange={cambiar('unidad')}>{unidades.map((u) => <option key={u} value={u}>{ETIQUETA_UNIDAD[u] ?? u}</option>)}</select>
          </Field>
          <Field id="p-compra" label="Precio de Compra (₡)" type="number" min="0" step="1" value={f.precioCompra} onChange={cambiar('precioCompra')} required placeholder="3000" />
          <Field id="p-venta" label="Precio de Venta (₡)" type="number" min="0" step="1" value={f.precioVenta} onChange={cambiar('precioVenta')} required placeholder="4500" hint={margen !== null ? `Margen de ganancia: ${margen} %` : undefined} />
        </div> 
        <div className="flex items-center justify-between gap-3 rounded-lg border border-linea2 bg-campo/50 p-3">
            <div>
               <label className="etiqueta !mb-0 cursor-pointer" htmlFor="p-iva">Aplicar I.V.A. ({Math.round(IVA * 100)} %)</label>
            <p data-testid="estado-iva" className={`mt-1 font-mono text-[11px] ${f.aplicaIva ? 'text-exito' : 'text-oro'}`}>
              {f.aplicaIva
               ? `IVA ACTIVO: se suma el ${Math.round(IVA * 100)} % al vender${f.precioVenta !== '' && precioVenta >= 0 ? ` · precio con IVA: ${crc(precioVenta * (1 + IVA))}` : ''}`
               : 'IVA DESACTIVADO: este producto se vende sin impuesto'}
            </p>
            </div>
            <input id="p-iva" type="checkbox" role="switch" className="h-5 w-5 shrink-0 cursor-pointer accent-oro" checked={f.aplicaIva} onChange={(e) => setF({ ...f, aplicaIva: e.target.checked })} />  
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
