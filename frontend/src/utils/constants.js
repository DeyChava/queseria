// Valores fijos de la aplicación. Si el negocio cambia una regla, se cambia aquí.

export const IVA = 0.13 // el punto de venta suma el 13 % sobre el subtotal (el servidor usa el mismo valor)

// Categorías que ofrece el formulario. En el backend "categoria" es texto libre,
// así que los filtros del catálogo se arman con las categorías que realmente existan en los datos.
export const CATEGORIAS_SUGERIDAS = ['Quesos', 'Lácteos', 'Repostería', 'Pan', 'Helados', 'Tortillas']

export const UNIDADES = [
  'unidades',
  'kg',
  'g',
  'L',
  'ml',
  'trenzas',
]

export const ETIQUETA_UNIDAD = {
  unidades: 'Unidades',
  kg: 'Kilogramos (kg)',
  g: 'Gramos (g)',
  L: 'Litros (L)',
  ml: 'Mililitros (ml)',
  trenzas: 'Trenzas',
}

// Unidades que solamente admiten cantidades enteras.
// kg y L permiten decimales.
export const UNIDADES_ENTERAS = ['unidades', 'g', 'ml', 'trenzas']

export const ROLES = { admin: 'Administrador', jefe: 'Jefe de inventario', empleado: 'Empleado' }

// Qué módulos puede abrir cada rol (con la extensión del backend). Sin la extensión no hay roles y se ve todo.
export const PERMISOS = {
  admin: ['catalogo', 'inventario', 'ventas', 'reportes', 'usuarios', 'perfil'],
  jefe: ['catalogo', 'inventario', 'ventas', 'reportes', 'perfil'],
  empleado: ['catalogo', 'ventas', 'perfil'],
}

// Estado del stock según el stockMinimo de CADA producto:
//   crítico: stock <= stockMinimo (igual que "bajoStock" del backend) · bajo: hasta 2 veces el mínimo · normal: más
export const FACTOR_STOCK_BAJO = 2
export const DIAS_AVISO_VENCIMIENTO = 3

// Rotación mensual = unidades vendidas ÷ unidades ingresadas del mes
export const ROTACION_ALTA = 0.6   // desde 60 % = alta
export const ROTACION_MEDIA = 0.3  // de 30 a 59 % = media; menos de 30 % = baja
