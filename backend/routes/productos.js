import { Router } from "express";

import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  editarProducto,
  eliminarProducto
} from "../controllers/productosController.js";

const router = Router();

router.get("/", listarProductos);
router.get("/:id", obtenerProducto);
router.post("/", crearProducto);
router.put("/:id", editarProducto);
router.delete("/:id", eliminarProducto);

export default router;
