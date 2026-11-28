
import { BASE_DE_DATOS } from "./constantes.js";

// Obtiene el nombre de la base de datos indicada en la URI.
export function baseDeLaUri(uri = "") {
  const coincidencia = /^mongodb(?:\+srv)?:\/\/[^/?]+\/([^?]*)/.exec(
    uri.trim()
  );

  return coincidencia ? decodeURIComponent(coincidencia[1]) : "";
}

// Si la URI no indica una base de datos, utiliza "queseria".
export const baseElegida = (uri) =>
  baseDeLaUri(uri) || BASE_DE_DATOS;
