
import { Router } from "express";

import {
  registrarUsuario,
  iniciarSesion,
  consultarEstado,
  obtenerUsuario
} from "../controllers/authController.js";

import {
  verificarToken,
  verificarRol
} from "../middlewares/authMiddleware.js";

const router = Router();

// Registro: solamente administrador
router.post(
  "/registro",
  verificarToken,
  verificarRol("administrador"),
  registrarUsuario
);

// Inicio de sesión
router.post("/login", iniciarSesion);

// Consultar estado de autenticación
router.get(
  "/estado",
  verificarToken,
  consultarEstado
);

// Obtener información del usuario conectado
router.get(
  "/yo",
  verificarToken,
  obtenerUsuario
);

export default router;
