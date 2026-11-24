import app from "./app.js";
import { conectarDB } from "./config/db.js";
import { config, validarServidor } from "./config/env.js";

validarServidor();
await conectarDB();

app.listen(config.puerto, () => {
  console.log(`Servidor en http://localhost:${config.puerto}`);
});
