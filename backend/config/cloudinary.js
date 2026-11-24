import { v2 as cloudinary } from "cloudinary";
import { config } from "./env.js";

cloudinary.config(config.cloudinary);

const CARPETA = "queseria";

// Recibe el archivo que leyó multer (en memoria) y devuelve el nombre corto de la foto (public_id).
export function subirImagen(archivo) {
  return new Promise((resolver, rechazar) => {
    const flujo = cloudinary.uploader.upload_stream(
      { folder: CARPETA, resource_type: "image" },
      (error, resultado) => (error ? rechazar(error) : resolver(resultado.public_id))
    );
    flujo.end(archivo.buffer);
  });
}

// Borra una foto de Cloudinary. Si falla no tumba la operación principal.
export async function borrarImagen(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("No se pudo borrar la imagen:", publicId, error.message);
  }
}
