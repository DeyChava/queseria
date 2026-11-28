import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCapabilities } from '../hooks/useCapabilities'
import { useToast } from '../hooks/useToast'
import { createCategory, createProduct, deleteProduct, getCategories, getProducts, updateProduct, uploadImage } from '../services/productService'
import { adjustStock } from '../services/stockService'
import { CATEGORIAS_SUGERIDAS } from '../utils/constants'
import { norm } from '../utils/format'
import { aPayload, categoriasPresentes, validarProducto } from '../utils/products'
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
  const [categoriasApi, setCategoriasApi] = useState([]) // categorías registradas en el backend

  const listo = !cargandoCaps && (!full || !!usuario)

  const cargarProductos = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setProductos(await getProducts())
     getCategories().then(setCategoriasApi).catch(() => {}) // si falla, el formulario usa las de los productos
    } catch (err) { setError(err.message) } finally { setCargando(false) }
  }, [])

  useEffect(() => { if (listo) cargarProductos(); else setProductos([]) }, [listo, cargarProductos])

  // "Reintentar" y recargas manuales. Si el backend no respondía al abrir la página, primero se le vuelve a preguntar
  // qué soporta (por ejemplo, si tiene login): al volver a conocerlo, la carga de productos o el login se activan solos.
  const cargar = useCallback(async () => {
    if (errorCaps) { await comprobar(); return }
    await cargarProductos()
  }, [errorCaps, comprobar, cargarProductos])

  const categorias = useMemo(() => {
    const vistas = new Map()
    for (const c of [...categoriasApi, ...categoriasPresentes(productos)]) if (c && !vistas.has(norm(c))) vistas.set(norm(c), c)
    return [...vistas.values()].sort((a, b) => a.localeCompare(b, 'es'))
  }, [categoriasApi, productos])

  const recordarCategoria = useCallback((nombre) => {
    if (!nombre) return
    setCategoriasApi((cs) => (cs.some((c) => norm(c) === norm(nombre)) ? cs : [...cs, nombre]))
     }, [])

  // "Agregar nueva categoría": valida, evita duplicados y la guarda en el backend (POST /api/categorias).
  // Devuelve { ok: true, nombre } o { error, existente? } (existente = la que ya había con ese nombre).
  const crearCategoria = useCallback(async (texto) => {
    const nombre = String(texto ?? '').replace(/\s+/g, ' ').trim()
    if (!nombre) return { error: 'Escribe el nombre de la nueva categoría.' }
    if (nombre.length > 60) return { error: 'El nombre de la categoría admite máximo 60 caracteres.' }
    // también cuentan las sugeridas que el formulario ya ofrece (Quesos, Pan...): no se vuelven a crear con otra escritura
    const existente = [...categorias, ...CATEGORIAS_SUGERIDAS].find((c) => norm(c) === norm(nombre))
    if (existente) return { error: `La categoría «${existente}» ya existe. Elígela de la lista.`, existente }
    try {
      const creada = await createCategory(nombre)
      recordarCategoria(creada)
      return { ok: true, nombre: creada }
    } catch (err) {
      return { error: err.message }
    }
  }, [categorias, recordarCategoria]) 




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
      recordarCategoria(guardado.categoria)
      toast(producto ? 'Producto actualizado' : '¡Producto añadido con éxito!')
      return { ok: true }
    } catch (err) {
      return { error: err.message }
    }
  }, [productos, full, toast, recordarCategoria])

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
  () => ({ productos, categorias, cargando: cargando || cargandoCaps, error, cargar, guardar, eliminar, ajustar, crearCategoria }),
  [productos, categorias, cargando, cargandoCaps, error, cargar, guardar, eliminar, ajustar, crearCategoria],
)
  return <ProductsContext.Provider value={valor}>{children}</ProductsContext.Provider>
}
