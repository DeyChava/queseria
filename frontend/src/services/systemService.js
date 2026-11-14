import { api } from './api'

// GET /api/ping -> { mensaje } cuando el backend está vivo
export async function ping() {
  const { data } = await api.get('/ping')
  return data
}

// GET /api/auth/estado -> existe solo si el backend tiene la EXTENSIÓN (login con roles, ventas, reportes).
//   respuesta 200: { extension: true, hayUsuarios }  ·  404: el backend no la tiene (modo básico)
export async function getCapabilities() {
  try {
    const { data } = await api.get('/auth/estado')
    return { full: !!data.extension, hayUsuarios: !!data.hayUsuarios }
  } catch (error) {
    if (error.status === 404) return { full: false, hayUsuarios: false }
    throw error
  }
}
