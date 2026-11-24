import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const COSTO = 12;

export const hashearPassword = (password) => bcrypt.hash(password, COSTO);
export const compararPassword = (password, hash) => bcrypt.compare(password, hash);

// Hash falso para gastar el mismo tiempo cuando el correo no existe esto evita adivinar qué correos hay
export const HASH_FALSO = bcrypt.hashSync("contraseña-que-nadie-usa", COSTO);
// Contraseña temporal legible para entregar en persona
export const generarPasswordTemporal = () => crypto.randomBytes(9).toString("base64url");
// Compara dos textos en tiempo constante (para los códigos de registro)
export function textosIguales(a, b) {
  const hashA = crypto.createHash("sha256").update(String(a)).digest();
  const hashB = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}
