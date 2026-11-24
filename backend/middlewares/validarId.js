import mongoose from "mongoose";
import { ErrorHttp } from "../utils/errores.js";

// Rechaza identificadores mal formados antes de consultar la base de datos
export function validarId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ErrorHttp(400, "El identificador indicado no es válido");
  }
  next();
}
