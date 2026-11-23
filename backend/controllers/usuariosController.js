
import Usuario, { ROLES } from "../models/Usuario.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { subirImagen, borrarImagen } from "../cloudinary.js";

// Consultar lista de usuarios
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ usuarios });

  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return res.status(500).json({
      mensaje: "Error al consultar los usuarios"
    });
  }
};

// Editar nombre y fotografía del perfil propio
export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (nombre !== undefined && !nombre.trim()) {
      return res.status(400).json({
        mensaje: "El nombre no puede estar vacío"
      });
    }

    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    if (nombre !== undefined) {
      usuario.nombre = nombre.trim();
    }

    if (req.file) {
      const fotoAnterior = usuario.fotoPerfil;
      const nuevaFoto = await subirImagen(req.file);

      usuario.fotoPerfil = nuevaFoto;

      if (fotoAnterior) {
        await borrarImagen(fotoAnterior);
      }
    }

    await usuario.save();

    return res.status(200).json({
      mensaje: "Perfil actualizado correctamente",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        fotoPerfil: usuario.fotoPerfil
      }
    });

  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return res.status(500).json({
      mensaje: "Error al actualizar el perfil"
    });
  }
};

// Cambiar contraseña propia
export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        mensaje: "Debes ingresar la contraseña actual y la nueva"
      });
    }

    if (passwordNueva.length < 8) {
      return res.status(400).json({
        mensaje: "La nueva contraseña debe tener al menos 8 caracteres"
      });
    }

    const usuario = await Usuario.findById(req.usuario.id)
      .select("+password");

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      passwordActual,
      usuario.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "La contraseña actual es incorrecta"
      });
    }

    usuario.password = await bcrypt.hash(passwordNueva, 12);
    await usuario.save();

    return res.status(200).json({
      mensaje: "Contraseña actualizada correctamente"
    });

  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({
      mensaje: "Error al cambiar la contraseña"
    });
  }
};

// Eliminar la propia cuenta
export const eliminarMiCuenta = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        mensaje: "Debes ingresar tu contraseña para eliminar la cuenta"
      });
    }

    const usuario = await Usuario.findById(req.usuario.id)
      .select("+password");

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "La contraseña es incorrecta"
      });
    }

    if (usuario.fotoPerfil) {
      await borrarImagen(usuario.fotoPerfil);
    }

    await usuario.deleteOne();

    return res.status(200).json({
      mensaje: "Tu cuenta fue eliminada correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
    return res.status(500).json({
      mensaje: "Error al eliminar la cuenta"
    });
  }
};

// Cambiar el rol de otro usuario
export const cambiarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!ROLES.includes(rol)) {
      return res.status(400).json({
        mensaje: "El rol indicado no es válido"
      });
    }

    if (id === req.usuario.id) {
      return res.status(400).json({
        mensaje: "No puedes cambiar tu propio rol"
      });
    }

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    usuario.rol = rol;
    await usuario.save();

    return res.status(200).json({
      mensaje: "Rol actualizado correctamente",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error("Error al cambiar rol:", error);
    return res.status(500).json({
      mensaje: "Error al cambiar el rol"
    });
  }
};

// Restablecer contraseña de otro usuario
export const restablecerPassword = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.usuario.id) {
      return res.status(400).json({
        mensaje: "Utiliza la opción de cambiar tu propia contraseña"
      });
    }

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    const passwordTemporal = crypto.randomBytes(12).toString("base64url");

    usuario.password = await bcrypt.hash(passwordTemporal, 12);
    await usuario.save();

    return res.status(200).json({
      mensaje: "Contraseña restablecida correctamente",
      passwordTemporal
    });

  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    return res.status(500).json({
      mensaje: "Error al restablecer la contraseña"
    });
  }
};

// Eliminar otro usuario
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.usuario.id) {
      return res.status(400).json({
        mensaje: "Para eliminar tu cuenta utiliza la opción de perfil propio"
      });
    }

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    if (usuario.fotoPerfil) {
      await borrarImagen(usuario.fotoPerfil);
    }

    await usuario.deleteOne();

    return res.status(200).json({
      mensaje: "Usuario eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({
      mensaje: "Error al eliminar el usuario"
    });
  }
};
