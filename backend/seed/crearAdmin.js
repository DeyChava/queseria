// Crea (o repara) la cuenta de administrador con los datos de ADMIN_* del .env.
import mongoose from "mongoose";
import { conectarDB } from "../config/db.js";
import { config, exigirVariables } from "../config/env.js";
import { ROL } from "../config/roles.js";
import Usuario from "../models/Usuario.js";
import { hashearPassword } from "../utils/passwords.js";

async function crearAdministrador() {
  try {
    exigirVariables(["MONGO_URI", "ADMIN_NOMBRE", "ADMIN_CORREO", "ADMIN_PASSWORD"]);
    const { nombre, correo, password } = config.admin;

    if (password.length < 12) {
      throw new Error("ADMIN_PASSWORD debe tener al menos 12 caracteres");
    }

    await conectarDB();
    const correoNormalizado = correo.trim().toLowerCase();
    const existente = await Usuario.findOne({ correo: correoNormalizado });

    if (existente) {
      // No toca la contraseña: solo se asegura de que siga siendo administrador y esté activa
      await Usuario.updateOne({ _id: existente._id }, { $set: { rol: ROL.ADMIN, activo: true } });
      console.log("Ya existía esa cuenta: quedó como administrador y activa (no se cambió su contraseña).");
      return;
    }

    const admin = await Usuario.create({
      nombre: nombre.trim(),
      correo: correoNormalizado,
      password: await hashearPassword(password),
      rol: ROL.ADMIN,
    });
    console.log(`Administrador creado: ${admin.nombre} <${admin.correo}>`);
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

crearAdministrador();