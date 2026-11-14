// Muestra "cargando" o el error (con botón para reintentar); si todo está bien, muestra el contenido.
export default function DataState({ loading, error, onRetry, children, label = 'Cargando…' }) {
  if (loading) return <div className="py-10 text-center font-mono text-xs text-apagado" role="status"><span className="giro" aria-hidden="true" />{label}</div>
  if (error) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-peligro/35 bg-peligro/10 p-4 text-sm text-peligro" role="alert">
        <span>{error}</span>
        <button type="button" className="boton-suave" onClick={onRetry}>Reintentar</button>
      </div>
    )
  }
  return children
}
