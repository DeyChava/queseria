import { Router } from "express";
<<<<<<< HEAD
import {
  listarProductos,
  crearProducto,
  editarProducto,
  eliminarProducto,
} from "../controllers/productosController.js";
 
const router = Router();
 
router.get("/", listarProductos);
router.post("/", crearProducto);
router.put("/:id", editarProducto);
router.delete("/:id", eliminarProducto);
 
export default router;

=======

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
>>>>>>> 6326c845b05ad7531bfcc6e2b845d3dbf811b438
