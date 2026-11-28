import { useCallback, useEffect, useState } from 'react'
import Avatar from '../components/Avatar'
import DataState from '../components/DataState'
import Icon from '../components/Icon'
import CodigosAcceso from '../components/users/CodigosAcceso'
import CreateUserModal from '../components/users/CreateUserModal'
import DeleteAccountModal from '../components/users/DeleteAccountModal'
import ResetPasswordModal from '../components/users/ResetPasswordModal'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { changeRole, listUsers } from '../services/userService'
import { ROLES } from '../utils/constants'


// Usuarios y roles (solo administrador): cambiar el rol de cada cuenta, restablecer contraseñas y eliminar cuentas.
// El servidor impide dejar el sistema sin administradores.
export default function Users() {
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === 'admin' // el botón y los códigos solo se muestran al administrador (el backend lo vuelve a comprobar)
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [reset, setReset] = useState(null)
  const [borrar, setBorrar] = useState(null)
  const [creando, setCreando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true); setError('')
    try { setUsuarios(await listUsers()) } catch (err) { setError(err.message) } finally { setCargando(false) }
  }, [])
  useEffect(() => { cargar() }, [cargar])

  const cambiarRol = async (u, rol) => {
    try {
      const nuevo = await changeRole(u._id, rol)
      setUsuarios((us) => us.map((x) => (x._id === nuevo._id ? nuevo : x)))
      toast(`Rol actualizado: ${ROLES[rol]}`)
    } catch (err) { toast(err.message, 'error') }
  }

return (
    <section className="space-y-4">
      {esAdmin && <CodigosAcceso />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-title text-2xl font-bold text-titulo">Usuarios y Roles</h1>
        {esAdmin && <button type="button" className="boton-oro" onClick={() => setCreando(true)}><Icon name="mas" size={14} />Agregar usuario</button>}
      </div>
      <p className="text-xs text-apagado">Administrador: todo, incluido crear, editar y eliminar productos. Jefe de inventario: inventario, ventas y reportes. Empleado: catálogo y punto de venta.</p>
      <DataState loading={cargando} error={error} onRetry={cargar} label="Cargando usuarios…">
        <div className="tabla-caja"><div className="overflow-x-auto"><table className="tabla">
          <thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Creado</th><th className="text-right">Acciones</th></tr></thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u._id}>
                <td><span className="flex items-center gap-2"><Avatar user={u} size={32} /><b className="text-titulo">{u.nombre}</b></span></td>
                <td className="text-apagado">{u.email}</td>
                <td><select className="campo !w-auto" value={u.rol} disabled={u._id === usuario?._id} onChange={(e) => cambiarRol(u, e.target.value)} aria-label={`Rol de ${u.nombre}`}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
                <td className="text-apagado">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CR') : '—'}</td>
                <td className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                     {u._id === usuario?._id
                      ? <span className="estado estado-neutro">Tú</span>
                      : <>
                        <button type="button" className="boton-accion" onClick={() => setReset(u)} aria-label={`Restablecer contraseña de ${u.nombre}`}><Icon name="llave" size={12} />Restablecer</button>
                        <button type="button" className="boton-accion peligro" onClick={() => setBorrar(u)} aria-label={`Eliminar cuenta de ${u.nombre}`}><Icon name="papelera" size={12} />Eliminar</button>
                      </>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      </DataState>
      {creando && <CreateUserModal onClose={() => setCreando(false)} onCreated={(nuevo) => { setUsuarios((us) => [nuevo, ...us]); toast(`Usuario creado: ${nuevo.nombre}`) }} />}
      {reset && <ResetPasswordModal user={reset} onClose={() => setReset(null)} />}
      {borrar && <DeleteAccountModal mode="other" user={borrar} onClose={() => setBorrar(null)} onDeleted={(u) => setUsuarios((us) => us.filter((x) => x._id !== u._id))} />}
    </section>
  )
}
