import { ErrorHttp } from "./errores.js";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function limpiarCorreo(valor) {
  const correo = String(valor ?? "").trim().toLowerCase();
  if (!CORREO.test(correo) || correo.length > 254) {
    throw new ErrorHttp(400, "El correo electrónico no es válido");
  }
  return correo;
}

export function limpiarNombre(valor) {
  const nombre = String(valor ?? "").trim();
  if (nombre.length < 2 || nombre.length > 100) {
    throw new ErrorHttp(400, "El nombre debe tener entre 2 y 100 caracteres");
  }
  return nombre;
}

// bcrypt solo lee los primeros 72 bytes, por eso ese es el máximo
 export function validarPassword(valor, nombreCampo = "La contraseña", { correo = "", nombre = "" } = {}) {
  if (typeof valor !== "string" || valor.length < 8) {
    throw new ErrorHttp(400, `${nombreCampo} debe tener al menos 8 caracteres`);
  }
  if (Buffer.byteLength(valor) > 72) {
    throw new ErrorHttp(400, `${nombreCampo} es demasiado larga (máximo 72 caracteres)`);
  }
  const baja = valor.toLowerCase();
  const parteCorreo = String(correo).split("@")[0]?.toLowerCase() || "";
  if (parteCorreo.length >= 3 && baja.includes(parteCorreo)) {
    throw new ErrorHttp(400, `${nombreCampo} no puede contener tu correo`);
  }
  const parteNombre = String(nombre).trim().toLowerCase();
  if (parteNombre.length >= 3 && baja.includes(parteNombre)) {
    throw new ErrorHttp(400, `${nombreCampo} no puede contener tu nombre`);
  }
  return valor;
}

// Nombre corto de una foto en Cloudinary (public_id). Vacío = sin foto.
export function validarNombreImagen(valor) {
  const imagen = String(valor ?? "").trim();
  if (imagen && (!/^[\w\-./]{1,200}$/.test(imagen) || /\.\./.test(imagen))) {
    throw new ErrorHttp(400, "El nombre de la imagen no es válido");
  }
  return imagen;
}

// Se queda solo con los campos permitidos (evita que el cliente cambie campos internos)
export function seleccionar(origen, campos) {
  const resultado = {};
  for (const campo of campos) {
    if (origen[campo] !== undefined) resultado[campo] = origen[campo];
  }
  return resultado;
}
