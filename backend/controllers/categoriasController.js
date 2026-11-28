import { crearCategoria, listarCategorias } from "../services/categoriaService.js";

// GET /api/categorias -> ["Lácteos", "Quesos",  (todos los roles)
export async function listar(req, res) {
  res.json(await listarCategorias());
}

// POST /api/categorias { nombre } -> { nombre }   (solo administrador)
export async function crear(req, res) {
  res.status(201).json({ nombre: await crearCategoria(req.body.nombre) });
}