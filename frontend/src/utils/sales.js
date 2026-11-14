import { IVA } from './constants'

// Subtotal, IVA y total del ticket, calculados con números reales (para mostrar mientras se arma el ticket).
// Los precios de venta (precioVenta) van sin IVA; el IVA (13 %) se suma aparte, como en tu diseño.
// Con la extensión del backend, el servidor vuelve a calcularlos: no se confía en los totales del navegador.
export function calcularTotales(ticket, productos) {
  const subtotal = Math.round(ticket.reduce((suma, linea) => {
    const p = productos.find((x) => x._id === linea._id)
    return suma + (p ? p.precioVenta * linea.qty : 0)
  }, 0))
  const iva = Math.round(subtotal * IVA)
  return { subtotal, iva, total: subtotal + iva }
}
