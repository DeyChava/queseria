import { useContext } from 'react'
import { CapabilitiesContext } from '../context/contexts'

// Uso: const { cargando, full, hayUsuarios, error, comprobar } = useCapabilities()
export const useCapabilities = () => useContext(CapabilitiesContext)
