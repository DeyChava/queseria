import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Recibe el archivo que leyo multer y devuelve el nombre corto de la foto
export async function subirImagen(archivo) {
  const datos = "data:" + archivo.mimetype + ";base64," +
    archivo.buffer.toString("base64");
  const resultado = await cloudinary.uploader.upload(datos);
  return resultado.public_id;
}

// Borra una foto de Cloudinary. Si falla, no tumba la operacion principal.
export async function borrarImagen(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("No se pudo borrar la imagen:", publicId);
  }
}

export default cloudinary;
