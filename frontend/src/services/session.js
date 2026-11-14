// Token de sesión (lo entrega el backend al iniciar sesión). Es solo el comprobante; el servidor valida todo.
const CLAVE = 'q_token'

export const getToken = () => { try { return localStorage.getItem(CLAVE) || '' } catch { return '' } }
export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(CLAVE, token)
    else localStorage.removeItem(CLAVE)
  } catch { /* nada */ }
}
