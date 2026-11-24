import { Router } from "express";
import authRoutes from "./auth.js";
import imagenesRoutes from "./imagenes.js";
import productosRoutes from "./productos.js";
import reportesRoutes from "./reportes.js";
import usuariosRoutes from "./usuarios.js";
import ventasRoutes from "./ventas.js";

const router = Router();

router.get("/ping", (req, res) => res.json({ mensaje: "El backend de la quesería está vivo" }));

router.use("/auth", authRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/productos", productosRoutes);
router.use("/imagenes", imagenesRoutes);
router.use("/ventas", ventasRoutes);
router.use("/reportes", reportesRoutes);

export default router;