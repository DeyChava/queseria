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
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
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

    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
