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

export function validarServidor() {
  exigirVariables(VARIABLES_SERVIDOR);
  if (config.jwtSecret.length < 32) {
    console.error("JWT_SECRET es muy corto: usa al menos 32 caracteres aleatorios.");
    process.exit(1);
  }
}
