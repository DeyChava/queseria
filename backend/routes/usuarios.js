
import { Router } from "express";
import multer from "multer";

import {
  listarUsuarios,
  actualizarPerfil,
  cambiarPassword,
  eliminarMiCuenta,
  cambiarRol,
  restablecerPassword,
  eliminarUsuario
} from "../controllers/usuariosController.js";

import {
  verificarToken,
  verificarRol
} from "../middlewares/authMiddleware.js";

// Configuración para subir fotografías
const subida = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const permitidos = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (permitidos.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Solo se aceptan imágenes JPG, PNG o WebP"));
  }
});

const router = Router();

// Consultar todos los usuarios: solo administrador
router.get(
  "/",
  verificarToken,
  verificarRol("administrador"),
  listarUsuarios
);

// Editar perfil propio
router.patch(
  "/yo",
  verificarToken,
  subida.single("fotoPerfil"),
  actualizarPerfil
);

// Cambiar contraseña propia
router.post(
  "/yo/password",
  verificarToken,
  cambiarPassword
);

// Eliminar cuenta propia
router.delete(
  "/yo",
  verificarToken,
  eliminarMiCuenta
);

// Cambiar rol de otro usuario: solo administrador
router.patch(
  "/:id/rol",
  verificarToken,
  verificarRol("administrador"),
  cambiarRol
);

// Restablecer contraseña de otro usuario: solo administrador
router.post(
  "/:id/restablecer-password",
  verificarToken,
  verificarRol("administrador"),
  restablecerPassword
);

// Eliminar otro usuario: solo administrador
router.delete(
  "/:id",
  verificarToken,
  verificarRol("administrador"),
  eliminarUsuario
);

export default router;
