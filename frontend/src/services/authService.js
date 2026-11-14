import { api } from './api'

// Inicio de sesión y registro (solo con la extensión del backend)

// POST /api/auth/login { email, password, rol } -> { token, usuario }
export async function login(datos) {
  const { data } = await api.post('/auth/login', datos)
  return data
}

// POST /api/auth/registro { nombre, email, password, rol, codigoRol } -> { token, usuario }
export async function register(datos) {
  const { data } = await api.post('/auth/registro', datos)
  return data
}

// GET /api/auth/yo -> { usuario } (con el token)
export async function getMe() {
  const { data } = await api.get('/auth/yo')
  return data.usuario
}
