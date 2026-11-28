
import { LISTA_UNIDADES, DECIMALES_STOCK } from "../config/constantes.js";
import { ErrorHttp } from "./errores.js";

// Redondea un valor a la cantidad de decimales indicada.
export const redondear = (valor, decimales = 0) => {
  const factor = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * factor) / factor;
};

// Convierte a número solo si el valor realmente lo es.
export const leerNumero = (valor) => {
  if (typeof valor === "number") return valor;
  if (typeof valor === "string" && valor.trim() !== "") return Number(valor);
  return NaN;
};

// Valida que la cantidad corresponda a la unidad del producto.
export function exigirCantidadAdmitida(unidad, cantidad, nombre = "Producto") {
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    throw new ErrorHttp(400, `La cantidad de ${nombre} debe ser mayor que cero`);
  }

  if (LISTA_UNIDADES.includes(unidad)) {
    if (["unidades", "g", "ml", "trenzas"].includes(unidad) && !Number.isInteger(cantidad)) {
      throw new ErrorHttp(400, `${nombre} debe venderse en cantidades enteras de ${unidad}`);
    }

    if (
      ["kg", "L"].includes(unidad) &&
      redondear(cantidad, DECIMALES_STOCK) !== cantidad
    ) {
      throw new ErrorHttp(400, `La cantidad de ${nombre} admite máximo ${DECIMALES_STOCK} decimales`);
    }
  }
}
