import { useCallback, useState } from 'react'

// Modo oscuro (el de tu diseño) o claro. Se guarda solo la preferencia visual en este navegador.
export function useTheme() {
  const [tema, setTema] = useState(() => (document.documentElement.getAttribute('data-tema') === 'claro' ? 'claro' : 'oscuro'))

  const alternar = useCallback(() => {
    const nuevo = tema === 'claro' ? 'oscuro' : 'claro'
    if (nuevo === 'claro') document.documentElement.setAttribute('data-tema', 'claro')
    else document.documentElement.removeAttribute('data-tema')
    try { localStorage.setItem('q_tema', nuevo) } catch { /* nada */ }
    setTema(nuevo)
  }, [tema])

  return { tema, alternar }
}
