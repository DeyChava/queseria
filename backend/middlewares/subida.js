import multer from "multer";
import { ErrorHttp } from "../utils/errores.js";

const FORMATOS = ["image/jpeg", "image/png", "image/webp"];

// Recibe UNA imagen en el campo "imagen" (JPG, PNG o WebP, máx. 5 MB) y la deja en memoria
export const recibirImagen = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, archivo, cb) => {
    if (FORMATOS.includes(archivo.mimetype)) return cb(null, true);
    cb(new ErrorHttp(400, "Solo se aceptan imágenes JPG, PNG o WebP"));
  },
}).single("imagen");
