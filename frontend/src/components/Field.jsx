// Etiqueta + campo con el estilo de tu formulario. Si recibe children (por ejemplo un <select className="campo">)
// los muestra; si no, dibuja un <input>.
export default function Field({ id, label, children, hint, big = false, ...props }) {
  return (
    <div>
      <label className={`etiqueta ${big ? 'font-semibold uppercase tracking-wider mb-2' : ''}`} htmlFor={id}>{label}</label>
      {children ?? <input id={id} className={`campo ${big ? 'campo-grande' : ''}`} {...props} />}
      {hint && <p className="mt-1 font-mono text-[10px] text-tenue">{hint}</p>}
    </div>
  )
}
