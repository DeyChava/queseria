import { useCallback, useMemo, useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useToast } from '../hooks/useToast'
import { redondear } from '../utils/format'
import { pasoDe } from '../utils/products'
import { TicketContext } from './contexts'

// Ticket del punto de venta: lo que se va a cobrar. Es solo estado de pantalla; la venta se guarda al confirmar.
// Cada línea: { _id, qty } con el _id del producto. Los productos por kilo suben de a 0.5.
export default function TicketProvider({ children }) {
  const { productos } = useProducts()
  const { toast } = useToast()
  const [ticket, setTicket] = useState([])

  const agregar = useCallback((producto) => {
    const linea = ticket.find((l) => l._id === producto._id)
    const qty = redondear((linea ? linea.qty : 0) + pasoDe(producto))
    if (qty > producto.stock) return toast(producto.stock <= 0 ? 'Producto agotado en stock' : 'No hay suficiente stock disponible', 'error')
    setTicket(linea ? ticket.map((l) => (l._id === producto._id ? { ...l, qty } : l)) : [...ticket, { _id: producto._id, qty }])
    toast(`Añadido: ${producto.nombre}`)
  }, [ticket, toast])

  const cambiar = useCallback((id, signo) => {
    const linea = ticket.find((l) => l._id === id)
    const producto = productos.find((p) => p._id === id)
    if (!linea || !producto) return
    const qty = redondear(linea.qty + signo * pasoDe(producto))
    if (qty > producto.stock) return toast('Límite de stock alcanzado', 'error')
    setTicket(qty <= 0 ? ticket.filter((l) => l._id !== id) : ticket.map((l) => (l._id === id ? { ...l, qty } : l)))
  }, [ticket, productos, toast])

  const vaciar = useCallback(() => setTicket([]), [])

  const valor = useMemo(() => ({ ticket, agregar, cambiar, vaciar }), [ticket, agregar, cambiar, vaciar])
  return <TicketContext.Provider value={valor}>{children}</TicketContext.Provider>
}
