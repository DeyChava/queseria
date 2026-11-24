import { Router } from "express";
import {
  actualizarPerfil, cambiarPassword, cambiarRol, eliminarMiCuenta,
  eliminarUsuario, listarUsuarios, restablecerPassword,
} from "../controllers/usuariosController.js";
import { ROL } from "../config/roles.js";
import { verificarRol, verificarToken } from "../middlewares/auth.js";
import { validarId } from "../middlewares/validarId.js";

const router = Router();
const soloAdmin = verificarRol(ROL.ADMIN);

router.use(verificarToken);

// Cada persona sobre su propia cuenta (van antes de las rutas con :id)
router.patch("/yo", actualizarPerfil);
router.post("/yo/password", cambiarPassword);
router.delete("/yo", eliminarMiCuenta);

// Administración de cuentas: solo administrador
router.get("/", soloAdmin, listarUsuarios);
router.patch("/:id/rol", soloAdmin, validarId, cambiarRol);
router.post("/:id/restablecer-password", soloAdmin, validarId, restablecerPassword);
router.delete("/:id", soloAdmin, validarId, eliminarUsuario);

export default router;