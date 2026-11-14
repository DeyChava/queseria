import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCapabilities } from '../hooks/useCapabilities'
import { useToast } from '../hooks/useToast'
import { createProduct, deleteProduct, getProducts, updateProduct, uploadImage } from '../services/productService'
import { adjustStock } from '../services/stockService'
import { aPayload, validarProducto } from '../utils/products'
import { ProductsContext } from './contexts'

const ordenar = (lista) => [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

// Productos reales de MongoDB. Se cargan con GET /api/productos cuando se puede (sin sesión en el backend básico,
// o con sesión iniciada en el completo). Las acciones devuelven { ok: true } o { error: 'mensaje' }.
export default function ProductsProvider({ children }) {
  const { cargando: cargandoCaps, full, error: errorCaps, comprobar } = useCapabilities()
  const { usuario } = useAuth()
  const { toast } = useToast()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const listo = !cargandoCaps && (!full || !!usuario)

  const cargarProductos = useCallback(async () => {
    setCargando(true)
    setError('')
    try { setProductos(await getProducts()) } catch (err) { setError(err.message) } finally { setCargando(false) }
  }, [])

  useEffect(() => { if (listo) cargarProductos(); else setProductos([]) }, [listo, cargarProductos])

  // "Reintentar" y recargas manuales. Si el backend no respondía al abrir la página, primero se le vuelve a preguntar
  // qué soporta (por ejemplo, si tiene login): al volver a conocerlo, la carga de productos o el login se activan solos.
  const cargar = useCallback(async () => {
    if (errorCaps) { await comprobar(); return }
    await cargarProductos()
  }, [errorCaps, comprobar, cargarProductos])

  // Crear (producto = null) o editar. Con foto nueva: primero POST /api/imagenes y su nombre corto va en "imagen".
  // Con la extensión el stock NO se manda por PUT: el stock inicial se registra con POST /api/productos/:id/stock
  // para que quede en el historial de ingresos (así el reporte mensual lo cuenta).
  const guardar = useCallback(async (formulario, archivoFoto, producto = null) => {
    const invalido = validarProducto(formulario, productos, producto?._id)
    if (invalido) return { error: invalido }
    try {
      const imagen = archivoFoto ? await uploadImage(archivoFoto) : ''
      const datos = aPayload(formulario, imagen, !full)
      let guardado
      if (producto) {
        guardado = await updateProduct(producto._id, datos)
      } else {
        const inicial = Number(formulario.stock) || 0
        guardado = await createProduct(full ? { ...datos, stock: 0 } : datos)
        if (full && inicial > 0) {
          try { guardado = await adjustStock(guardado, inicial, { full, nota: 'Stock inicial' }) } catch (err) {
            toast(`Producto creado, pero no se pudo registrar su stock inicial: ${err.message}`, 'error')
          }
        }
      }
      setProductos((ps) => ordenar(producto ? ps.map((p) => (p._id === guardado._id ? guardado : p)) : [...ps, guardado]))
      toast(producto ? 'Producto actualizado' : '¡Producto añadido con éxito!')
      return { ok: true }
    } catch (err) {
      return { error: err.message }
    }
  }, [productos, full, toast])

  const eliminar = useCallback(async (producto) => {
    try {
      await deleteProduct(producto._id)
      setProductos((ps) => ps.filter((p) => p._id !== producto._id))
      toast('Producto eliminado')
      return { ok: true }
    } catch (err) {
      return { error: err.message }
    }
  }, [toast])

  // Botones + y − del inventario (con la extensión queda anotado como ingreso o ajuste)
  const ajustar = useCallback(async (producto, delta, nota) => {
    if (producto.stock + delta < 0) return { error: 'No hay stock suficiente para bajar esa cantidad.' }
    try {
      const guardado = await adjustStock(producto, delta, { full, nota })
      setProductos((ps) => ps.map((p) => (p._id === guardado._id ? guardado : p)))
      return { ok: true }
    } catch (err) {
      toast(err.message, 'error')
      return { error: err.message }
    }
  }, [full, toast])

  const valor = useMemo(
    () => ({ productos, cargando: cargando || cargandoCaps, error, cargar, guardar, eliminar, ajustar }),
    [productos, cargando, cargandoCaps, error, cargar, guardar, eliminar, ajustar],
  )
  return <ProductsContext.Provider value={valor}>{children}</ProductsContext.Provider>
}
