import { useEffect } from 'react'
import Icon from './Icon'

// Ventana emergente con el diseño de tu modal: fondo oscuro con desenfoque, borde dorado y título Cinzel.
// Se cierra con Esc, con la X o tocando el fondo. Se monta solo cuando está abierta (así los formularios arrancan limpios).
export default function Modal({ title, onClose, children, wide = false, danger = false }) {
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl border bg-card p-6 shadow-brillo ${wide ? 'max-w-2xl' : 'max-w-lg'} ${danger ? 'border-peligro/50' : 'border-oro/40'}`}>
        <div className="mb-4 flex items-center justify-between border-b border-linea pb-3">
          <h3 className={`font-title text-xl ${danger ? 'text-peligro' : 'text-oro-claro'}`}>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-apagado hover:text-titulo"><Icon name="cerrar" size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
