import { api } from './api'

// Cuentas y perfil (solo con la extensión del backend)

// ---- Mi perfil ----
export const updateMyProfile = async (datos) => (await api.patch('/usuarios/yo', datos)).data.usuario        // { nombre?, foto? }
export const changeMyPassword = async (datos) => (await api.post('/usuarios/yo/password', datos)).data       // { actual, nueva }
export const deleteMyAccount = async (password) => (await api.delete('/usuarios/yo', { data: { password } })).data

// ---- Administrador ----
export const listUsers = async () => (await api.get('/usuarios')).data
export const changeRole = async (id, rol) => (await api.patch(`/usuarios/${id}/rol`, { rol })).data.usuario
export const deleteUser = async (id) => (await api.delete(`/usuarios/${id}`)).data
export const resetPassword = async (id) => (await api.post(`/usuarios/${id}/restablecer-password`)).data     // -> { passwordTemporal }
export const createUser = async (datos) => (await api.post('/usuarios', datos)).data.usuario                   // { nombre, email, password, rol }
export const getAccessCodes = async () => (await api.get('/usuarios/codigos-acceso')).data                   // { CODIGO_ADMIN, CODIGO_JEFE, CODIGO_EMPLEADO }

