<<<<<<< HEAD
import Producto from "../models/Producto.js";
import { borrarImagen } from "../cloudinary.js";

// GET /api/productos  ->  devuelve la lista
export async function listarProductos(req, res) {
  try {
    const productos = await Producto.find({ activo: true }).sort({ nombre: 1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "No se pudo traer la lista" });
  }
}
// POST /api/productos  ->  guarda uno nuevo
export async function crearProducto(req, res) {
  try {
    const { nombre, precioCompra, precioVenta } = req.body;

    if (!nombre || precioCompra == null || precioVenta == null) {
      return res.status(400).json({
        error: "El nombre, el precio de compra y el precio de venta son obligatorios",
      });
    }

    const producto = await Producto.create(req.body);
=======
import mongoose from "mongoose";
import Producto from "../models/Producto.js";
import { borrarImagen } from "../cloudinary.js";

const escaparRegex = valor => valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/productos?buscar=...&categoria=...&bajoStock=true&incluirInactivos=true
export async function listarProductos(req, res) {
  try {
    const filtro = {};
    if (req.query.incluirInactivos !== "true") filtro.activo = true;
    if (req.query.buscar?.trim()) {
      const termino = escaparRegex(req.query.buscar.trim());
      filtro.$or = [
        { nombre: { $regex: termino, $options: "i" } },
        { codigo: { $regex: termino, $options: "i" } },
        { descripcion: { $regex: termino, $options: "i" } },
        { categoria: { $regex: termino, $options: "i" } },
      ];
    }
    if (req.query.categoria?.trim()) filtro.categoria = { $regex: `^${escaparRegex(req.query.categoria.trim())}$`, $options: "i" };
    if (req.query.bajoStock === "true") filtro.$expr = { $lte: ["$stock", "$stockMinimo"] };
    if (req.query.bajoStock === "false") filtro.$expr = { $gt: ["$stock", "$stockMinimo"] };

    const productos = await Producto.find(filtro).sort({ nombre: 1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "No se pudo traer la lista de productos" });
  }
}

// GET /api/productos/:id
export async function obtenerProducto(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Identificador de producto inválido" });
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ error: "No se encontró el producto" });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: "No se pudo consultar el producto" });
  }
}

// POST /api/productos
export async function crearProducto(req, res) {
  try {
    const { nombre, precioCompra, precioVenta, codigo } = req.body;
    if (!nombre?.trim() || precioCompra == null || precioVenta == null) {
      return res.status(400).json({ error: "El nombre, el precio de compra y el precio de venta son obligatorios" });
    }
    if (![precioCompra, precioVenta].every(v => Number.isFinite(Number(v)) && Number(v) >= 0)) {
      return res.status(400).json({ error: "Los precios deben ser números iguales o mayores que cero" });
    }
    if (codigo?.trim()) {
      const existente = await Producto.findOne({ codigo: codigo.trim(), activo: true });
      if (existente) return res.status(409).json({ error: "Ya existe un producto activo con ese código" });
    }
    const producto = await Producto.create({ ...req.body, nombre: nombre.trim() });
>>>>>>> 6326c845b05ad7531bfcc6e2b845d3dbf811b438
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
<<<<<<< HEAD
// PUT /api/productos/:id  ->  cambia los datos de uno
export async function editarProducto(req, res) {
  try {
    const anterior = await Producto.findById(req.params.id);
    if (!anterior) {
      return res.status(404).json({ error: "No existe ese queso" });
    }

    // Si mandaron una foto distinta, la vieja ya no le sirve a nadie
    if (req.body.imagen && anterior.imagen && req.body.imagen !== anterior.imagen) {
      await borrarImagen(anterior.imagen);
    }

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

=======

// PUT /api/productos/:id
export async function editarProducto(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Identificador de producto inválido" });
    const anterior = await Producto.findById(req.params.id);
    if (!anterior) return res.status(404).json({ error: "No existe ese producto" });

    if (req.body.codigo?.trim()) {
      const duplicado = await Producto.findOne({ codigo: req.body.codigo.trim(), _id: { $ne: anterior._id }, activo: true });
      if (duplicado) return res.status(409).json({ error: "Otro producto activo ya utiliza ese código" });
    }
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (req.body.imagen && anterior.imagen && req.body.imagen !== anterior.imagen) await borrarImagen(anterior.imagen);
>>>>>>> 6326c845b05ad7531bfcc6e2b845d3dbf811b438
    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

<<<<<<< HEAD
// DELETE /api/productos/:id  ->  lo borra de verdad, y borra su foto
export async function eliminarProducto(req, res) {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: "No existe ese queso" });
    }

    // Se borra el producto PRIMERO y la imagen despues. Al reves, si el
    // borrado fallara, el queso seguiria en el catalogo pero ya sin foto.
    const imagenABorrar = producto.imagen;
    await Producto.findByIdAndDelete(req.params.id);

    if (imagenABorrar) await borrarImagen(imagenABorrar);

    res.json({ mensaje: "Queso e imagen eliminados", id: req.params.id });
=======
// DELETE /api/productos/:id: desactiva el producto para conservar el historial de ventas.
export async function eliminarProducto(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Identificador de producto inválido" });
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ error: "No existe ese producto" });
    producto.activo = false;
    await producto.save();
    res.json({ mensaje: "Producto desactivado correctamente", id: req.params.id });
>>>>>>> 6326c845b05ad7531bfcc6e2b845d3dbf811b438
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
