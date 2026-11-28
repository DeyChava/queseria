import mongoose from "mongoose";

// Categorías de productos. "clave" es el nombre sin tildes, mayúsculas ni espacios de más: evita duplicados
// ("Lácteos", "lacteos" y " LÁCTEOS " son la misma categoría).
const categoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true, maxlength: 60 },
  clave:  { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model("Categoria", categoriaSchema);