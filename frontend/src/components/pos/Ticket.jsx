import { useState } from 'react'
import { useCapabilities } from '../../hooks/useCapabilities'
import { useCheckout } from '../../hooks/useCheckout'
import { useProducts } from '../../hooks/useProducts'
import { useTicket } from '../../hooks/useTicket'
import { cantidad, crc } from '../../utils/format'
import { calcularTotales } from '../../utils/sales'
import Field from '../Field'
import Icon from '../Icon'

// Ticket de compra de tu diseño: líneas, subtotal, I.V.A. 13 %, total, monto recibido y vuelto.
export default function Ticket() {
  const { productos } = useProducts()
  const { ticket, cambiar } = useTicket()
  const { full } = useCapabilities()
  const cobrar = useCheckout()
  const [recibido, setRecibido] = useState('')
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(false)

  const t = calcularTotales(ticket, productos)
  const dinero = parseFloat(recibido) || 0
  const diferencia = dinero - t.total
  const falta = ticket.length > 0 && diferencia < 0

  const confirmar = async () => {
    setProcesando(true)
    const r = await cobrar(dinero)
    setProcesando(false)
    if (r.error) return setError(r.error)
    setRecibido(''); setError('')
  }

  return (
    <div className="flex flex-col justify-between self-start rounded-2xl border border-linea bg-card p-5">
      <div>
        <h2 className="mb-4 font-title text-lg text-oro-claro">Ticket de Compra</h2>
        <div className="max-h-64 overflow-y-auto">
          {ticket.length === 0 && <p className="py-8 text-center font-mono text-xs text-tenue">Aún no hay productos en el ticket</p>}
          {ticket.map((linea) => {
            const p = productos.find((x) => x._id === linea._id)
            if (!p) return null
            return (
              <div key={linea._id} className="flex items-center justify-between gap-2 border-t border-linea py-2.5 first:border-t-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-titulo">{p.nombre}</p>
                  <span className="font-mono text-[10px] text-oro-claro">{crc(p.precioVenta)} c/u</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <button type="button" className="boton-mini" onClick={() => cambiar(p._id, -1)} aria-label={`Quitar de ${p.nombre}`}><Icon name="menos" size={12} /></button>
                  <span className="text-xs font-bold">{cantidad(linea.qty)}</span>
                  <button type="button" className="boton-mini" onClick={() => cambiar(p._id, 1)} aria-label={`Agregar de ${p.nombre}`}><Icon name="mas" size={12} /></button>
                </div>
                <span className="w-20 text-right font-mono text-xs font-bold">{crc(p.precioVenta * linea.qty)}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-linea pt-4">
        <div className="flex justify-between font-mono text-xs text-apagado"><span>Subtotal</span><span className="text-titulo">{crc(t.subtotal)}</span></div>
        <div className="flex justify-between font-mono text-xs text-apagado"><span>I.V.A. (13%)</span><span className="text-titulo">{crc(t.iva)}</span></div>
        <div className="flex justify-between border-t border-linea pt-2 font-mono text-base font-bold text-oro-claro"><span>TOTAL</span><span className="text-xl">{crc(t.total)}</span></div>
        <Field id="monto-recibido" label="Monto Recibido" type="number" min="0" step="1" inputMode="numeric" value={recibido} onChange={(e) => setRecibido(e.target.value)} placeholder="Ej: 10000" />
        <div className={`flex justify-between rounded-lg border p-2.5 font-mono text-xs font-semibold ${falta ? 'border-oro/30 bg-oro/10 text-oro' : 'border-exito/30 bg-exito/10 text-exito'}`}>
          <span>{falta ? 'Falta por pagar' : 'Vuelto'}</span><span>{crc(falta ? -diferencia : Math.max(diferencia, 0))}</span>
        </div>
        <p role="alert" className="error-texto">{error}</p>
        <button type="button" className="boton-degradado" disabled={!ticket.length || diferencia < 0 || procesando} onClick={confirmar}>
          {procesando ? 'Registrando…' : full ? 'CONFIRMAR Y REGISTRAR VENTA' : 'CONFIRMAR VENTA Y DESCONTAR STOCK'}
        </button>
        {!full && <p className="font-mono text-[10px] text-tenue">Descuenta el stock en la base de datos. El historial de ventas necesita la extensión del backend.</p>}
      </div>
    </div>
  )
}
