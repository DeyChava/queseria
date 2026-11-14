import { useState } from 'react'
import { deleteUser } from '../../services/userService'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import Field from '../Field'
import Modal from '../Modal'

// Sirve para dos casos:
//  - mode "own":   la persona elimina su cuenta (pide contraseña y escribir ELIMINAR) -> DELETE /api/usuarios/yo
//  - mode "other": el administrador elimina la cuenta de otra persona (recibe "user")  -> DELETE /api/usuarios/:id
// En los dos casos las ventas que esa persona registró se conservan en los reportes.
export default function DeleteAccountModal({ mode, user, onClose, onDeleted }) {
  const { eliminarCuenta } = useAuth()
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [palabra, setPalabra] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const propia = mode === 'own'

  const confirmar = async () => {
    if (propia && palabra.trim() !== 'ELIMINAR') return setError('Escribe ELIMINAR en mayúsculas para confirmar.')
    setEnviando(true); setError('')
    try {
      if (propia) { await eliminarCuenta(password); toast('Tu cuenta fue eliminada.') }
      else { await deleteUser(user._id); toast(`Cuenta eliminada: ${user.email}`); onDeleted?.(user) }
      onClose()
    } catch (err) { setError(err.message) } finally { setEnviando(false) }
  }

  return (
    <Modal title={propia ? 'Eliminar mi cuenta' : 'Eliminar usuario'} onClose={onClose} danger>
      <p className="mb-4 text-sm text-apagado">
        {propia ? 'Vas a eliminar tu cuenta de forma permanente. Perderás el acceso al sistema; las ventas que registraste se conservan en los reportes.'
          : <>Vas a eliminar la cuenta de <strong className="text-titulo">{user.nombre}</strong> ({user.email}). Esta acción no se puede deshacer.</>}
      </p>
      {propia && (
        <div className="mb-3 space-y-3">
          <Field id="del-pass" label="Tu contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          <Field id="del-word" label="Escribe ELIMINAR para confirmar" value={palabra} onChange={(e) => setPalabra(e.target.value)} autoComplete="off" placeholder="ELIMINAR" />
        </div>
      )}
      <p role="alert" className="error-texto">{error}</p>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="boton-suave" onClick={onClose}>Cancelar</button>
        <button type="button" className="boton-oro !bg-peligro !text-white" onClick={confirmar} disabled={enviando}>{enviando ? 'Eliminando…' : 'Eliminar definitivamente'}</button>
      </div>
    </Modal>
  )
}
