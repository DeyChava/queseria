import { OFFSET_ZONA, ZONA_HORARIA } from "../config/constantes.js";
import { ErrorHttp } from "./errores.js";

const FORMATO_MES = /^(\d{4})-(0[1-9]|1[0-2])$/;
const FORMATO_DIA = /^\d{4}-\d{2}-\d{2}$/;
const MS_DIA = 24 * 60 * 60 * 1000;

// Los meses y los días se cuentan con la hora de Costa Rica: una venta de las 8 p. m. no debe caer
// en el día (ni el mes) siguiente solo porque en UTC ya cambió la fecha.

export function mesActual() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA, year: "numeric", month: "2-digit",
  }).formatToParts(new Date());
  const valor = (tipo) => partes.find((p) => p.type === tipo).value;
  return `${valor("year")}-${valor("month")}`;
}

export function validarMes(mes) {
  if (!FORMATO_MES.test(mes ?? "")) {
    throw new ErrorHttp(400, "El mes debe tener el formato AAAA-MM (por ejemplo 2026-11)");
  }
  return mes;
}

// asi se veria "2026-11" + 1 -> "2026-12" · "2026-01" - 1 -> "2025-12"
export function sumarMeses(mes, cantidad) {
  const [anio, numero] = mes.split("-").map(Number);
  const total = anio * 12 + (numero - 1) + cantidad;
  const nuevoAnio = Math.floor(total / 12);
  const nuevoMes = (total % 12) + 1;
  return `${nuevoAnio}-${String(nuevoMes).padStart(2, "0")}`;
}

const inicioDelDia = (fecha) => new Date(`${fecha}T00:00:00${OFFSET_ZONA}`);

// { desde, hasta }: desde incluido, hasta excluido
export function rangoDelMes(mes) {
  return { desde: inicioDelDia(`${mes}-01`), hasta: inicioDelDia(`${sumarMeses(mes, 1)}-01`) };
}

export function rangoDelDia(fecha) {
  if (!FORMATO_DIA.test(fecha ?? "")) {
    throw new ErrorHttp(400, "La fecha debe tener el formato AAAA-MM-DD");
  }
  const desde = inicioDelDia(fecha);
  if (Number.isNaN(desde.getTime())) throw new ErrorHttp(400, "La fecha indicada no existe");
  // Detecta días inexistentes como 2026-02-31
  const ida = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(desde);
  if (ida !== fecha) throw new ErrorHttp(400, "La fecha indicada no existe");
  return { desde, hasta: new Date(desde.getTime() + MS_DIA) };
}
