const { claveDeTexto } = await import("../utils/texto.js");
const { limpiarCategoria } = await import("../services/categoriaService.js");
const { baseDeLaUri, baseElegida } = await import("../config/baseDeDatos.js");
test("jwtSecretDebil rechaza secretos cortos, repetidos, secuenciales o de ejemplo", () => {
  assert.equal(jwtSecretDebil("corto"), true);
  assert.equal(jwtSecretDebil("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"), true);
  assert.equal(jwtSecretDebil("12345678901234567890123456789012"), true);
  assert.equal(jwtSecretDebil("mi-clave-secreta-super-larga-para-pruebas"), true);
  assert.equal(jwtSecretDebil("9f8e7d6c5b4a392817263544536271809f8e7d6c5b4a3928"), false);
});
test("unidades enteras rechazan decimales y kg/L los admiten", () => {
  assert.equal(cantidadAdmitida("kg", 1.5), true);
  assert.equal(cantidadAdmitida("L", 0.25), true);
  assert.equal(cantidadAdmitida("unidades", 3), true);
  assert.equal(cantidadAdmitida("unidades", 1.5), false);
  assert.equal(cantidadAdmitida("trenzas", 2.5), false);
  assert.equal(cantidadAdmitida("g", 100.5), false);
  assert.equal(cantidadAdmitida("ml", 250.5), false);
  assert.throws(() => exigirCantidadAdmitida("trenzas", 2.5, "Queso"), (e) => e.status === 400);
});
test("claveDeTexto y limpiarCategoria normalizan sin duplicar por tildes o mayúsculas", () => {
  assert.equal(claveDeTexto("  Lácteos  "), "lacteos");
  assert.equal(claveDeTexto("LACTEOS"), "lacteos");
  assert.equal(limpiarCategoria("  Quesos   frescos "), "Quesos frescos");
  assert.throws(() => limpiarCategoria("   "), (e) => e.status === 400);
  assert.throws(() => limpiarCategoria("<script>"), (e) => e.status === 400);
});
test("baseDeLaUri y baseElegida usan queseria cuando la URI no indica base", () => {
  assert.equal(baseDeLaUri("mongodb+srv://u:p@cluster.mongodb.net/queseria?retryWrites=true"), "queseria");
  assert.equal(baseDeLaUri("mongodb+srv://u:p@cluster.mongodb.net/?retryWrites=true"), "");
  assert.equal(baseElegida("mongodb+srv://u:p@cluster.mongodb.net/?retryWrites=true"), "queseria");
  assert.equal(baseElegida("mongodb://localhost:27017/otra"), "otra");
});