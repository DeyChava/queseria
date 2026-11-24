
import mongoose from "mongoose";

// Cada línea guarda el precio y el costo del momento: si después se edita el producto, la venta no cambia.
const lineaSchema = new mongoose.Schema({
  producto:       { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
  nombre:         { type: String, required: true },
  codigo:         { type: String, default: "" },
  unidad:         { type: String, default: "unidades" },
  cantidad:       { type: Number, required: true, min: 0.001 },
  precioUnitario: { type: Number, required: true, min: 0 },   // precio de venta sin IVA
  costoUnitario:  { type: Number, required: true, min: 0 },   // precio de compra
  subtotal:       { type: Number, required: true, min: 0 },   // precioUnitario × cantidad
  costo:          { type: Number, required: true, min: 0 },   // costoUnitario × cantidad
}, { _id: false });

const ventaSchema = new mongoose.Schema({
  numero:        { type: Number, required: true, unique: true },   // consecutivo del ticket
  productos:     { type: [lineaSchema], validate: (lineas) => lineas.length > 0 },
  subtotal:      { type: Number, required: true, min: 0 },         // sin IVA
  iva:           { type: Number, required: true, min: 0 },
  total:         { type: Number, required: true, min: 0 },         // subtotal + IVA
  costoTotal:    { type: Number, required: true, min: 0 },
  ganancia:      { type: Number, required: true },                 // subtotal − costoTotal (el IVA no es ganancia)
  recibido:      { type: Number, required: true, min: 0 },
  vuelto:        { type: Number, required: true, min: 0 },
  usuario:       { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  usuarioNombre: { type: String, default: "" },                    // copia: sobrevive si se elimina la cuenta
}, { timestamps: true });

ventaSchema.index({ createdAt: -1 });
ventaSchema.index({ usuario: 1, createdAt: -1 });

export default mongoose.model("Venta", ventaSchema);