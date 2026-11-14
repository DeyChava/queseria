import { useState } from 'react'
import { resetPassword } from '../../services/userService'
import Modal from '../Modal'

// El administrador genera una contraseña temporal para otra persona (POST /api/usuarios/:id/restablecer-password).
// Se muestra UNA sola vez: hay que entregarla en persona.
export default function ResetPasswordModal({ user, onClose }) {
  const [temporal, setTemporal] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const generar = async () => {
    setEnviando(true); setError('')
    try { setTemporal((await resetPassword(user._id)).passwordTemporal) } catch (err) { setError(err.message) } finally { setEnviando(false) }
  }

  return (
    <Modal title="Restablecer contraseña" onClose={onClose}>
      {temporal ? (
        <>
          <p className="mb-3 text-sm text-apagado">Contraseña temporal de <strong className="text-titulo">{user.nombre}</strong>. Entrégasela en persona; solo se muestra ahora.</p>
          <p className="select-all rounded-lg border border-oro/40 bg-campo p-3 text-center font-mono text-lg font-bold tracking-wider text-oro-claro" data-testid="temporal">{temporal}</p>
          <div className="flex justify-end pt-4"><button type="button" className="boton-oro" onClick={onClose}>Listo</button></div>
        </>
      ) : (
        <>
          <p className="text-sm text-apagado">Se creará una contraseña temporal para <strong className="text-titulo">{user.nombre}</strong> ({user.email}) y la actual dejará de funcionar.</p>
          <p role="alert" className="error-texto mt-3">{error}</p>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" className="boton-suave" onClick={onClose}>Cancelar</button>
            <button type="button" className="boton-oro" onClick={generar} disabled={enviando}>{enviando ? 'Generando…' : 'Generar contraseña temporal'}</button>
          </div>
        </>
      )}
    </Modal>
  )
}
