import { subirImagen } from "../cloudinary.js";

// POST /api/imagenes -> sube una foto y devuelve su nombre
export async function subirFoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No llego ninguna imagen" });
    }
    const imagen = await subirImagen(req.file);
    res.status(201).json({ imagen });
  } catch (error) {
    console.error("Cloudinary:", error.message);
    res.status(500).json({ error: "No se pudo subir la imagen" });
  }
}
