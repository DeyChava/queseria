import { borrarImagen } from "../config/cloudinary.js";
import { config } from "../config/env.js";
import { ROL, ROLES } from "../config/roles.js";
import Producto from "../models/Producto.js";
import Usuario from "../models/Usuario.js";
import { ErrorHttp } from "../utils/errores.js";
import {
  compararPassword, generarPasswordTemporal, hashearPassword,
} from "../utils/passwords.js";
import { usuarioPublico } from "../utils/serializadores.js";
import { limpiarCorreo, limpiarNombre, validarNombreImagen, validarPassword } from "../utils/validaciones.js";

async function buscarUsuario(id, conPassword = false) {
  const consulta = Usuario.findById(id);
  const usuario = await (conPassword ? consulta.select("+password") : consulta);
  if (!usuario) throw new ErrorHttp(404, "Usuario no encontrado");
  return usuario;
}

// Una foto solo se borra de Cloudinary si nadie más la está usando
async function borrarFotoSiNadieLaUsa(imagen, excluirUsuarioId) {
  if (!imagen) return;
  const [otroUsuario, producto] = await Promise.all([
    Usuario.exists({ fotoPerfil: imagen, _id: { $ne: excluirUsuarioId } }),
    Producto.exists({ imagen }),
  ]);
  if (!otroUsuario && !producto) await borrarImagen(imagen);
}

// El sistema nunca debe quedarse sin administradores
async function exigirOtroAdministrador(usuario) {
  if (usuario.rol !== ROL.ADMIN) return;
  const admins = await Usuario.countDocuments({ rol: ROL.ADMIN, activo: true, _id: { $ne: usuario._id } });
  if (admins === 0) throw new ErrorHttp(409, "No se puede eliminar al único administrador del sistema");
}

// GET /api/usuarios
export async function listarUsuarios(req, res) {
  const usuarios = await Usuario.find().sort({ createdAt: -1 });
  res.json(usuarios.map(usuarioPublico));
}


// POST /api/usuarios { nombre, email, password, rol }   (solo administrador)
// El administrador crea la cuenta directamente, con cualquiera de los tres roles. La contraseña se guarda cifrada (bcrypt).
export async function crearUsuario(req, res) {
  const nombre = limpiarNombre(req.body.nombre);
  const correo = limpiarCorreo(req.body.email ?? req.body.correo);
  const password = validarPassword(req.body.password, "La contraseña", { correo, nombre });
  const rol = req.body.rol ?? ROL.EMPLEADO;
  if (typeof rol !== "string" || !ROLES.includes(rol)) throw new ErrorHttp(400, "El rol indicado no es válido");
  if (await Usuario.exists({ correo })) throw new ErrorHttp(409, "Este correo ya está registrado");

  const usuario = await Usuario.create({ nombre, correo, password: await hashearPassword(password), rol });
  res.status(201).json({ usuario: usuarioPublico(usuario) });
}

// GET /api/usuarios/codigos-acceso   (solo administrador)
// Los códigos que se piden en "Crear cuenta". Salen de las variables CODIGO_* del .env del servidor; si alguna no
// está configurada se devuelve vacía.
export function obtenerCodigosAcceso(req, res) {
  const { admin, jefe, empleado } = config.codigosRegistro;
  res.json({ CODIGO_ADMIN: admin ?? "", CODIGO_JEFE: jefe ?? "", CODIGO_EMPLEADO: empleado ?? "" });
}


// PATCH /api/usuarios/yo { nombre?, foto? }   (foto = nombre corto de POST /api/imagenes, o "" para quitarla)
export async function actualizarPerfil(req, res) {
  const usuario = await buscarUsuario(req.usuario.id);
  const { nombre, foto } = req.body;
  const fotoAnterior = usuario.fotoPerfil;

  if (nombre !== undefined) usuario.nombre = limpiarNombre(nombre);
  if (foto !== undefined) usuario.fotoPerfil = validarNombreImagen(foto);
  await usuario.save();

  if (usuario.fotoPerfil !== fotoAnterior) await borrarFotoSiNadieLaUsa(fotoAnterior, usuario._id);
  res.json({ usuario: usuarioPublico(usuario) });
}

// POST /api/usuarios/yo/password { actual, nueva }
// Una contraseña actual incorrecta responde 400 (no 401): un 401 haría cerrar la sesión en el frontend.
export async function cambiarPassword(req, res) {
  const nueva = validarPassword(req.body.nueva, "La nueva contraseña");
  const usuario = await buscarUsuario(req.usuario.id, true);

  if (typeof req.body.actual !== "string" || !(await compararPassword(req.body.actual, usuario.password))) {
    throw new ErrorHttp(400, "La contraseña actual es incorrecta");
  }
  usuario.password = await hashearPassword(nueva);
  await usuario.save();
  res.json({ mensaje: "Contraseña actualizada correctamente" });
}

// DELETE /api/usuarios/yo { password }
export async function eliminarMiCuenta(req, res) {
  const usuario = await buscarUsuario(req.usuario.id, true);

  if (typeof req.body?.password !== "string" || !(await compararPassword(req.body.password, usuario.password))) {
    throw new ErrorHttp(400, "La contraseña es incorrecta");
  }
  await exigirOtroAdministrador(usuario);

  await usuario.deleteOne();
  await borrarFotoSiNadieLaUsa(usuario.fotoPerfil, usuario._id);
  res.json({ mensaje: "Tu cuenta fue eliminada correctamente" });
}

// PATCH /api/usuarios/:id/rol { rol }
export async function cambiarRol(req, res) {
  const { rol } = req.body;
  if (!ROLES.includes(rol)) throw new ErrorHttp(400, "El rol indicado no es válido");
  if (req.params.id === req.usuario.id) throw new ErrorHttp(400, "No puedes cambiar tu propio rol");

  const usuario = await buscarUsuario(req.params.id);
  usuario.rol = rol;
  await usuario.save();
  res.json({ usuario: usuarioPublico(usuario) });
}

// POST /api/usuarios/:id/restablecer-password -> { passwordTemporal } (se muestra una sola vez)
export async function restablecerPassword(req, res) {
  if (req.params.id === req.usuario.id) {
    throw new ErrorHttp(400, "Para cambiar tu propia contraseña usa la opción de Mi perfil");
  }
  const usuario = await buscarUsuario(req.params.id);

  const passwordTemporal = generarPasswordTemporal();
  usuario.password = await hashearPassword(passwordTemporal);
  usuario.passwordRestablecidaEn = new Date();   // cierra las sesiones que tuviera abiertas
  await usuario.save();
  res.json({ mensaje: "Contraseña restablecida correctamente", passwordTemporal });
}

// DELETE /api/usuarios/:id
export async function eliminarUsuario(req, res) {
  if (req.params.id === req.usuario.id) {
    throw new ErrorHttp(400, "Para eliminar tu propia cuenta usa la opción de Mi perfil");
  }
  const usuario = await buscarUsuario(req.params.id);
  await exigirOtroAdministrador(usuario);

  await usuario.deleteOne();
  await borrarFotoSiNadieLaUsa(usuario.fotoPerfil, usuario._id);
  res.json({ mensaje: "Usuario eliminado correctamente" });
}
