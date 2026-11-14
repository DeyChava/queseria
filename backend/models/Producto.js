import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({
  // --- Que es ---
  nombre:      { type: String, required: true, trim: true },
  descripcion: { type: String, default: "", trim: true },
  codigo:      { type: String, default: "", trim: true },
  categoria:   { type: String, default: "Sin categoria", trim: true },
  proveedor:   { type: String, default: "", trim: true },

  // --- Como se vende ---
  unidad: { type: String, default: "unidades" },   // "unidades" | "kg" | "trenzas"

  // --- Plata: colones enteros ---
  precioCompra: { type: Number, required: true, min: 0 },
  precioVenta:  { type: Number, required: true, min: 0 },

  // --- Existencias: admiten decimales (12.5 kg) ---
  stock:       { type: Number, default: 0, min: 0 },
  stockMinimo: { type: Number, default: 3, min: 0 },

  // --- Fechas propias del producto ---
  fechaCompra: { type: Date },                     // ultima vez que se compro
  diasVida:    { type: Number, default: 0, min: 0 }, // dura cuantos dias

  // --- Otros ---
  imagen:         { type: String,  default: "" },
  activo:         { type: Boolean, default: true },
  creadoPor:      { type: String,  default: "" },
  actualizadoPor: { type: String,  default: "" },
}, {
  timestamps: true,               // agrega createdAt y updatedAt solo
  toJSON:   { virtuals: true },   // que los calculados salgan en la respuesta
  toObject: { virtuals: true },
});

productoSchema.virtual("gananciaUnitaria").get(function () {
  return this.precioVenta - this.precioCompra;
});

productoSchema.virtual("margen").get(function () {
  if (!this.precioVenta) return 0;
  return Math.round(((this.precioVenta - this.precioCompra) / this.precioVenta) * 100);
});

productoSchema.virtual("valorAlCosto").get(function () {
  return Math.round(this.stock * this.precioCompra);
});

productoSchema.virtual("valorAlaVenta").get(function () {
  return Math.round(this.stock * this.precioVenta);
});

productoSchema.virtual("gananciaPotencial").get(function () {
  return this.valorAlaVenta - this.valorAlCosto;
});

productoSchema.virtual("bajoStock").get(function () {
  return this.stock <= this.stockMinimo;
});


export default mongoose.model("Producto", productoSchema);
