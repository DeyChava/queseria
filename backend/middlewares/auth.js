import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import Usuario from "../models/Usuario.js";
import { ErrorHttp } from "../utils/errores.js";

// Exige un token válido y deja los datos del usuario en req.usuario
export async function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || "";
  if (!encabezado.startsWith("Bearer ")) {
    throw new ErrorHttp(401, "No estás autenticado");
  }

  let datos;
  try {
    datos = jwt.verify(encabezado.slice(7), config.jwtSecret, { algorithms: ["HS256"] });
  } catch {
    throw new ErrorHttp(401, "Tu sesión terminó. Inicia sesión de nuevo");
  }

  const usuario = await Usuario.findById(datos.id).select("-password");
  if (!usuario || !usuario.activo) {
    throw new ErrorHttp(401, "Usuario no válido o desactivado");
  }

  // Token emitido antes de que el administrador restableciera la contraseña
  const restablecida = usuario.passwordRestablecidaEn;
  if (restablecida && datos.iat < Math.floor(restablecida.getTime() / 1000)) {
    throw new ErrorHttp(401, "Tu contraseña fue restablecida. Inicia sesión de nuevo");
  }

  req.usuario = {
    id: usuario._id.toString(),
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
  };
  next();
}

// Permite el paso solo a los roles indicados: verificarRol(ROL.ADMIN, ROL.JEFE)
export const verificarRol = (...rolesPermitidos) => (req, res, next) => {
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    throw new ErrorHttp(403, "No tienes permisos para realizar esta acción");
  }
  next();
};
