import { ICONOS } from '../utils/icons'

// Icono de línea. Uso: <Icon name="mas" size={16} />
export default function Icon({ name, size = 16, stroke = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      aria-hidden="true" className="shrink-0" dangerouslySetInnerHTML={{ __html: ICONOS[name] }} />
  )
}
