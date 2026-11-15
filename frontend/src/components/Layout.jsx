import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCapabilities } from '../hooks/useCapabilities'
import Icon from './Icon'
import Logo from './Logo'
import Navbar from './Navbar'
import Toast from './Toast'

// Estructura de tu diseño: menú lateral a la izquierda y el módulo elegido a la derecha.
// Arriba del contenido: logotipo centrado y, con sesión iniciada, el botón de cerrar sesión siempre visible.
export default function Layout() {
  const { full } = useCapabilities()
  const { usuario, salir } = useAuth()
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navbar />
      <main className="min-w-0 flex-1 bg-fondo p-4 sm:p-8">
        <header className="no-imprimir relative mb-6 flex items-center justify-center">
          <Logo size={104} />
          {full && usuario && (
            <button type="button" onClick={salir} aria-label="Cerrar sesión"
              className="absolute right-0 top-0 flex items-center gap-2 rounded-lg border border-linea bg-card px-3 py-2 font-mono text-xs font-semibold text-apagado transition hover:border-peligro/40 hover:bg-peligro/10 hover:text-peligro">
              <Icon name="salir" /><span className="hidden sm:inline">CERRAR SESIÓN</span>
            </button>
          )}
        </header>
        <Outlet />
      </main>
      <Toast />
    </div>
  )
}
