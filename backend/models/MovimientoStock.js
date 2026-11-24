import mongoose from "mongoose";

export const TIPOS_MOVIMIENTO = ["entrada", "salida", "ajuste", "venta"];

// Historial de TODO cambio de existencias. Nunca se edita ni se borra: de aquí salen
// las "unidades ingresadas" de los reportes mensuales.
const movimientoSchema = new mongoose.Schema({
  producto:       { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
  nombreProducto: { type: String, required: true },            // copia: se conserva aunque el producto cambie
  unidad:         { type: String, default: "unidades" },
  tipo:           { type: String, enum: TIPOS_MOVIMIENTO, required: true },
  cantidad:       { type: Number, required: true },            // con signo: + suma existencias, − resta
  stockAnterior:  { type: Number, required: true },
  stockNuevo:     { type: Number, required: true },
  nota:           { type: String, default: "", trim: true, maxlength: 200 },
  venta:          { type: mongoose.Schema.Types.ObjectId, ref: "Venta" },   // solo en tipo "venta"
  usuario:        { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  usuarioNombre:  { type: String, default: "" },               // copia: sobrevive si se elimina la cuenta
}, { timestamps: { createdAt: true, updatedAt: false } });

movimientoSchema.index({ producto: 1, createdAt: -1 });
movimientoSchema.index({ tipo: 1, createdAt: 1 });

export default mongoose.model("MovimientoStock", movimientoSchema);
