import { useState } from 'react'
import { createUser } from '../../services/userService'
import { ROLES } from '../../utils/constants'
import Field from '../Field'
import Modal from '../Modal'

const VACIO = { nombre: '', email: '', password: '', rol: 'empleado' }

// El administrador registra una cuenta nueva (POST /api/usuarios). La contraseña se guarda cifrada en el servidor.
// Que solo el administrador pueda hacerlo lo comprueba el backend; aquí solo se oculta el botón a los demás roles.
export default function CreateUserModal({ onClose, onCreated }) {
  const [f, setF] = useState(VACIO)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const cambiar = (campo) => (e) => setF({ ...f, [campo]: e.target.value })

  const enviar = async (e) => {
    e.preventDefault()
    if (!f.nombre.trim()) return setError('Escribe el nombre de la persona.')
    if (!f.email.trim()) return setError('Escribe el correo electrónico.')
    if (f.password.length < 10) return setError('La contraseña debe tener al menos 10 caracteres.')
    setEnviando(true); setError('')
    try {
      const usuario = await createUser({ nombre: f.nombre.trim(), email: f.email.trim(), password: f.password, rol: f.rol })
      onCreated(usuario)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal title="Agregar usuario" onClose={onClose}>
      <form onSubmit={enviar} className="space-y-3">
        <Field id="u-nombre" label="Nombre completo" value={f.nombre} onChange={cambiar('nombre')} required maxLength={100} autoComplete="off" placeholder="Ej: Ana Rojas" />
        <Field id="u-email" label="Correo electrónico" type="email" value={f.email} onChange={cambiar('email')} required autoComplete="off" placeholder="persona@correo.com" />
        <Field id="u-password" label="Contraseña" type="password" value={f.password} onChange={cambiar('password')} required minLength={10} autoComplete="new-password" hint="Mínimo 10 caracteres. Entrégasela en persona." />
        <Field id="u-rol" label="Rol">
          <select id="u-rol" className="campo" value={f.rol} onChange={cambiar('rol')}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </Field>
        <p role="alert" className="error-texto">{error}</p>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="boton-suave" onClick={onClose}>Cancelar</button>
          <button type="submit" className="boton-oro" disabled={enviando}>{enviando ? 'Creando…' : 'Crear usuario'}</button>
        </div>
      </form>
    </Modal>
  )
}