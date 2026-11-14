import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCapabilities } from '../hooks/useCapabilities'
import { useToast } from '../hooks/useToast'
import * as auth from '../services/authService'
import { setToken, getToken } from '../services/session'
import * as users from '../services/userService'
import { PERMISOS } from '../utils/constants'
import { AuthContext } from './contexts'

// Sesión de usuario. Solo existe cuando el backend tiene la extensión; si no, el sistema se abre sin sesión.
// El token lo entrega el servidor; los permisos de verdad los valida el servidor en cada petición.
export default function AuthProvider({ children }) {
  const { cargando: cargandoCaps, full, marcarConUsuarios } = useCapabilities()
  const { toast } = useToast()
  const [usuario, setUsuario] = useState(null)
  const [verificando, setVerificando] = useState(true)

  // Al abrir la app: si hay token guardado, comprobarlo con el servidor
  useEffect(() => {
    if (cargandoCaps) return
    if (!full || !getToken()) { setVerificando(false); return }
    auth.getMe().then(setUsuario).catch(() => setToken('')).finally(() => setVerificando(false))
  }, [cargandoCaps, full])

  const salir = useCallback(() => { setToken(''); setUsuario(null) }, [])

  useEffect(() => {
    const vencida = () => { salir(); toast('Tu sesión terminó. Inicia sesión de nuevo.', 'error') }
    window.addEventListener('q:sesion-vencida', vencida)
    return () => window.removeEventListener('q:sesion-vencida', vencida)
  }, [salir, toast])

  const entrar = useCallback(async (resultado) => {
    setToken(resultado.token); setUsuario(resultado.usuario); marcarConUsuarios()
    toast(`Sesión iniciada: ${resultado.usuario.nombre.split(' ')[0]}`)
  }, [toast, marcarConUsuarios])

  const iniciarSesion = useCallback(async (datos) => entrar(await auth.login(datos)), [entrar])
  const registrar = useCallback(async (datos) => entrar(await auth.register(datos)), [entrar])

  // Perfil (PATCH /api/usuarios/yo) y contraseña
  const actualizarPerfil = useCallback(async (datos) => { setUsuario(await users.updateMyProfile(datos)) }, [])
  const cambiarPassword = useCallback((datos) => users.changeMyPassword(datos), [])
  const eliminarCuenta = useCallback(async (password) => { await users.deleteMyAccount(password); salir() }, [salir])

  const puede = useCallback((modulo) => !full || (!!usuario && PERMISOS[usuario.rol].includes(modulo)), [full, usuario])
  const esAdmin = !full || usuario?.rol === 'admin' // crear, editar y eliminar productos (sin la extensión no hay roles)

  const valor = useMemo(
    () => ({ usuario, verificando, iniciarSesion, registrar, salir, actualizarPerfil, cambiarPassword, eliminarCuenta, puede, esAdmin }),
    [usuario, verificando, iniciarSesion, registrar, salir, actualizarPerfil, cambiarPassword, eliminarCuenta, puede, esAdmin],
  )
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
