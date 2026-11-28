import { DIAS_AVISO_VENCIMIENTO, UNIDADES_ENTERAS } from './constants'
import { norm, redondear } from './format'

// ---- Adaptadores entre el modelo Producto del backend y la pantalla ----
// Los campos conservan los nombres exactos del backend (codigo, precioVenta, stockMinimo...).

// El backend guarda solo el "nombre corto" de la foto en Cloudinary (public_id).
// Con el nombre de tu nube (VITE_CLOUDINARY_CLOUD_NAME) se arma la dirección de la imagen.
export const NUBE_CLOUDINARY = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''

export function urlImagen(imagen, ancho = 640) {
  if (!imagen) return ''
  if (/^(https?:|blob:|data:)/.test(imagen)) return imagen
  return NUBE_CLOUDINARY ? `https://res.cloudinary.com/${NUBE_CLOUDINARY}/image/upload/f_auto,q_auto,w_${ancho}/${imagen}` : ''
}

export const FORMULARIO_VACIO = {
  nombre: '', descripcion: '', codigo: '', categoria: '', proveedor: '', unidad: 'unidades',
  precioCompra: '', precioVenta: '', aplicaIva: true, stock: '', stockMinimo: '3', fechaCompra: '', diasVida: '',
}

// Producto del backend -> valores del formulario (para editar)
export const aFormulario = (p) => ({
  nombre: p.nombre || '', descripcion: p.descripcion || '', codigo: p.codigo || '',
  categoria: p.categoria || '', proveedor: p.proveedor || '', unidad: p.unidad || 'unidades',
  precioCompra: String(p.precioCompra ?? ''), precioVenta: String(p.precioVenta ?? ''),
  aplicaIva: p.aplicaIva !== false, 
  stock: String(p.stock ?? ''), stockMinimo: String(p.stockMinimo ?? 3),
  fechaCompra: p.fechaCompra ? new Date(p.fechaCompra).toISOString().slice(0, 10) : '',
  diasVida: p.diasVida ? String(p.diasVida) : '',
})

// Valida el formulario. Devuelve el mensaje de error, o '' si todo está bien.
// Obligatorios del backend: nombre, precioCompra y precioVenta.
// "existentes" = productos ya cargados, para que el código (codigo) no se repita
// (el backend no lo exige único; ver PENDIENTES_BACKEND.md). "idActual" = producto que se está editando.
export function validarProducto(f, existentes, idActual = null) {
  const otros = existentes.filter((p) => p._id !== idActual)
  const codigo = f.codigo.trim()
  if (!f.nombre.trim()) return 'Escribe el nombre del producto.'
  if (f.precioCompra === '' || !(Number(f.precioCompra) >= 0)) return 'El precio de compra es obligatorio (0 o más).'
  if (f.precioVenta === '' || !(Number(f.precioVenta) >= 0)) return 'El precio de venta es obligatorio (0 o más).'
  if (f.stock !== '' && !(Number(f.stock) >= 0)) return 'El stock debe ser 0 o más.'
  if (f.stockMinimo !== '' && !(Number(f.stockMinimo) >= 0)) return 'El stock mínimo debe ser 0 o más.'
  if (f.diasVida !== '' && !(Number(f.diasVida) >= 0)) return 'Los días de vida deben ser 0 o más.'
  if (f.stock !== '' && UNIDADES_ENTERAS.includes(f.unidad) && !Number.isInteger(Number(f.stock))) {
    return `El stock de productos por ${f.unidad} debe ser un número entero.`
  }
  if (codigo && otros.some((p) => (p.codigo || '').toLowerCase() === codigo.toLowerCase())) return `Ya existe un producto con el código ${codigo.toUpperCase()}. Elige otro.`
  if (otros.some((p) => norm(p.nombre) === norm(f.nombre))) return 'Ya existe un producto con ese nombre.'
  return ''
}

// Formulario -> cuerpo que espera el backend (POST y PUT /api/productos).
// "imagenNueva" = nombre corto devuelto por POST /api/imagenes; si no hay foto nueva no se envía el campo.
export function aPayload(f, imagenNueva = '', incluirStock = true) {
  const datos = {
    nombre: f.nombre.trim(),
    descripcion: f.descripcion.trim(),
    codigo: f.codigo.trim().toUpperCase(),
    categoria: f.categoria.trim() || 'Sin categoria',
    proveedor: f.proveedor.trim(),
    unidad: f.unidad,
    precioCompra: Number(f.precioCompra),
    precioVenta: Number(f.precioVenta),
    aplicaIva: !!f.aplicaIva,
    stock: f.stock === '' ? 0 : redondear(Number(f.stock)),
    stockMinimo: f.stockMinimo === '' ? 3 : Number(f.stockMinimo),
    fechaCompra: f.fechaCompra || null,
    diasVida: f.diasVida === '' ? 0 : Number(f.diasVida),
  }
  if (!incluirStock) delete datos.stock // con la extensión el stock solo cambia desde Inventario (queda en el historial)
  if (imagenNueva) datos.imagen = imagenNueva
  return datos
}

// Margen de ganancia en %, igual que el campo calculado "margen" del backend
export const margenPct = (compra, venta) => (venta > 0 ? Math.round(((venta - compra) / venta) * 100) : 0)

// Vencimiento = fechaCompra + diasVida. Devuelve null si el producto no tiene esos datos.
// El backend guarda la fecha a medianoche UTC; se toman sus partes para no correr el día por la zona horaria.
export function vencimiento(p) {
  if (!p.fechaCompra || !p.diasVida) return null
  const c = new Date(p.fechaCompra)
  const fecha = new Date(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate() + p.diasVida)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const dias = Math.round((fecha - hoy) / 86400000)
  return { fecha, dias, estado: dias < 0 ? 'vencido' : dias <= DIAS_AVISO_VENCIMIENTO ? 'pronto' : 'ok' }
}

// Paso de los botones +/- en el ticket: kg y litros suben de a 0.5; gramos y mililitros de a 50; el resto de a 1
export const pasoDe = (p) => (p.unidad === 'kg' || p.unidad === 'L' ? 0.5 : p.unidad === 'g' || p.unidad === 'ml' ? 50 : 1)
// ¿Este producto lleva IVA? Los antiguos (sin el campo aplicaIva) sí
export const llevaIva = (p) => p?.aplicaIva !== false

// Categorías que existen en los datos, sin repetir y en orden alfabético
export const categoriasPresentes = (productos) =>
  [...new Set(productos.map((p) => p.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
