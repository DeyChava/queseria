import { IVA } from './constants'

// Los precios de venta (precioVenta) van sin IVA. El IVA (13 %) se cobra SOLO sobre los productos que lo llevan
// (aplicaIva); los que no, se suman al subtotal pero no pagan impuesto. El servidor vuelve a calcularlo igual:
// no se confía en los totales del navegador.
export function calcularTotales(ticket, productos) {
  let suma = 0
  let gravada = 0 // lo que se vende en productos con IVA
  for (const linea of ticket) {
    const p = productos.find((x) => x._id === linea._id)
    if (!p) continue
    const importe = p.precioVenta * linea.qty
    suma += importe
   if (p.aplicaIva !== false) gravada += importe
  }
  const subtotal = Math.round(suma)
  const iva = Math.round(Math.round(gravada) * IVA)
  return { subtotal, iva, total: subtotal + iva }
}
