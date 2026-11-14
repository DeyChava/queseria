import { useState } from 'react'
import { useProducts } from '../../hooks/useProducts'
import Modal from '../Modal'

// Confirmación antes de eliminar un producto (DELETE /api/productos/:id; el backend también borra su foto).
export default function DeleteProductModal({ product, onClose }) {
  const { eliminar } = useProducts()
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const confirmar = async () => {
    setEnviando(true)
    const r = await eliminar(product)
    setEnviando(false)
    if (r.error) return setError(r.error)
    onClose()
  }

  return (
    <Modal title="Eliminar Producto" onClose={onClose} danger>
      <p className="mb-4 text-sm text-apagado">
        Vas a eliminar <strong className="text-titulo">{product.nombre}</strong>{product.codigo ? ` (${product.codigo})` : ''} de la base de datos, junto con su fotografía. Esta acción no se puede deshacer.
      </p>
      <p role="alert" className="error-texto">{error}</p>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="boton-suave" onClick={onClose}>Cancelar</button>
        <button type="button" className="boton-oro !bg-peligro !text-white" onClick={confirmar} disabled={enviando}>{enviando ? 'Eliminando…' : 'Eliminar definitivamente'}</button>
      </div>
    </Modal>
  )
}
