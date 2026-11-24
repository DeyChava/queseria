import { Router } from "express";
import {
  consultarEstado, iniciarSesion, obtenerUsuarioActual, registrarUsuario,
} from "../controllers/authController.js";
import { verificarToken } from "../middlewares/auth.js";
import { limitarLogin, limitarRegistro } from "../middlewares/limitadores.js";

const router = Router();

router.get("/estado", consultarEstado);                          // público
router.post("/registro", limitarRegistro, registrarUsuario);     // público, pero pide código de autorización
router.post("/login", limitarLogin, iniciarSesion);              // público
router.get("/yo", verificarToken, obtenerUsuarioActual);

export default router;
