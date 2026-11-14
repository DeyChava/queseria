import axios from 'axios'
import { getToken } from './session'

// Dirección del backend. Se configura en frontend/.env (VITE_API_URL); por defecto, el servidor local.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({ baseURL: API_URL, timeout: 15000 })

// Si hay sesión, cada petición lleva el token: Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Convierte cualquier fallo en un Error con mensaje legible y el código HTTP (error.status).
// El backend responde { error: "mensaje" }. Un 401 con token guardado = sesión vencida.
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const status = error.response?.status
    const mensaje = error.response?.data?.error
      || (error.request ? 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.' : error.message)
    if (status === 401 && getToken()) window.dispatchEvent(new Event('q:sesion-vencida'))
    const falla = new Error(mensaje)
    falla.status = status
    return Promise.reject(falla)
  },
)
