
import { UNIDADES } from "../config/constantes.js";
import { ErrorHttp } from "./errores.js";

// Comprueba si una unidad admite cantidades decimales.
export const cantidadAdmitida = (unidad, cantidad) =>
  UNIDADES[unidad]?.decimales !== false || Number.isInteger(cantidad);

// Lanza un error 400 si la cantidad no corresponde a la unidad.
export function exigirCantidadAdmitida(
  unidad,
  cantidad,
  nombreProducto = "el producto"
) {
  if (!cantidadAdmitida(unidad, cantidad)) {
    throw new ErrorHttp(
      400,
      `Las cantidades de ${nombreProducto} (${unidad}) deben ser números enteros`
    );
  }
}
