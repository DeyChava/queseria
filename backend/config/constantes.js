// Reglas fijas del negocio. Si algo cambia (por ejemplo el IVA), se cambia solo aquí.

export const IVA = 0.13;                       // 13 % sobre el subtotal (los precios de venta van sin IVA)
export const DECIMALES_STOCK = 3;              // el stock admite decimales (12.5 kg)
export const ZONA_HORARIA = "America/Costa_Rica";
export const OFFSET_ZONA = "-06:00";           // Costa Rica no cambia de hora en el año
export const MAX_LINEAS_VENTA = 100;

// Unidades en que se puede vender un producto. "decimales": si se admiten cantidades como 2.5
// (kg y L sí; unidades, trenzas, g y ml se cuentan en números enteros).
export const UNIDADES = Object.freeze({
  unidades: { etiqueta: "Unidades", decimales: false },
  kg:       { etiqueta: "Kilogramos (kg)", decimales: true },
  g:        { etiqueta: "Gramos (g)", decimales: false },
  L:        { etiqueta: "Litros (L)", decimales: true },
  ml:       { etiqueta: "Mililitros (ml)", decimales: false },
  trenzas:  { etiqueta: "Trenzas", decimales: false },
});
export const LISTA_UNIDADES = Object.keys(UNIDADES);

export const CATEGORIA_POR_DEFECTO = "Sin categoria";
export const BASE_DE_DATOS = "queseria";   // nombre de la base cuando MONGO_URI no indica ninguna

