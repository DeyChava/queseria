import { describe, expect, it } from 'vitest'
import { calcularTotales } from './sales'
import { aPayload, pasoDe, validarProducto } from './products'
describe('Cálculos de IVA y utilidades de producto', () => {
  it('cobra IVA (13%) solo sobre los productos con aplicaIva !== false', () => {
    const productos = [
      { _id: '1', precioVenta: 1000, aplicaIva: true },
      { _id: '2', precioVenta: 2000, aplicaIva: false },
    ]
    const ticket = [
      { _id: '1', qty: 1 },
      { _id: '2', qty: 1 },
    ]
    const t = calcularTotales(ticket, productos)
    expect(t.subtotal).toBe(3000)
    expect(t.iva).toBe(130)
    expect(t.total).toBe(3130)
  })
  it('usa pasoDe según la unidad (kg/L: 0.5, g/ml: 50, resto: 1)', () => {
    expect(pasoDe({ unidad: 'kg' })).toBe(0.5)
    expect(pasoDe({ unidad: 'L' })).toBe(0.5)
    expect(pasoDe({ unidad: 'g' })).toBe(50)
    expect(pasoDe({ unidad: 'ml' })).toBe(50)
    expect(pasoDe({ unidad: 'trenzas' })).toBe(1)
    expect(pasoDe({ unidad: 'unidades' })).toBe(1)
  })
  it('rechaza stock decimal en unidades enteras', () => {
    const err = validarProducto({
      nombre: 'Queso Trenza', codigo: '', precioCompra: '1000', precioVenta: '1500',
      unidad: 'trenzas', stock: '2.5', stockMinimo: '1', diasVida: '',
    }, [])
    expect(err).toMatch(/entero/i)
  })
  it('incluye aplicaIva en el payload enviado al backend', () => {
    const payload = aPayload({
      nombre: 'Natilla', descripcion: '', codigo: 'na-1', categoria: '', proveedor: '',
      unidad: 'unidades', precioCompra: '800', precioVenta: '1200', aplicaIva: false,
      stock: '10', stockMinimo: '2', fechaCompra: '', diasVida: '',
    })
    expect(payload.aplicaIva).toBe(false)
    expect(payload.codigo).toBe('NA-1')
    expect(payload.categoria).toBe('Sin categoria')
  })
})