import mongoose from "mongoose";

import { config } from "./env.js";

export async function conectarDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("No se pudo conectar a MongoDB:", error.message);
    process.exit(1);
  }

  // Crea los índices (por ejemplo, el del código único). Si alguno falla solo se avisa:
  // lo más común es que ya existan productos con códigos repetidos.
  await Promise.all(
    Object.values(mongoose.models).map((modelo) =>
      modelo.init().catch((error) =>
        console.warn(`Aviso: no se pudo crear un índice de ${modelo.modelName}: ${error.message}`)
      )
    )
  );
}