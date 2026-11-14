import { urlImagen } from '../utils/products'

// Foto de perfil, o las iniciales si la persona no ha subido foto.
export default function Avatar({ user, size = 40 }) {
  const url = urlImagen(user.foto, size * 2)
  const iniciales = user.nombre.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
  const estilo = { width: size, height: size, fontSize: Math.round(size / 3) }
  return url
    ? <img src={url} alt={`Foto de ${user.nombre}`} style={estilo} className="shrink-0 rounded-full border border-linea object-cover" />
    : <span style={estilo} aria-hidden="true" className="inline-flex shrink-0 items-center justify-center rounded-full border border-linea bg-oro/20 font-mono font-bold text-oro-claro">{iniciales}</span>
}
