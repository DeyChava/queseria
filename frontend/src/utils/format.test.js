
import { describe, it, expect } from 'vitest'
import { cantidad } from './format.js'

describe('formato de cantidades', () => {
  it('muestra cantidades con hasta tres decimales', () => {
    expect(cantidad(2.5)).toBe('2,5')
    expect(cantidad(2.125)).toBe('2,125')
  })

  it('redondea a tres decimales', () => {
    expect(cantidad(2.1238)).toBe('2,124')
  })

  it('convierte valores vacíos en cero', () => {
    expect(cantidad(null)).toBe('0')
    expect(cantidad(undefined)).toBe('0')
  })
})
