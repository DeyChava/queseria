import assert from "node:assert/strict";
import { test } from "node:test";
import "./preparar.js";
const { generarSecreto, reemplazarVariable, revisar } = await import("../scripts/revisarEnv.js");
test("reemplazarVariable actualiza o agrega variables sin dañar el resto del .env", () => {
  const base = "PORT=5000\nJWT_SECRET=viejo\n";
  assert.equal(reemplazarVariable(base, "JWT_SECRET", "nuevo"), "PORT=5000\nJWT_SECRET=nuevo\n");
  assert.equal(reemplazarVariable(base, "NUEVA", "123"), "PORT=5000\nJWT_SECRET=viejo\nNUEVA=123\n");
});
test("generarSecreto produce 96 caracteres hexadecimales seguros", () => {
  const s = generarSecreto();
  assert.equal(s.length, 96);
  assert.match(s, /^[0-9a-f]+$/);
});
test("revisar detecta variables faltantes, secretos débiles y URI correcta", () => {
  const envOk = [
    "MONGO_URI=mongodb+srv://user:pass@cluster0.mongodb.net/queseria?retryWrites=true",
    `JWT_SECRET=${generarSecreto()}`,
    "FRONTEND_URL=http://localhost:5173",
    "CLOUDINARY_CLOUD_NAME=demo",
    "CLOUDINARY_API_KEY=123",
    "CLOUDINARY_API_SECRET=abc",
  ].join("\n");
  const res = revisar(envOk);
  assert.equal(res.some((r) => r.estado === "falla"), false);
  const resMalo = revisar("MONGO_URI=invalida\nJWT_SECRET=corto\n");
  assert.equal(resMalo.some((r) => r.estado === "falla"), true);
});