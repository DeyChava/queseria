import { Router } from "express";
import multer from "multer";
import { subirFoto } from "../controllers/imagenesController.js";
 
const subida = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const permitidos = ["image/jpeg", "image/png", "image/webp"];
    if (permitidos.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Solo se aceptan imagenes JPG, PNG o WebP"));
  },
});
 
const router = Router();
router.post("/", subida.single("imagen"), subirFoto);
export default router;
