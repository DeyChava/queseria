import { useEffect, useState } from 'react'
import { getAccessCodes } from '../../services/userService'

// Códigos que se piden en "Crear cuenta". Solo los entrega el backend al administrador (GET /api/usuarios/codigos-acceso);
// no están escritos en el código del frontend. Si alguno no está configurado en el .env del servidor, sale vacío.
export default function CodigosAcceso() {
  const [codigos, setCodigos] = useState(null)
  const [error, setError] = useState('')
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    let activo = true
    getAccessCodes().then((c) => activo && setCodigos(c)).catch((err) => activo && setError(err.message))
    return () => { activo = false }
  }, [])

  if (error) return <p role="alert" className="error-texto text-center">No se pudieron cargar los códigos: {error}</p>
  if (!codigos) return null
  return (
    <div className="mx-auto flex w-fit flex-col items-center gap-2">
      <button type="button" className="boton-suave text-xs" onClick={() => setMostrar((v) => !v)}>
        {mostrar ? 'Ocultar códigos de registro' : 'Mostrar códigos de registro'}
      </button>
      {mostrar && (
        <pre data-testid="codigos-acceso" className="w-fit select-all rounded-lg border border-linea bg-campo px-4 py-2 font-mono text-xs leading-relaxed text-oro-claro">
          {`CODIGO_ADMIN=${codigos.CODIGO_ADMIN ?? ''}\nCODIGO_JEFE=${codigos.CODIGO_JEFE ?? ''}\nCODIGO_EMPLEADO=${codigos.CODIGO_EMPLEADO ?? ''}`}
        </pre>
      )}
    </div>
  )
}