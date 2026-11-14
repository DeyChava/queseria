
import { Router } from "express";

import {
  crearVenta,
  listarVentas,
  obtenerVenta
} from "../controllers/ventasController.js";

const router = Router();

router.get("/", listarVentas);
router.get("/:id", obtenerVenta);
router.post("/", crearVenta);

export default router;
