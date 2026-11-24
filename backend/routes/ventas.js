import { Router } from "express";
import { crearVenta, listarVentas, obtenerVenta } from "../controllers/ventasController.js";
import { verificarToken } from "../middlewares/auth.js";
import { validarId } from "../middlewares/validarId.js";

const router = Router();

router.use(verificarToken);   // los tres roles pueden vender y consultar sus ventas

router.post("/", crearVenta);
router.get("/", listarVentas);
router.get("/:id", validarId, obtenerVenta);

export default router;

