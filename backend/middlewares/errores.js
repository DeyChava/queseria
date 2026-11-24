import multer from "multer";
import { ErrorHttp } from "../utils/errores.js";

export function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: "Ruta no encontrada" });
}

// Manejador central: todo error termina aquí y responde { error: "mensaje" }
// (el frontend lee ese campo). Express 5 envía aquí también los errores de funciones async.
export function manejarErrores(error, req, res, _next) {
  if (error instanceof ErrorHttp) {
    return res.status(error.status).json({ error: error.message });
  }

  if (error instanceof multer.MulterError) {
    const mensajes = {
      LIMIT_FILE_SIZE: "La imagen pesa más de 5 MB",
      LIMIT_UNEXPECTED_FILE: "El campo del archivo debe llamarse imagen",
    };
    return res.status(400).json({ error: mensajes[error.code] || error.message });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "La petición es demasiado grande" });
  }

  if (error.name === "ValidationError") {
    const primero = Object.values(error.errors)[0];
    return res.status(400).json({ error: primero?.message || "Datos inválidos" });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ error: `Valor inválido en el campo ${error.path}` });
  }
  if (error.code === 11000) {
    const campo = Object.keys(error.keyPattern || {})[0];
    const mensajes = {
      correo: "Este correo ya está registrado",
      codigo: "Ya existe un producto activo con ese código",
    };
    return res.status(409).json({ error: mensajes[campo] || "Ya existe un registro con ese valor" });
  }

  console.error("Error no controlado:", error);
  res.status(500).json({ error: "Error interno del servidor" });
}
