import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Toast from './Toast'

// Estructura de tu diseño: menú lateral a la izquierda y el módulo elegido a la derecha.
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navbar />
      <main className="min-w-0 flex-1 bg-fondo p-4 sm:p-8"><Outlet /></main>
      <Toast />
    </div>
  )
}
