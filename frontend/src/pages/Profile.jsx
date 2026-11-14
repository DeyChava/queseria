import { useRef, useState } from 'react'
import Avatar from '../components/Avatar'
import Field from '../components/Field'
import Icon from '../components/Icon'
import DeleteAccountModal from '../components/users/DeleteAccountModal'
import { useAuth } from '../hooks/useAuth'
import { uploadImage } from '../services/productService'
import { ROLES } from '../utils/constants'
import { fechaLarga } from '../utils/format'

const FORMATOS = ['image/jpeg', 'image/png', 'image/webp']

// Mi perfil: foto, nombre, correo (no editable), rol, cambio de contraseña y eliminar cuenta.
// La foto se sube con POST /api/imagenes y su nombre corto se guarda con PATCH /api/usuarios/yo.
export default function Profile() {
  const { usuario, actualizarPerfil, cambiarPassword } = useAuth()
  const [nombre, setNombre] = useState(usuario.nombre)
  const [msg, setMsg] = useState(null)
  const [pw, setPw] = useState({ actual: '', nueva: '', confirmar: '' })
  const [msgPw, setMsgPw] = useState(null)
  const [eliminar, setEliminar] = useState(false)
  const archivo = useRef(null)
  const color = (m) => (m?.ok ? 'text-exito' : 'text-peligro')

  const accion = async (fn, texto) => {
    try { await fn(); setMsg({ ok: true, texto }) } catch (err) { setMsg({ ok: false, texto: err.message }) }
  }
  const subirFoto = async (e) => {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    if (!FORMATOS.includes(f.type)) return setMsg({ ok: false, texto: 'Elige una imagen JPG, PNG o WebP.' })
    if (f.size > 5 * 1024 * 1024) return setMsg({ ok: false, texto: 'La imagen pesa más de 5 MB.' })
    accion(async () => actualizarPerfil({ foto: await uploadImage(f) }), 'Foto actualizada.')
  }
  const guardar = (e) => { e.preventDefault(); accion(() => actualizarPerfil({ nombre }), 'Cambios guardados.') }
  const actualizarPassword = async (e) => {
    e.preventDefault()
    if (pw.nueva !== pw.confirmar) return setMsgPw({ ok: false, texto: 'Las contraseñas nuevas no coinciden.' })
    try { await cambiarPassword({ actual: pw.actual, nueva: pw.nueva }); setPw({ actual: '', nueva: '', confirmar: '' }); setMsgPw({ ok: true, texto: 'Contraseña actualizada.' }) }
    catch (err) { setMsgPw({ ok: false, texto: err.message }) }
  }

  return (
    <section className="max-w-3xl space-y-6">
      <h1 className="font-title text-2xl font-bold text-titulo">Mi Perfil</h1>

      <div className="tarjeta flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
        <div className="flex flex-col items-center gap-2">
          <Avatar user={usuario} size={112} />
          <input ref={archivo} type="file" accept={FORMATOS.join(',')} className="hidden" onChange={subirFoto} />
          <button type="button" className="boton-suave" onClick={() => archivo.current.click()}><Icon name="camera" size={14} />Cambiar foto</button>
          {usuario.foto && <button type="button" className="boton-suave" onClick={() => accion(() => actualizarPerfil({ foto: '' }), 'Foto eliminada.')}><Icon name="papelera" size={14} />Quitar foto</button>}
        </div>
        <form onSubmit={guardar} className="w-full flex-1 space-y-4">
          <Field id="prof-nombre" label="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={60} autoComplete="name" />
          <Field id="prof-email" label="Correo electrónico" value={usuario.email} readOnly />
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div><span className="etiqueta">Rol de acceso</span><span className="rounded bg-oro/15 px-2 py-1 font-mono text-xs text-oro-claro">{ROLES[usuario.rol]}</span></div>
            <div><span className="etiqueta">Miembro desde</span><span className="font-mono text-xs">{fechaLarga(usuario.createdAt)}</span></div>
          </div>
          <p role="alert" className={`text-xs font-semibold ${color(msg)}`}>{msg?.texto}</p>
          <button type="submit" className="boton-oro">Guardar cambios</button>
        </form>
      </div>

      <div className="tarjeta p-6 sm:p-8">
        <h2 className="mb-4 font-title text-lg text-oro-claro">Cambiar contraseña</h2>
        <form onSubmit={actualizarPassword} className="grid items-end gap-4 sm:grid-cols-3">
          <Field id="pw-actual" label="Contraseña actual" type="password" value={pw.actual} onChange={(e) => setPw({ ...pw, actual: e.target.value })} required autoComplete="current-password" />
          <Field id="pw-nueva" label="Nueva contraseña" type="password" value={pw.nueva} onChange={(e) => setPw({ ...pw, nueva: e.target.value })} required minLength={8} autoComplete="new-password" />
          <Field id="pw-confirmar" label="Confirmar nueva" type="password" value={pw.confirmar} onChange={(e) => setPw({ ...pw, confirmar: e.target.value })} required minLength={8} autoComplete="new-password" />
          <div className="sm:col-span-3"><p role="alert" className={`mb-2 text-xs font-semibold ${color(msgPw)}`}>{msgPw?.texto}</p><button type="submit" className="boton-oro">Actualizar contraseña</button></div>
        </form>
      </div>

      <div className="tarjeta !border-peligro/45 p-6 sm:p-8">
        <h2 className="mb-2 font-title text-lg text-peligro">Zona de peligro</h2>
        <p className="mb-4 text-sm text-apagado">Al eliminar tu cuenta pierdes el acceso al sistema. Las ventas que registraste se conservan en los reportes. Esta acción no se puede deshacer.</p>
        <button type="button" className="boton-oro !bg-peligro !text-white" onClick={() => setEliminar(true)}><Icon name="papelera" size={14} />Eliminar mi cuenta</button>
      </div>

      {eliminar && <DeleteAccountModal mode="own" onClose={() => setEliminar(false)} />}
    </section>
  )
}
