
import Usuario from "../models/Usuario.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generar token de autenticación
const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario._id,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h"
    }
  );
};

// Registrar usuario
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({
        mensaje: "Todos los campos obligatorios deben completarse"
      });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoNormalizado);

    if (!correoValido) {
      return res.status(400).json({
        mensaje: "El correo electrónico no es válido"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres"
      });
    }

    const existeUsuario = await Usuario.findOne({
      correo: correoNormalizado
    });

    if (existeUsuario) {
      return res.status(409).json({
        mensaje: "Este correo ya está registrado"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const nuevoUsuario = await Usuario.create({
      nombre,
      correo: correoNormalizado,
      password: passwordHash,
      rol
    });

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensaje: "Este correo ya está registrado"
      });
    }

    console.error("Error al registrar usuario:", error);

    return res.status(500).json({
      mensaje: "Error al registrar el usuario"
    });
  }
};

// Iniciar sesión
export const iniciarSesion = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: "Debes ingresar correo y contraseña"
      });
    }

    const usuario = await Usuario.findOne({
      correo: correo.trim().toLowerCase()
    }).select("+password");

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        mensaje: "Esta cuenta está desactivada"
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    const token = generarToken(usuario);

    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    return res.status(500).json({
      mensaje: "Error al iniciar sesión"
    });
  }
};

// Consultar estado de autenticación
export const consultarEstado = async (req, res) => {
  return res.status(200).json({
    autenticado: true,
    usuario: req.usuario
  });
};

// Obtener usuario conectado
export const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id)
      .select("-password");

    if (!usuario || !usuario.activo) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado o desactivado"
      });
    }

    return res.status(200).json({
      usuario
    });

  } catch (error) {
    console.error("Error al consultar usuario:", error);

    return res.status(500).json({
      mensaje: "Error al consultar el usuario"
    });
  }
};
