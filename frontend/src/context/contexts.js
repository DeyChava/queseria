import { createContext } from 'react'

// Los contextos de la aplicación. Cada uno tiene su proveedor (carpeta context/) y su hook de uso (carpeta hooks/).
export const ToastContext = createContext(null)
export const CapabilitiesContext = createContext(null)
export const AuthContext = createContext(null)
export const ProductsContext = createContext(null)
export const TicketContext = createContext(null)
