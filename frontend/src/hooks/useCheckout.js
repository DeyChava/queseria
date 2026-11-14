import { useCallback } from 'react'
import { createSale } from '../services/salesService'
import { crc } from '../utils/format'
import { calcularTotales } from '../utils/sales'
import { useCapabilities } from './useCapabilities'
import { useProducts } from './useProducts'
import { useTicket } from './useTicket'
import { useToast } from './useToast'

// Confirma la venta del ticket actual.
//  - Con la extensión: POST /api/ventas (el servidor guarda la venta y descuenta el stock).
//  - Backend básico: solo descuenta el stock (PUT por producto); la venta no queda guardada.
export function useCheckout() {
  const { productos, cargar } = useProducts()
  const { ticket, vaciar } = useTicket()
  const { full } = useCapabilities()
  const { toast } = useToast()

  return useCallback(async (recibido) => {
    const t = calcularTotales(ticket, productos)
    if (!ticket.length) return { error: 'El ticket está vacío.' }
    if (recibido < t.total) return { error: 'El monto recibido no alcanza.' }
    try {
      const venta = await createSale({ lines: ticket, products: productos, received: recibido, full })
      await cargar()
      vaciar()
      toast(full ? `Venta registrada. Vuelto: ${crc(venta.vuelto)}` : `Stock actualizado. Vuelto: ${crc(recibido - t.total)}`)
      return { ok: true }
    } catch (err) {
      await cargar()
      return { error: 'No se pudo completar la venta: ' + err.message }
    }
  }, [ticket, productos, full, cargar, vaciar, toast])
}
