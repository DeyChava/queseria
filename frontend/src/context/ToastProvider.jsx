import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastContext } from './contexts'

// Avisos emergentes (el "toast" de tu diseño): toast('texto') o toast('texto', 'error').
export default function ToastProvider({ children }) {
  const [aviso, setAviso] = useState({ texto: '', tipo: 'ok', visible: false })
  const temporizador = useRef(null)

  const toast = useCallback((texto, tipo = 'ok') => {
    setAviso({ texto, tipo, visible: true })
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setAviso((a) => ({ ...a, visible: false })), 3200)
  }, [])

  const valor = useMemo(() => ({ aviso, toast }), [aviso, toast])
  return <ToastContext.Provider value={valor}>{children}</ToastContext.Provider>
}
