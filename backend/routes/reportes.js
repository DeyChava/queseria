import { Router } from "express";
import { obtenerReporteMensual } from "../controllers/reportesController.js";
import { ROL } from "../config/roles.js";
import { verificarRol, verificarToken } from "../middlewares/auth.js";

const router = Router();

router.get("/mensual", verificarToken, verificarRol(ROL.ADMIN, ROL.JEFE), obtenerReporteMensual);

export default router;