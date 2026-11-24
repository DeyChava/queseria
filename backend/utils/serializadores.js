// Usuario tal como lo espera el frontend (nunca incluye la contraseña)
export const usuarioPublico = (usuario) => ({
  _id: usuario._id,
  nombre: usuario.nombre,
  email: usuario.correo,
  rol: usuario.rol,
  foto: usuario.fotoPerfil || "",
  createdAt: usuario.createdAt,
});
