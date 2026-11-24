import { Router } from "express";
import { subirFoto } from "../controllers/imagenesController.js";
import { verificarToken } from "../middlewares/auth.js";
import { recibirImagen } from "../middlewares/subida.js";

const router = Router();

// Cualquier usuario con sesión: sirve para fotos de productos (admin) y de perfil
router.post("/", verificarToken, recibirImagen, subirFoto);

export default router;
