import { useEffect, useState } from 'react'
import { ping } from '../services/systemService'

// Consulta GET /api/ping al abrir la app y cada 30 segundos.
// Devuelve 'comprobando' | 'conectado' | 'sin-conexion'.
export function useServerStatus() {
  const [estado, setEstado] = useState('comprobando')

  useEffect(() => {
    let activo = true
    const comprobar = () => ping()
      .then(() => activo && setEstado('conectado'))
      .catch(() => activo && setEstado('sin-conexion'))
    comprobar()
    const intervalo = setInterval(comprobar, 30000)
    return () => { activo = false; clearInterval(intervalo) }
  }, [])

  return estado
}
