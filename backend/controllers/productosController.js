
import mongoose from "mongoose";
import { LISTA_UNIDADES } from "../config/constantes.js";
import { resolverCategoria } from "../services/categoriaService.js";
import { exigirCantidadAdmitida } from "../utils/unidades.js";
import { borrarImagen } from "../config/cloudinary.js";
import MovimientoStock from "../models/MovimientoStock.js";
import Producto from "../models/Producto.js";
import { registrarMovimiento } from "../services/stockService.js";
import { ErrorHttp } from "../utils/errores.js";
import { leerNumero, redondear } from "../utils/numeros.js";
import { seleccionar } from "../utils/validaciones.js";

// Campos que el cliente puede mandar.
// El stock solo cambia mediante movimientos (POST /:id/stock).
const CAMPOS_EDITABLES = [
  "nombre",
  "descripcion",
  "codigo",
  "categoria",
  "proveedor",
  "unidad",
  "precioCompra",
  "precioVenta",
  "aplicaIva",
  "stockMinimo",
  "fechaCompra",
  "diasVida",
  "imagen",
];

const escaparRegex = (texto) =>
  texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function validarDatos(datos, { parcial, actual = null }) {
  // Validar nombre
  if (!parcial || datos.nombre !== undefined) {
    if (typeof datos.nombre !== "string" || !datos.nombre.trim()) {
      throw new ErrorHttp(400, "El nombre es obligatorio");
    }
  }

  // Validar precios
  for (const campo of ["precioCompra", "precioVenta"]) {
    if (parcial && datos[campo] === undefined) continue;

    const valor = leerNumero(datos[campo]);

    if (!Number.isFinite(valor) || valor < 0) {
      throw new ErrorHttp(
        400,
        "El precio de compra y el de venta son obligatorios y deben ser 0 o más"
      );
    }

    datos[campo] = valor;
  }

  // Validar unidad de medida
  if (datos.unidad !== undefined) {
    if (typeof datos.unidad !== "string") {
      throw new ErrorHttp(400, "La unidad debe ser un texto válido");
    }

    datos.unidad = datos.unidad.trim();

    if (
      !LISTA_UNIDADES.includes(datos.unidad) &&
      datos.unidad !== actual?.unidad
    ) {
      throw new ErrorHttp(
        400,
        `La unidad no es válida. Usa una de estas: ${LISTA_UNIDADES.join(", ")}`
      );
    }
  }

  // IVA: solamente acepta true o false
  if (
    datos.aplicaIva !== undefined &&
    typeof datos.aplicaIva !== "boolean"
  ) {
    throw new ErrorHttp(
      400,
      "El campo aplicaIva debe ser verdadero o falso"
    );
  }
}

async function exigirCodigoLibre(codigo, idActual) {
  const limpio = String(codigo ?? "").trim().toUpperCase();

  if (!limpio) return;

  const filtro = { codigo: limpio, activo: true };

  if (idActual) filtro._id = { $ne: idActual };

  if (await Producto.exists(filtro)) {
    throw new ErrorHttp(
      409,
      `Ya existe un producto activo con el código ${limpio}`
    );
  }
}

async function buscarProducto(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ErrorHttp(
      400,
      "El identificador del producto no es válido"
    );
  }

  const producto = await Producto.findOne({
    _id: id,
    activo: true,
  });

  if (!producto) {
    throw new ErrorHttp(404, "No existe ese producto");
  }

  return producto;
}

// GET /api/productos?buscar=&categoria=&bajoStock=true|false
export async function listarProductos(req, res) {
  const { buscar, categoria, bajoStock } = req.query;
  const filtro = { activo: true };

  if (buscar?.trim()) {
    const regex = {
      $regex: escaparRegex(buscar.trim()),
      $options: "i",
    };

    filtro.$or = [
      { nombre: regex },
      { codigo: regex },
      { descripcion: regex },
      { categoria: regex },
    ];
  }

  if (categoria?.trim()) {
    filtro.categoria = {
      $regex: `^${escaparRegex(categoria.trim())}$`,
      $options: "i",
    };
  }

  if (bajoStock === "true") {
    filtro.$expr = { $lte: ["$stock", "$stockMinimo"] };
  }

  if (bajoStock === "false") {
    filtro.$expr = { $gt: ["$stock", "$stockMinimo"] };
  }

  res.json(await Producto.find(filtro).sort({ nombre: 1 }));
}

