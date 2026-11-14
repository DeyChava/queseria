
import mongoose from "mongoose";

const detalleVentaSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  codigo: {
    type: String,
    default: ""
  },
  unidad: {
    type: String,
    default: "unidades"
  },
  cantidad: {
    type: Number,
    required: true,
    min: 0.001
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const ventaSchema = new mongoose.Schema({
  numero: {
    type: Number,
    unique: true,
    sparse: true
  },
  productos: {
    type: [detalleVentaSchema],
    required: true,
    validate: v => v.length > 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  descuento: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  metodoPago: {
    type: String,
    enum: [
      "efectivo",
      "sinpe",
      "tarjeta",
      "transferencia",
      "otro"
    ],
    default: "efectivo"
  },
  cliente: {
    type: String,
    default: "",
    trim: true
  },
  notas: {
    type: String,
    default: "",
    trim: true
  },
  estado: {
    type: String,
    enum: ["completada", "anulada"],
    default: "completada"
  }
}, { timestamps: true });

export default mongoose.model("Venta", ventaSchema);
