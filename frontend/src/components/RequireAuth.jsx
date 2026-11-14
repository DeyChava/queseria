import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCapabilities } from '../hooks/useCapabilities'

// Con la extensión del backend, todo lo que está dentro exige sesión iniciada (si no, manda al login).
// Con el backend básico no hay sesión y se pasa directo.
export function RequireAuth() {
  const { cargando, full } = useCapabilities()
  const { usuario, verificando } = useAuth()
  if (cargando || verificando) return <div className="grid min-h-screen place-items-center bg-fondo font-mono text-xs text-apagado" role="status"><span><span className="giro" />Cargando…</span></div>
  if (full && !usuario) return <Navigate to="/login" replace />
  return <Outlet />
}

// Protege un módulo según el rol: si el rol no tiene permiso, vuelve al catálogo.
// "usuarios" y "perfil" solo existen con la extensión del backend.
export function RequireModule({ modulo, children }) {
  const { full } = useCapabilities()
  const { puede } = useAuth()
  const necesitaExtension = modulo === 'usuarios' || modulo === 'perfil'
  return puede(modulo) && (full || !necesitaExtension) ? children : <Navigate to="/catalogo" replace />
}
