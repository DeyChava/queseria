import { rateLimit } from "express-rate-limit";

const crearLimitador = (limite, mensaje) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: limite,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: mensaje },
  });

// Frena los intentos repetidos de adivinar contraseñas o códigos
export const limitarLogin = crearLimitador(10, "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo");
export const limitarRegistro = crearLimitador(10, "Demasiados intentos de registro. Espera 15 minutos");
