import { useContext } from 'react'
import { TicketContext } from '../context/contexts'

// Uso: const { ticket, agregar, cambiar, vaciar } = useTicket()
export const useTicket = () => useContext(TicketContext)
