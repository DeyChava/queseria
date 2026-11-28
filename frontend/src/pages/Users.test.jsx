import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Users from './Users'
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ usuario: { _id: 'admin1', nombre: 'Admin', rol: 'admin' } }),
}))
vi.mock('../hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))
vi.mock('../services/userService', () => ({
  listUsers: vi.fn().mockResolvedValue([
    { _id: 'admin1', nombre: 'Admin', email: 'admin@queseria.cr', rol: 'admin', createdAt: '2026-01-01T00:00:00Z' },
  ]),
  changeRole: vi.fn(),
  getAccessCodes: vi.fn().mockResolvedValue({
    CODIGO_ADMIN: 'ADM-123',
    CODIGO_JEFE: 'JEF-456',
    CODIGO_EMPLEADO: 'EMP-789',
  }),
  createUser: vi.fn().mockResolvedValue({
    _id: 'u2', nombre: 'Ana Rojas', email: 'ana@queseria.cr', rol: 'empleado', createdAt: '2026-01-02T00:00:00Z',
  }),
}))
describe('Users (Agregar usuario y códigos de acceso)', () => {
  it('muestra botón de códigos de acceso y permite abrir el modal Agregar usuario', async () => {
    const user = userEvent.setup()
    render(<Users />)
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Agregar usuario/i })).toBeInTheDocument()
    const btnCodigos = await screen.findByRole('button', { name: /Mostrar códigos de registro/i })
    await user.click(btnCodigos)
    expect(screen.getByTestId('codigos-acceso')).toHaveTextContent('CODIGO_JEFE=JEF-456')
    await user.click(screen.getByRole('button', { name: /Agregar usuario/i }))
    expect(screen.getByRole('heading', { name: 'Agregar usuario' })).toBeInTheDocument()
  })
})