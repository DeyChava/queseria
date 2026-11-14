import { useToast } from '../hooks/useToast'
import Icon from './Icon'

// Aviso emergente abajo a la derecha (el "toast" de tu diseño).
export default function Toast() {
  const { aviso } = useToast()
  return (
    <div role="status" aria-live="polite"
      className={`no-imprimir fixed bottom-5 right-5 z-[60] flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-xl px-4 py-3 font-mono text-xs font-bold shadow-2xl transition-all duration-300 ${aviso.tipo === 'error' ? 'bg-peligro text-white' : 'bg-oro text-sobre-oro'} ${aviso.visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-20 opacity-0'}`}>
      <Icon name={aviso.tipo === 'error' ? 'alerta' : 'check'} />
      <span>{aviso.texto}</span>
    </div>
  )
}
