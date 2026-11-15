import logo from '../assets/logo.png'

// Logotipo de La Quesería. El fondo del logo es blanco, así que se muestra dentro de un círculo
// con borde dorado para que se vea bien tanto en modo claro como en modo oscuro.
export default function Logo({ size = 120, className = '' }) {
  return (
    <img
      src={logo}
      alt="La Quesería — Sabor, Calidad, Compromiso"
      width={size}
      height={size}
      draggable={false}
      style={{ width: size, height: size }}
      className={`mx-auto block rounded-full border border-oro/40 bg-white object-cover shadow-lg ${className}`}
    />
  )
}
