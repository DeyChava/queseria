
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

// Verificar si el usuario está autenticado
export const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        mensaje: "No estás autenticado"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const usuario = await Usuario.findById(decoded.id)
      .select("-password");

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        mensaje: "Usuario no válido o desactivado"
      });
    }

    req.usuario = {
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol
    };

    next();

  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o expirado"
    });
  }
};

// Verificar permisos según el rol
export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {

    if (!req.usuario) {
      return res.status(401).json({
        mensaje: "Debes iniciar sesión"
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: "No tienes permisos para realizar esta acción"
      });
    }

    next();
  };
};
