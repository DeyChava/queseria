import { Router } from "express";
import { crear, listar } from "../controllers/categoriasController.js";
import { ROL } from "../config/roles.js";
import { verificarRol, verificarToken } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

router.get("/", listar);                                   // todos los roles (llenan el formulario)
router.post("/", verificarRol(ROL.ADMIN), crear);          // solo el administrador crea categorías

export default router;