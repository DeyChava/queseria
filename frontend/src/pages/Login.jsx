import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Field from '../components/Field'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import { useAuth } from '../hooks/useAuth'
import { useCapabilities } from '../hooks/useCapabilities'
import { ROLES } from '../utils/constants'

const VACIO = { nombre: '', email: '', rol: 'empleado', codigoRol: '', password: '', confirmar: '' }

// Pantalla de acceso de tu diseño: Iniciar sesión / Crear cuenta, con rol de acceso.
//  - Con la extensión del backend funciona de verdad (POST /api/auth/login y /api/auth/registro).
//  - Con el backend básico no hay usuarios: el diseño se conserva pero desactivado, con un aviso (no simula nada).
export default function Login() {
  const { full, hayUsuarios, cargando } = useCapabilities()
  const { usuario, iniciarSesion, registrar } = useAuth()
  const [modo, setModo] = useState('in')
  const [f, setF] = useState(VACIO)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [ayuda, setAyuda] = useState(false)
  const registro = modo === 'up'
  const primeraCuenta = registro && !hayUsuarios                 // la primera cuenta del sistema siempre es de Administrador
  const rolElegido = primeraCuenta ? 'admin' : f.rol
  const cambiar = (campo) => (e) => setF({ ...f, [campo]: e.target.value })

  if (usuario) return <Navigate to="/catalogo" replace />

  const enviar = async (e) => {
    e.preventDefault()
    if (registro && f.password !== f.confirmar) return setError('Las contraseñas no coinciden.')
    setEnviando(true); setError('')
    try {
      if (registro) await registrar({ nombre: f.nombre, email: f.email, password: f.password, rol: rolElegido, codigoRol: f.codigoRol })
      else await iniciarSesion({ email: f.email, password: f.password, rol: rolElegido })
    } catch (err) { setError(err.message) } finally { setEnviando(false) }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-fondo p-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-oro-fuerte/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-oro-pastel/5 blur-3xl" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-linea2 bg-card p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-oro/30 bg-campo text-oro"><Icon name="marca" size={32} /></div>
          <h1 className="font-title text-4xl tracking-wider text-oro-pastel">La Quesería</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-oro-pastel/60">Sabor · Calidad · Compromiso</p>
        </div>

        {cargando ? (
          <p className="py-8 text-center font-mono text-xs text-apagado" role="status"><span className="giro" />Conectando con el servidor…</p>
        ) : !full ? (
          <>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Field id="login-correo" big label="Correo Electrónico" type="email" placeholder="correo@ejemplo.com" disabled />
              <Field id="login-clave" big label="Contraseña" type="password" placeholder="Contraseña" disabled />
              <button type="submit" className="boton-degradado" disabled><Icon name="candado" />Iniciar Sesión</button>
            </form>
            <p className="nota mt-5"><strong>Inicio de sesión no disponible.</strong> El backend actual no tiene usuarios ni autenticación; se agregan con la carpeta <strong>backend-extension</strong>. Mientras tanto el sistema se abre sin sesión.</p>
            <p className="mt-4 text-center"><Link to="/catalogo" className="font-mono text-xs text-oro-claro">Ir al catálogo →</Link></p>
          </>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-2">
              <button type="button" className={`chip ${!registro ? 'activo' : ''}`} onClick={() => { setModo('in'); setError('') }}>Iniciar sesión</button>
              <button type="button" className={`chip ${registro ? 'activo' : ''}`} onClick={() => { setModo('up'); setError('') }}>Crear cuenta</button>
            </div>
            {!hayUsuarios && <p className="nota mb-4"><strong>Primer uso:</strong> la primera cuenta que se crea es la del <strong>Administrador</strong> (no necesita código).</p>}
            <form className="space-y-4" onSubmit={enviar}>
              {registro && <Field id="auth-nombre" big label="Nombre Completo" value={f.nombre} onChange={cambiar('nombre')} required maxLength={60} autoComplete="name" placeholder="Ej: María Rodríguez" />}
              <Field id="auth-email" big label="Correo Electrónico" type="email" value={f.email} onChange={cambiar('email')} required autoComplete="email" placeholder="correo@ejemplo.com" />
              <Field id="auth-rol" big label="Rol de Acceso">
                <select id="auth-rol" className="campo campo-grande" value={rolElegido} onChange={cambiar('rol')} disabled={primeraCuenta}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              </Field>
              {registro && f.rol !== 'empleado' && hayUsuarios && (
                <Field id="auth-codigo" big label="Código de Autorización" value={f.codigoRol} onChange={cambiar('codigoRol')} autoComplete="off" placeholder="Lo entrega la quesería" hint="Los roles Administrador y Jefe de inventario requieren este código." />
              )}
              <Field id="auth-password" big label="Contraseña" type="password" value={f.password} onChange={cambiar('password')} required minLength={8} autoComplete={registro ? 'new-password' : 'current-password'} placeholder="Mínimo 8 caracteres" />
              {registro && <Field id="auth-confirmar" big label="Confirmar Contraseña" type="password" value={f.confirmar} onChange={cambiar('confirmar')} required autoComplete="new-password" placeholder="Repite la contraseña" />}
              {!registro && <div className="-mt-2 text-right"><button type="button" className="font-mono text-xs text-oro-claro underline" onClick={() => setAyuda(true)}>¿Olvidaste tu contraseña?</button></div>}
              <p role="alert" className="error-texto">{error}</p>
              <button type="submit" className="boton-degradado" disabled={enviando}>{enviando ? 'Un momento…' : registro ? 'Crear Cuenta' : 'Iniciar Sesión'}</button>
            </form>
          </>
        )}
      </div>

      {ayuda && (
        <Modal title="Recuperar contraseña" onClose={() => setAyuda(false)}>
          <p className="text-sm leading-relaxed text-apagado">Pídele al <strong className="text-titulo">Administrador</strong> que restablezca tu contraseña desde <strong className="text-titulo">Usuarios y roles</strong>.
            Te entregará una contraseña temporal, y después la cambias desde <strong className="text-titulo">Mi perfil</strong>.</p>
          <div className="flex justify-end pt-4"><button type="button" className="boton-oro" onClick={() => setAyuda(false)}>Entendido</button></div>
        </Modal>
      )}
    </div>
  )
}
