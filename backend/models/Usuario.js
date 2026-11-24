import mongoose from "mongoose";
import { ROL, ROLES } from "../config/roles.js";

const usuarioSchema = new mongoose.Schema({
  nombre:     { type: String, required: true, trim: true, maxlength: 100 },
  correo:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, select: false },
  rol:        { type: String, enum: ROLES, default: ROL.EMPLEADO, required: true },
  fotoPerfil: { type: String, default: "" },        // nombre corto de la foto en Cloudinary
  activo:     { type: Boolean, default: true },
  // Si el administrador restablece la contraseña, los tokens anteriores a esta fecha dejan de servir
  passwordRestablecidaEn: { type: Date },
}, { timestamps: true });

export default mongoose.model("Usuario", usuarioSchema);
