// Iconos de línea. Los del menú y de las categorías son los mismos trazados de tu diseño HTML.
// Cada valor es el contenido del <svg> (viewBox 0 0 24 24); se dibujan con <Icono nombre="..." />.
const trazo = (d) => `<path stroke-linecap="round" stroke-linejoin="round" d="${d}"></path>`

export const ICONOS = {
  marca: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="currentColor" stroke="none"/>',
  marcaLinea: trazo('M12 3v18m9-6-9 6-9-6'),
  catalogo: trazo('M4 6h16M4 10h16M4 14h16M4 18h16'),
  inventario: trazo('M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'),
  ventas: trazo('M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z'),
  reportes: trazo('M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m4 0V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v10M5 19V5a2 2 0 012-2h2a2 2 0 012 2v14'),
  // iconos de categoría (para las tarjetas sin fotografía)
  queso: trazo('M12 3v18m9-6-9 6-9-6m18-6L12 3 3 9'),
  reposteria: trazo('M12 8c-3.866 0-7 1.79-7 4s3.134 4 7 4 7-1.79 7-4-3.134-4-7-4zm0 0V4m-4 8v8m8-8v8'),
  helado: trazo('M12 2a4 4 0 00-4 4v3h8V6a4 4 0 00-4-4zm-4 7l4 13 4-13H8z'),
  escudo: trazo('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'),
  // acciones
  mas: trazo('M12 5v14M5 12h14'),
  menos: trazo('M5 12h14'),
  cerrar: trazo('M6 18L18 6M6 6l12 12'),
  editar: trazo('M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-1.5-9.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z'),
  papelera: trazo('M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'),
  check: trazo('M5 13l4 4L19 7'),
  alerta: trazo('M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'),
  imagen: trazo('M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'),
  menu: trazo('M4 6h16M4 12h16M4 18h16'),
  sol: trazo('M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'),
  luna: trazo('M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'),
  candado: trazo('M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'),
  descargar: trazo('M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3'),
  imprimir: trazo('M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z'),
  llave: trazo('M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4'),
  usuario: trazo('M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z'),
  salir: trazo('M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9'),
  subir: trazo('M7 17l9.2-9.2M17 17V7H7'),
  bajar: trazo('M7 7l9.2 9.2M17 7v10H7'),
  trofeo: trazo('M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3'),
}

// Icono de categoría para las tarjetas sin foto
export function iconoDeCategoria(categoria = '') {
  const c = categoria.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (/helad/.test(c)) return 'helado'
  if (/repost|pan|dulce/.test(c)) return 'reposteria'
  if (/tortill|acompa/.test(c)) return 'escudo'
  return 'queso'
}
