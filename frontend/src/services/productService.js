import { api } from './api'

// Productos e imágenes del backend (backend/routes/productos.js e imagenes.js).
// Los campos conservan exactamente los nombres del modelo Producto.

// GET /api/categorias -> ["Lácteos", "Quesos", ...]  ·  POST /api/categorias { nombre } -> { nombre } (solo administrador)
export const getCategories = async () => (await api.get('/categorias')).data
export const createCategory = async (nombre) => (await api.post('/categorias', { nombre })).data.nombre

export async function getProducts() {
  const { data } = await api.get('/productos')
  return data
}

// POST /api/productos -> obligatorios: nombre, precioCompra y precioVenta
export async function createProduct(datos) {
  const { data } = await api.post('/productos', datos)
  return data
}

// PUT /api/productos/:id -> cambia los datos (puede ser solo una parte)
export async function updateProduct(id, datos) {
  const { data } = await api.put(`/productos/${id}`, datos)
  return data
}

// DELETE /api/productos/:id -> lo borra (y el backend borra su foto de Cloudinary)
export async function deleteProduct(id) {
  const { data } = await api.delete(`/productos/${id}`)
  return data
}

// POST /api/imagenes (multipart/form-data). El campo del archivo DEBE llamarse "imagen" (JPG, PNG o WebP, máx. 5 MB).
// Devuelve el nombre corto de la foto en Cloudinary (public_id), que se guarda en el campo "imagen".
export async function uploadImage(archivo) {
  const formulario = new FormData()
  formulario.append('imagen', archivo)
  const { data } = await api.post('/imagenes', formulario)
  return data.imagen
}
