// esta parte redondea a "decimales" posiciones (0 = colones enteros)
export const redondear = (valor, decimales = 0) => {
  const factor = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * factor) / factor;
};

// Convierte a número solo si el valor realmente lo es ("", null y texto dan NaN)
export const leerNumero = (valor) => {
  if (typeof valor === "number") return valor;
  if (typeof valor === "string" && valor.trim() !== "") return Number(valor);
  return NaN;
};