// GET /api/productos/:id
export async function obtenerProducto(req, res) {
  res.json(await buscarProducto(req.params.id));
}

// POST /api/productos
export async function crearProducto(req, res) {
  const datos = seleccionar(req.body, CAMPOS_EDITABLES);

  validarDatos(datos, { parcial: false });

  datos.categoria = await resolverCategoria(datos.categoria);

  await exigirCodigoLibre(datos.codigo);

  const producto = await Producto.create({
    ...datos,
    stock: 0,
    creadoPor: req.usuario.nombre,
    actualizadoPor: req.usuario.nombre,
  });

  res.status(201).json(producto);
}

// PUT /api/productos/:id
export async function editarProducto(req, res) {
  const producto = await buscarProducto(req.params.id);
  const datos = seleccionar(req.body, CAMPOS_EDITABLES);

  validarDatos(datos, { parcial: true, actual: producto });

  if (datos.categoria !== undefined) {
    datos.categoria = await resolverCategoria(datos.categoria);
  }

  if (datos.codigo !== undefined) {
    await exigirCodigoLibre(datos.codigo, producto._id);
  }

  // No permitir cambiar la unidad si el producto tiene existencias
  // o movimientos registrados en el historial.
  if (datos.unidad !== undefined && datos.unidad !== producto.unidad) {
    if (
      producto.stock > 0 ||
      (await MovimientoStock.exists({ producto: producto._id }))
    ) {
      throw new ErrorHttp(
        409,
        "No se puede cambiar la unidad de un producto con existencias o movimientos. Crea un producto nuevo con la otra unidad"
      );
    }
  }

  const imagenAnterior = producto.imagen;

  producto.set({
    ...datos,
    actualizadoPor: req.usuario.nombre,
  });

  await producto.save();

  if (
    datos.imagen &&
    imagenAnterior &&
    datos.imagen !== imagenAnterior
  ) {
    await borrarImagen(imagenAnterior);
  }

  res.json(producto);
}

// DELETE /api/productos/:id
// Se desactiva para conservar las ventas y los reportes históricos.
export async function eliminarProducto(req, res) {
  const producto = await buscarProducto(req.params.id);
  const imagen = producto.imagen;

  producto.activo = false;
  producto.imagen = "";
  producto.actualizadoPor = req.usuario.nombre;

  await producto.save();

  await borrarImagen(imagen);

  res.json({
    mensaje: "Producto eliminado correctamente",
    id: producto._id,
  });
}

// POST /api/productos/:id/stock { delta, nota?, tipo? }
// delta > 0 suma (entrada).
// delta < 0 resta (salida).
// tipo "ajuste" se utiliza para correcciones de inventario.
export async function ajustarStock(req, res) {
  const delta = redondear(leerNumero(req.body.delta), 3);

  if (!Number.isFinite(delta) || delta === 0) {
    throw new ErrorHttp(
      400,
      "La cantidad debe ser un número distinto de cero"
    );
  }

  const tipo = req.body.tipo ?? (delta > 0 ? "entrada" : "salida");

  if (!["entrada", "salida", "ajuste"].includes(tipo)) {
    throw new ErrorHttp(400, "El tipo de movimiento no es válido");
  }

  if (tipo === "entrada" && delta < 0) {
    throw new ErrorHttp(400, "Una entrada debe sumar existencias");
  }

  if (tipo === "salida" && delta > 0) {
    throw new ErrorHttp(400, "Una salida debe restar existencias");
  }

  // Consultar el producto después de validar los datos básicos.
  const existente = await buscarProducto(req.params.id);

  exigirCantidadAdmitida(
    existente.unidad,
    delta,
    existente.nombre
  );

  const producto = await registrarMovimiento({
    productoId: req.params.id,
    delta,
    tipo,
    nota: String(req.body.nota ?? "").trim().slice(0, 200),
    usuario: req.usuario,
  });

  res.json(producto);
}

// GET /api/productos/:id/movimientos?limite=50
// Devuelve los movimientos más recientes primero.
export async function listarMovimientos(req, res) {
  const limite = Math.min(
    Math.max(Number(req.query.limite) || 50, 1),
    200
  );

  res.json(
    await MovimientoStock.find({
      producto: req.params.id,
    })
      .sort({ createdAt: -1 })
      .limit(limite)
  );
}
