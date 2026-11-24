import { subirImagen } from "../config/cloudinary.js";
import { ErrorHttp } from "../utils/errores.js";

// POST /api/imagenes (campo "imagen") -> { imagen: "nombre corto en Cloudinary" }
export async function subirFoto(req, res) {
  if (!req.file) throw new ErrorHttp(400, "No llegó ninguna imagen");
  try {
    res.status(201).json({ imagen: await subirImagen(req.file) });
  } catch (error) {
    console.error("Cloudinary:", error.message);
    throw new ErrorHttp(502, "No se pudo subir la imagen. Revisa las claves de Cloudinary en el .env");
  }
}

