
import mongoose from "mongoose";

const ROLES = [
  "administrador",
  "jefe_inventario",
  "empleado"
];

const usuarioSchema = new mongoose.Schema({

  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  correo: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  rol: {
    type: String,
    enum: ROLES,
    default: "empleado",
    required: true
  },

  fotoPerfil: {
    type: String,
    default: ""
  },

  activo: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

export { ROLES };

export default mongoose.model("Usuario", usuarioSchema);
