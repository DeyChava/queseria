import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ProductModal from './ProductModal'
const guardarMock = vi.fn().mockResolvedValue({ ok: true })
const crearCategoriaMock = vi.fn().mockResolvedValue({ ok: true, nombre: 'Postres' })
vi.mock('../../hooks/useProducts', () => ({
  useProducts: () => ({
    categorias: ['Quesos', 'Lácteos'],
    guardar: guardarMock,
    crearCategoria: crearCategoriaMock,
  }),
}))
vi.mock('../../hooks/useCapabilities', () => ({
  useCapabilities: () => ({ full: true }),
}))
describe('ProductModal (IVA, categorías y unidades)', () => {
  it('permite activar/desactivar IVA y abrir "Agregar nueva categoría"', async () => {
    const user = userEvent.setup()
    render(<ProductModal product={null} onClose={vi.fn()} />)
    const switchIva = screen.getByRole('switch', { name: /Aplicar I\.V\.A\./i })
    expect(switchIva).toBeChecked()
    expect(screen.getByTestId('estado-iva')).toHaveTextContent('IVA ACTIVO')
    await user.click(switchIva)
    expect(switchIva).not.toBeChecked()
    expect(screen.getByTestId('estado-iva')).toHaveTextContent('IVA DESACTIVADO')
    const selectCat = screen.getByLabelText('Categoría')
    await user.selectOptions(selectCat, '__nueva__')
    expect(screen.getByTestId('nueva-categoria')).toBeInTheDocument()
    const selectUnidad = screen.getByLabelText('Se vende por')
    expect(screen.getByRole('option', { name: 'Gramos (g)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Mililitros (ml)' })).toBeInTheDocument()
    expect(selectUnidad).toHaveValue('unidades')
  })
})