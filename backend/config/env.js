import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Lee backend/.env sin importar desde qué carpeta se ejecute el servidor.
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });

const env = process.env;

export const config = {
  puerto: Number(env.PORT) || 5000,
  mongoUri: env.MONGO_URI,
  jwtSecret: env.JWT_SECRET,
  jwtExpira: env.JWT_EXPIRES_IN || "8h",
  frontendUrl: (env.FRONTEND_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean),
  confiarEnProxy: env.TRUST_PROXY === "true",
  cloudinary: {
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  },
  // Códigos que se piden al crear una cuenta (ver README del backend)
  codigosRegistro: {
    admin: env.CODIGO_ADMIN,
    jefe: env.CODIGO_JEFE,
    empleado: env.CODIGO_EMPLEADO,
  },
  admin: {
    nombre: env.ADMIN_NOMBRE,
    correo: env.ADMIN_CORREO,
    password: env.ADMIN_PASSWORD,
  },
};

// Detiene el arranque con un mensaje claro si falta algo del .env
export function exigirVariables(nombres) {
  const faltan = nombres.filter((nombre) => !env[nombre]?.trim());
  if (faltan.length) {
    console.error("Faltan variables en backend/.env: " + faltan.join(", "));
    console.error("Copia backend/.env.example a backend/.env y complétalo.");
    process.exit(1);
  }
}

export const VARIABLES_SERVIDOR = [
  "MONGO_URI",
  "JWT_SECRET",
  "FRONTEND_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

// Un JWT_SECRET es débil si es corto, de ejemplo ("cambiar", "secreto"...) o casi no varía ("aaaa...")
export function jwtSecretDebil(valor = "") {
  const texto = valor.trim();
  return (
    texto.length < 32 ||
    new Set(texto).size < 10 ||
    /^\d+$/.test(texto) ||
    tieneSecuencia(texto, 8) ||
    /cambia|ejemplo|secret|clave|password|changeme|tu[-_ ]?secreto/i.test(texto)
  );
}

// ¿Hay una racha de "largo" caracteres seguidos tipo 12345678 o abcdefgh (o al revés)?
function tieneSecuencia(texto, largo) {
  let subiendo = 1;
  let bajando = 1;
  for (let i = 1; i < texto.length; i++) {
    const diferencia = texto.charCodeAt(i) - texto.charCodeAt(i - 1);
    subiendo = diferencia === 1 ? subiendo + 1 : 1;
    bajando = diferencia === -1 ? bajando + 1 : 1;
    if (subiendo >= largo || bajando >= largo) return true;
  }
  return false;
}

export function validarServidor() {
  exigirVariables(VARIABLES_SERVIDOR);
  if (!/^mongodb(\+srv):\/\//.test(config.mongoUri.trim())) {
    console.error("MONGO_URI no es una cadena de conexión válida (debe empezar con mongodb:// o mongodb+srv://).");
    process.exit(1);
  }
  if (jwtSecretDebil(config.jwtSecret)) {
    console.error("JWT_SECRET es débil: usa al menos 32 caracteres aleatorios. Genera uno con:  npm run revisar:env -- --arreglar");
    process.exit(1);
  }
}