// Formato de números, textos y fechas.
export const crc = (n) => '₡' + Math.round(n || 0).toLocaleString('es-CR')

// Cantidades con decimales (12.5 kg) sin ceros de más
export const cantidad = (n) =>
  Number(Number(n || 0).toFixed(3)).toLocaleString('es-CR', {
    maximumFractionDigits: 3,
  })

// Evita errores de coma flotante al sumar y restar decimales (0.1 + 0.2)
export const redondear = (n) => Math.round(n * 1000) / 1000

// Quita tildes y mayúsculas: así "lacteos" encuentra "Lácteos".
export const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export const fechaCorta = (d) => new Date(d).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })
export const fechaLarga = (d) => new Date(d).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })

// Texto de la unidad junto a una cantidad: "12 un." · "3 kg" · "5 trenzas"
export const unidadCorta = (unidad) => (unidad === 'unidades' || !unidad ? 'un.' : unidad)

// "AAAA-MM" del mes actual y de los últimos n meses (del más reciente al más antiguo)
export const mesDe = (fecha) => { const d = new Date(fecha); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') }
export const ultimosMeses = (n = 12) => { const h = new Date(); return Array.from({ length: n }, (_, i) => mesDe(new Date(h.getFullYear(), h.getMonth() - i, 1))) }
export const etiquetaMes = (m) => { const [y, mo] = m.split('-'); const t = new Date(y, mo - 1, 1).toLocaleDateString('es-CR', { month: 'long', year: 'numeric' }); return t.charAt(0).toUpperCase() + t.slice(1) }
export const etiquetaDia = (dia) => { const [y, m, d] = dia.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric' }) }
