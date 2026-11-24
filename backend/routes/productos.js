import { Router } from "express";
import {
  ajustarStock, crearProducto, editarProducto, eliminarProducto,
  listarMovimientos, listarProductos, obtenerProducto,
} from "../controllers/productosController.js";
import { ROL } from "../config/roles.js";
import { verificarRol, verificarToken } from "../middlewares/auth.js";
import { validarId } from "../middlewares/validarId.js";

const router = Router();
const soloAdmin = verificarRol(ROL.ADMIN);
const adminOJefe = verificarRol(ROL.ADMIN, ROL.JEFE);

router.use(verificarToken);

router.get("/", listarProductos);                                         // todos los roles
router.get("/:id", validarId, obtenerProducto);
router.post("/", soloAdmin, crearProducto);
router.put("/:id", soloAdmin, validarId, editarProducto);
router.delete("/:id", soloAdmin, validarId, eliminarProducto);

router.post("/:id/stock", adminOJefe, validarId, ajustarStock);           // entradas, salidas y ajustes
router.get("/:id/movimientos", adminOJefe, validarId, listarMovimientos); // historial

export default router;