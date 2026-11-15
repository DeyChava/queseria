import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCapabilities } from '../hooks/useCapabilities'
import { useServerStatus } from '../hooks/useServerStatus'
import { useTheme } from '../hooks/useTheme'
import { useTicket } from '../hooks/useTicket'
import { API_URL } from '../services/api'
import { ROLES } from '../utils/constants'
import Avatar from './Avatar'
import Icon from './Icon'
import Logo from './Logo'

const MENU = [
  { ruta: '/catalogo', modulo: 'catalogo', texto: 'CATÁLOGO & BUSCADOR', icono: 'catalogo' },
  { ruta: '/inventario', modulo: 'inventario', texto: 'INVENTARIO Y STOCK', icono: 'inventario' },
  { ruta: '/ventas', modulo: 'ventas', texto: 'PUNTO DE VENTA (CAJA)', icono: 'ventas' },
  { ruta: '/reportes', modulo: 'reportes', texto: 'REPORTES MENSUALES', icono: 'reportes' },
  { ruta: '/usuarios', modulo: 'usuarios', texto: 'USUARIOS Y ROLES', icono: 'users', soloConExtension: true },
]
const TEXTO = { comprobando: 'Comprobando servidor…', conectado: 'Servidor conectado', 'sin-conexion': 'Sin conexión con el servidor' }
const PUNTO = { comprobando: 'bg-tenue', conectado: 'bg-exito', 'sin-conexion': 'bg-peligro' }
const servidor = (() => { try { return new URL(API_URL).host } catch { return API_URL } })()

// Menú lateral de tu diseño: marca, usuario (o estado del servidor), módulos según el rol y modo claro/oscuro.
// En celular se contrae y se abre con el botón de las tres rayas.
export default function Navbar() {
  const [abierto, setAbierto] = useState(false)
  const estado = useServerStatus()
  const { full } = useCapabilities()
  const { usuario, puede, salir } = useAuth()
  const { tema, alternar } = useTheme()
  const { ticket } = useTicket()
  const items = MENU.filter((m) => (full || !m.soloConExtension) && puede(m.modulo))

  return (
    <aside className="no-imprimir flex w-full shrink-0 flex-col justify-between border-b border-linea bg-lateral md:sticky md:top-0 md:h-screen md:w-64 md:overflow-y-auto md:border-b-0 md:border-r">
      <div>
        <div className="flex items-center gap-3 border-b border-linea p-5">
          <Logo size={44} className="!mx-0 shrink-0" />
          <div>
            <h2 className="font-title text-lg leading-none text-oro-pastel">LA QUESERÍA</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-apagado">Sistema de Control</span>
          </div>
          <button type="button" className="boton-suave ml-auto md:hidden" onClick={() => setAbierto(!abierto)} aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={abierto}>
            <Icon name={abierto ? 'cerrar' : 'menu'} size={18} />
          </button>
        </div>

        <div className={`${abierto ? 'block' : 'hidden'} md:block`}>
          {full && usuario ? (
            <NavLink to="/perfil" onClick={() => setAbierto(false)} aria-label="Abrir mi perfil" className="flex items-center gap-3 border-b border-linea bg-panel px-5 py-4 hover:bg-fila">
              <Avatar user={usuario} size={40} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-titulo">{usuario.nombre}</span>
                <span className="block truncate text-[11px] text-apagado">{usuario.email}</span>
                <span className="mt-1 inline-block rounded bg-oro/15 px-1.5 py-0.5 font-mono text-[10px] text-oro-claro">{ROLES[usuario.rol]}</span>
              </span>
            </NavLink>
          ) : (
            <div className="border-b border-linea bg-panel px-5 py-4">
              <p className="text-xs font-medium text-titulo"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${PUNTO[estado]}`} />{TEXTO[estado]}</p>
              <span className="font-mono text-[10px] text-apagado">{servidor}</span>
            </div>
          )}
          <nav className="grid gap-1 p-3" aria-label="Módulos">
            {items.map((m) => (
              <NavLink key={m.ruta} to={m.ruta} onClick={() => setAbierto(false)}
                className={({ isActive }) => `flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left font-mono text-xs font-semibold tracking-wider transition ${isActive ? 'border-oro/30 bg-oro/10 text-oro-claro' : 'border-transparent text-apagado hover:bg-fila hover:text-titulo'}`}>
                <Icon name={m.icono} />
                {m.texto}
                {m.ruta === '/ventas' && ticket.length > 0 && <span className="ml-auto rounded-full bg-oro px-2 py-0.5 text-[10px] font-bold text-sobre-oro">{ticket.length}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className={`${abierto ? 'block' : 'hidden'} space-y-1 border-t border-linea p-4 md:block`}>
        <button type="button" onClick={alternar} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 font-mono text-xs text-apagado transition hover:bg-oro/10 hover:text-oro-claro">
          <Icon name={tema === 'claro' ? 'luna' : 'sol'} />{tema === 'claro' ? 'MODO OSCURO' : 'MODO CLARO'}
        </button>
        {full && usuario && (
          <button type="button" onClick={salir} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 font-mono text-xs text-apagado transition hover:bg-peligro/10 hover:text-peligro">
            <Icon name="salir" />CERRAR SESIÓN
          </button>
        )}
      </div>
    </aside>
  )
}