
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import Usuario from "../models/Usuario.js";
import { conectarDB } from "../db.js";

dotenv.config();

async function crearAdministrador() {
  try {
    const { ADMIN_NOMBRE, ADMIN_CORREO, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NOMBRE || !ADMIN_CORREO || !ADMIN_PASSWORD) {
      throw new Error(
        "Debes configurar ADMIN_NOMBRE, ADMIN_CORREO y ADMIN_PASSWORD en .env"
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error(
        "La contraseña del administrador debe tener al menos 12 caracteres"
      );
    }

    await conectarDB();

    const correo = ADMIN_CORREO.trim().toLowerCase();

    const existe = await Usuario.findOne({ correo });

    if (existe) {
      console.log("Ya existe un usuario con ese correo.");
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const administrador = await Usuario.create({
      nombre: ADMIN_NOMBRE.trim(),
      correo,
      password: passwordHash,
      rol: "administrador",
      activo: true
    });

    console.log("Administrador creado correctamente.");
    console.log("Nombre:", administrador.nombre);
    console.log("Correo:", administrador.correo);
    console.log("Rol:", administrador.rol);

  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
}

crearAdministrador();
