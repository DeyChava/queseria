import { LISTA_UNIDADES } from "../config/constantes.js";
import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({

  nombre:      { type: String, required: true, trim: true, maxlength: 120 },
  descripcion: { type: String, default: "", trim: true, maxlength: 500 },
  codigo:      { type: String, default: "", trim: true, uppercase: true, maxlength: 40 },   // SKU: lo escribe el admin; único entre productos activos
  categoria:   { type: String, default: "Sin categoria", trim: true },
  proveedor:   { type: String, default: "", trim: true },

  // --- Cómo se vende ---
  unidad: {
    type: String, default: "unidades", trim: true, maxlength: 30,
   // Solo se exige en productos NUEVOS. Los antiguos (con otra unidad) siguen editándose; al editar, el controlador
   // acepta la lista oficial o la unidad que el producto ya tenía.
    validate: {
      validator(valor) { return !this.isNew || LISTA_UNIDADES.includes(valor); },
     message: "La unidad no es válida",    },
  },   // "unidades" | "kg" | "trenzas"

  // --- Plata: colones ---
  precioCompra: { type: Number, required: true, min: 0 },   // costo
  precioVenta:  { type: Number, required: true, min: 0 },   // sin IVA
  aplicaIva:    { type: Boolean, default: true },    // false = este producto no lleva IVA

  // --- Existencias: admiten decimales (12.5 kg). Solo cambian con movimientos de stock ---
  stock:       { type: Number, default: 0, min: 0 },
  stockMinimo: { type: Number, default: 3, min: 0 },

  // --- Fechas propias del producto ---
  fechaCompra: { type: Date },
  diasVida:    { type: Number, default: 0, min: 0 },

  // --- Otros ---
  imagen:         { type: String,  default: "" },
  activo:         { type: Boolean, default: true },   // false = eliminado (se conserva para el historial de ventas)
  creadoPor:      { type: String,  default: "" },
  actualizadoPor: { type: String,  default: "" },
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
});

// El código no se puede repetir entre productos activos (los sin código no cuentan)
productoSchema.index(
  { codigo: 1 },
  { unique: true, partialFilterExpression: { activo: true, codigo: { $gt: "" } } }
);

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
