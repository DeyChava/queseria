import { CATEGORIA_POR_DEFECTO } from "../config/constantes.js";
import Categoria from "../models/Categoria.js";
import Producto from "../models/Producto.js";
import { ErrorHttp } from "../utils/errores.js";
import { claveDeTexto } from "../utils/texto.js";


export function limpiarCategoria(valor) {
  if (typeof valor !== "string") throw new ErrorHttp(400, "Escribe el nombre de la categoría");
  const nombre = valor.replace(/\s+/g, " ").trim();
  if (!nombre) throw new ErrorHttp(400, "Escribe el nombre de la categoría");
  if (nombre.length > 60) throw new ErrorHttp(400, "El nombre de la categoría admite máximo 60 caracteres");
  if (/[\u0000-\u001f<>]/.test(nombre)) throw new ErrorHttp(400, "El nombre de la categoría tiene caracteres no permitidos");
  return nombre;
}


export async function listarCategorias() {
  const [registradas, usadas] = await Promise.all([
    Categoria.find().lean(),
    Producto.distinct("categoria", { activo: true }),
  ]);
  const porClave = new Map();
  for (const nombre of [...usadas, ...registradas.map((c) => c.nombre)]) {
    if (typeof nombre === "string" && nombre.trim() && !porClave.has(claveDeTexto(nombre))) {
      porClave.set(claveDeTexto(nombre), nombre.trim());
    }
  }
  
  for (const c of registradas) porClave.set(claveDeTexto(c.nombre), c.nombre);
  return [...porClave.values()].sort((a, b) => a.localeCompare(b, "es"));
}


export async function crearCategoria(valor) {
  const nombre = limpiarCategoria(valor);
  const clave = claveDeTexto(nombre);
  const existente = (await listarCategorias()).find((c) => claveDeTexto(c) === clave);
  if (existente) throw new ErrorHttp(409, `La categoría "${existente}" ya existe`);
  try {
    await Categoria.create({ nombre, clave });
  } catch (error) {
    if (error.code === 11000) throw new ErrorHttp(409, `La categoría "${nombre}" ya existe`);
    throw error;
  }
  return nombre;
}

export async function resolverCategoria(valor) {
  if (valor === undefined) return undefined;
  if (typeof valor === "string" && !valor.trim()) return CATEGORIA_POR_DEFECTO;
  const nombre = limpiarCategoria(valor);
  const clave = claveDeTexto(nombre);
  if (clave === claveDeTexto(CATEGORIA_POR_DEFECTO)) return CATEGORIA_POR_DEFECTO;
  const existente = (await listarCategorias()).find((c) => claveDeTexto(c) === clave);
  if (existente) return existente;
  try {
    await Categoria.updateOne({ clave }, { $setOnInsert: { nombre, clave } }, { upsert: true });
  } catch (error) {
    if (error.code === 11000) {
      const registrada = await Categoria.findOne({ clave }).lean();
      if (registrada) return registrada.nombre;
    }
    throw error;
  }
  return nombre;
}