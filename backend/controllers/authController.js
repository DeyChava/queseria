
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { ROL, ROLES } from "../config/roles.js";
import Usuario from "../models/Usuario.js";
import { ErrorHttp } from "../utils/errores.js";
import {
  compararPassword, HASH_FALSO, hashearPassword, textosIguales,
} from "../utils/passwords.js";
import { usuarioPublico } from "../utils/serializadores.js";
import { limpiarCorreo, limpiarNombre, validarPassword } from "../utils/validaciones.js";

const generarToken = (usuario) =>
  jwt.sign({ id: usuario._id }, config.jwtSecret, { algorithm: "HS256", expiresIn: config.jwtExpira });

// GET /api/auth/estado (público): el frontend lo usa para saber si hay login y si ya existen usuarios
export async function consultarEstado(req, res) {
  const hayUsuarios = (await Usuario.exists({})) !== null;
  res.json({ extension: true, hayUsuarios });
}

// importante : POST /api/auth/registro { nombre, email, password, rol, codigoRol }
//  - La primera cuenta del sistema es siempre de administrador y no pide código.
//  - Las demás piden el código de autorización del rol elegido (variables CODIGO_* del .env).
export async function registrarUsuario(req, res) {
  const nombre = limpiarNombre(req.body.nombre);
  const correo = limpiarCorreo(req.body.email ?? req.body.correo);
  const password = validarPassword(req.body.password);
  const rolPedido = req.body.rol ?? ROL.EMPLEADO;
  if (!ROLES.includes(rolPedido)) throw new ErrorHttp(400, "El rol indicado no es válido");

  const primeraCuenta = (await Usuario.exists({})) === null;
  let rol = rolPedido;

  if (primeraCuenta) {
    rol = ROL.ADMIN;
  } else {
    const codigoEsperado = config.codigosRegistro[rol];
    if (!codigoEsperado) throw new ErrorHttp(403, "Ese rol no está habilitado para crear cuentas");
    if (!textosIguales(req.body.codigoRol ?? "", codigoEsperado)) {
      throw new ErrorHttp(403, "El código de autorización no es correcto");
    }
  }

  const usuario = await Usuario.create({ nombre, correo, password: await hashearPassword(password), rol });
  res.status(201).json({ token: generarToken(usuario), usuario: usuarioPublico(usuario) });
}

// POST /api/auth/login { email, password, rol }
export async function iniciarSesion(req, res) {
  const { password, rol } = req.body;
  const correo = String(req.body.email ?? req.body.correo ?? "").trim().toLowerCase();
  if (!correo || typeof password !== "string" || !password) {
    throw new ErrorHttp(400, "Debes ingresar correo y contraseña");
  }

  const usuario = await Usuario.findOne({ correo }).select("+password");
  // Se compara siempre, exista o no el correo, para que el tiempo de respuesta no delate cuáles existen
  const correcta = await compararPassword(password, usuario?.password ?? HASH_FALSO);
  if (!usuario || !correcta) throw new ErrorHttp(401, "Correo o contraseña incorrectos");
  if (!usuario.activo) throw new ErrorHttp(403, "Esta cuenta está desactivada");
  if (rol && rol !== usuario.rol) throw new ErrorHttp(403, "Tu cuenta no tiene ese rol de acceso");

  res.json({ token: generarToken(usuario), usuario: usuarioPublico(usuario) });
}

// GET /api/auth/yo
export async function obtenerUsuarioActual(req, res) {
  const usuario = await Usuario.findById(req.usuario.id);
  res.json({ usuario: usuarioPublico(usuario) });
}
