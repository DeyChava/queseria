import { useContext } from 'react'
import { ToastContext } from '../context/contexts'

// Uso: const { aviso, toast } = useToast()
export const useToast = () => useContext(ToastContext)
