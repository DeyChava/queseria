import { BASE_DE_DATOS } from "./constantes.js";
// Nombre de la base de datos que indica la cadena de conexión:  mongodb+srv://usuario:clave@cluster.mongodb.net/queseria?...
// Devuelve "" si la cadena no indica ninguna.
export function baseDeLaUri(uri = "") {
  const coincidencia = /^mongodb(?:\+srv)?:\/\/[^/?]+\/([^?]*)/.exec(uri.trim());
  return coincidencia ? decodeURIComponent(coincidencia[1]) : "";
}
// Base que usará el sistema: la de la cadena de conexión o, si no indica ninguna, "queseria" (nunca "test")
export const baseElegida = (uri) => baseDeLaUri(uri) || BASE_DE_DATOS;