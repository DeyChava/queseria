import Icon from '../Icon'

// Variación contra el mes anterior: "▲ 12 % vs mes anterior". Si el mes anterior no tuvo datos, lo dice.
export default function Delta({ valor }) {
  if (valor === null) return <p className="mt-1 font-mono text-[10px] text-tenue">Sin datos del mes anterior</p>
  const sube = valor >= 0
  return (
    <p className={`mt-1 flex items-center gap-1 font-mono text-[10px] ${sube ? 'text-exito' : 'text-peligro'}`}>
      <Icon name={sube ? 'subir' : 'bajar'} size={12} />{sube ? '+' : ''}{valor} % vs mes anterior
    </p>
  )
}
