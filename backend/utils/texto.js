// Clave para comparar textos sin importar mayúsculas, tildes ni espacios de más: "  Lácteos " = "lacteos"
export const claveDeTexto = (texto) =>
  String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLowerCase();