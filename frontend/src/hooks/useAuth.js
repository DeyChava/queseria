import { useContext } from 'react'
import { AuthContext } from '../context/contexts'

// Uso: const { usuario, iniciarSesion, registrar, salir, puede, ... } = useAuth()
export const useAuth = () => useContext(AuthContext)
