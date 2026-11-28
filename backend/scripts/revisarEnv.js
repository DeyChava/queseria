//revisa
//   npm run revisar:env                 -> solo revisa
//   npm run revisar:env -- --arreglar   -> además genera un JWT_SECRET seguro si falta o es débil
import crypto from "node:crypto";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { baseDeLaUri } from "../config/baseDeDatos.js";
import dotenv from "dotenv";
import { jwtSecretDebil, VARIABLES_SERVIDOR } from "../config/env.js";



const RAIZ_BACKEND = fileURLToPath(new URL("..", import.meta.url));
const RUTA_ENV = process.env.ENV_PATH || fileURLToPath(new URL("../.env", import.meta.url));

// Cambia (o agrega) NOMBRE=valor sin tocar las demás líneas ni sus saltos de línea
export function reemplazarVariable(contenido, nombre, valor) {
  const salto = contenido.includes("\r\n") ? "\r\n" : "\n";
  const patron = new RegExp(`^${nombre}=.*$`, "m");
  if (patron.test(contenido)) return contenido.replace(patron, `${nombre}=${valor}`);
  return contenido + (contenido.endsWith("\n") || !contenido ? "" : salto) + `${nombre}=${valor}${salto}`;
}

export const generarSecreto = () => crypto.randomBytes(48).toString("hex");   // 96 caracteres

// Devuelve la lista de resultados { estado: "ok" | "falla" | "aviso", texto }
export function revisar(contenido) {
  const variables = dotenv.parse(contenido);
  const resultados = [];
  const agregar = (estado, texto) => resultados.push({ estado, texto });

  for (const nombre of VARIABLES_SERVIDOR) {
    if (!variables[nombre]?.trim()) agregar("falla", `${nombre}: falta o está vacía`);
  }
  const uri = variables.MONGO_URI?.trim();
  if (uri) {
    if (!/^mongodb(\+srv)?:\/\//.test(uri)) agregar("falla", "MONGO_URI: no empieza con mongodb:// ni mongodb+srv://");
    else if (/[<>]/.test(uri)) agregar("falla", "MONGO_URI: todavía tiene el texto de ejemplo <password>");
    else if (!baseDeLaUri(uri)) agregar("aviso", "MONGO_URI: no indica la base de datos (se usará \"queseria\"). Agrega /queseria antes del ?");
    else if (baseDeLaUri(uri) === "test") agregar("aviso", 'MONGO_URI: usa la base "test". Cámbiala a /queseria (ver "Migrar la base de datos" en el README)');
    else agregar("ok", `MONGO_URI: correcta (base de datos: ${baseDeLaUri(uri)})`);
  }
  if (variables.JWT_SECRET?.trim()) {
    if (jwtSecretDebil(variables.JWT_SECRET)) agregar("falla", "JWT_SECRET: es débil (menos de 32 caracteres o de ejemplo)");
    else agregar("ok", `JWT_SECRET: seguro (${variables.JWT_SECRET.trim().length} caracteres)`);
  }
  if (variables.FRONTEND_URL?.trim() && /\/$/.test(variables.FRONTEND_URL.trim())) agregar("aviso", "FRONTEND_URL: quita la barra final (/)");
  for (const rol of ["CODIGO_ADMIN", "CODIGO_JEFE", "CODIGO_EMPLEADO"]) {
    if (!variables[rol]?.trim()) agregar("aviso", `${rol}: vacío (ese rol no se podrá registrar desde "Crear cuenta")`);
  }
  return resultados;
}

// ¿Está .env protegido por .gitignore y fuera de Git?
function revisarGit() {
  const resultados = [];
  const rutas = [RAIZ_BACKEND, fileURLToPath(new URL("../../", import.meta.url))];
  const ignorado = rutas.some((ruta) => {
    try { return /^\.env\s*$/m.test(fs.readFileSync(`${ruta}.gitignore`, "utf8")); } catch { return false; }
  });
  resultados.push(ignorado ? { estado: "ok", texto: ".gitignore: .env está ignorado (no se sube a GitHub)" } : { estado: "falla", texto: ".gitignore: falta la línea .env" });

  const git = spawnSync("git", ["ls-files", "--", ".env"], { cwd: RAIZ_BACKEND, encoding: "utf8" });
  if (git.status === 0 && git.stdout.trim()) resultados.push({ estado: "falla", texto: "Git: .env está SUBIDO al repositorio. Quítalo con: git rm --cached backend/.env y cambia todas sus claves" });
  return resultados;
}

function principal() {
  const arreglar = process.argv.includes("--arreglar");
  if (!fs.existsSync(RUTA_ENV)) {
    console.error("No existe backend/.env. Copia backend/.env.example a backend/.env y complétalo.");
    process.exit(1);
  }

  let contenido = fs.readFileSync(RUTA_ENV, "utf8");
  let resultados = [...revisar(contenido), ...revisarGit()];

  if (arreglar && resultados.some((r) => r.texto.startsWith("JWT_SECRET") && r.estado === "falla")) {
    fs.writeFileSync(`${RUTA_ENV}.copia`, contenido);   // copia de respaldo (ignorada por Git: .env.*)
    contenido = reemplazarVariable(contenido, "JWT_SECRET", generarSecreto());
    fs.writeFileSync(RUTA_ENV, contenido);
    console.log("JWT_SECRET renovado con un valor aleatorio de 96 caracteres (no se muestra). Respaldo anterior: .env.copia");
    console.log("Aviso: las sesiones abiertas se cerrarán. Reinicia el servidor.\n");
    resultados = [...revisar(contenido), ...revisarGit()];
  }

  const icono = { ok: "✔", aviso: "!", falla: "✘" };
  for (const r of resultados) console.log(`${icono[r.estado]} ${r.texto}`);
  const fallas = resultados.filter((r) => r.estado === "falla").length;
  console.log(fallas ? `\n${fallas} problema(s) por corregir.` : "\nTodo en orden.");
  process.exit(fallas ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) principal();