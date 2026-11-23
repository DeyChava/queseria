
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { conectarDB } from "./db.js";
import productosRoutes from "./routes/productos.js";
import multer from "multer";
import imagenesRoutes from "./routes/imagenes.js";
import ventasRoutes from "./routes/ventas.js";
import authRoutes from "./routes/auth.js";
import usuariosRoutes from "./routes/usuarios.js";

dotenv.config();
await conectarDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/productos", productosRoutes);
app.use("/api/imagenes", imagenesRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);

app.get("/api/ping", (req, res) => {
  res.json({ mensaje: "El backend de la quesería está vivo" });
});

const PUERTO = process.env.PORT || 5000;

app.listen(PUERTO, () => {
  console.log("Servidor en http://localhost:" + PUERTO);
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "La imagen pesa más de 5 MB" });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: "El campo del archivo debe llamarse imagen"
      });
    }
    return res.status(400).json({ error: error.message });
  }

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  next();
});
