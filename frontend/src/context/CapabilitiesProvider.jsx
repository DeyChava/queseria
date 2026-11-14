import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCapabilities } from '../services/systemService'
import { CapabilitiesContext } from './contexts'

// Averigua qué puede hacer el backend (GET /api/auth/estado):
//   full = true  -> tiene la EXTENSIÓN: inicio de sesión con roles, ventas guardadas y reportes mensuales
//   full = false -> backend básico (solo productos e imágenes): el sistema se abre sin sesión
export default function CapabilitiesProvider({ children }) {
  const [estado, setEstado] = useState({ cargando: true, full: false, hayUsuarios: false, error: '' })

  const comprobar = useCallback(async () => {
    setEstado((e) => ({ ...e, cargando: true, error: '' }))
    try {
      const c = await getCapabilities()
      setEstado({ cargando: false, ...c, error: '' })
      return c
    } catch (err) {
      setEstado({ cargando: false, full: false, hayUsuarios: false, error: err.message })
      return { full: false, error: err.message }
    }
  }, [])

  useEffect(() => { comprobar() }, [comprobar])

  const valor = useMemo(() => ({ ...estado, comprobar, marcarConUsuarios: () => setEstado((e) => ({ ...e, hayUsuarios: true })) }), [estado, comprobar])
  return <CapabilitiesContext.Provider value={valor}>{children}</CapabilitiesContext.Provider>
}
