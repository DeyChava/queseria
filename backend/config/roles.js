// Roles del sistema. Los mismos nombres los usa el frontend (admin, jefe, empleado).

export const ROL = Object.freeze({
  ADMIN: "admin",         // Administrador: acceso completo, usuarios y productos
  JEFE: "jefe",           // Jefe de inventario: existencias, entradas, salidas y reportes
  EMPLEADO: "empleado",   // Empleado: consulta de productos y registro de ventas
});

export const ROLES = Object.values(ROL);