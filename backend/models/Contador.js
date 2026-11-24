import mongoose from "mongoose";

// esto son contadores atómicos (por ejemplo, el número consecutivo de cada venta)
const contadorSchema = new mongoose.Schema({
  _id:   { type: String },
  valor: { type: Number, default: 0 },
});

const Contador = mongoose.model("Contador", contadorSchema);

export async function siguienteNumero(nombre) {
  const contador = await Contador.findOneAndUpdate(
    { _id: nombre },
    { $inc: { valor: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return contador.valor;
}

export default Contador;