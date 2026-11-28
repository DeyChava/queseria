
import mongoose from "mongoose";

import { config } from "./env.js";
import { baseDeLaUri, baseElegida } from "./baseDeDatos.js";

export async function conectarDB() {
  try {
    // Si la URI no indica una base de datos, utiliza "queseria".
    await mongoose.connect(
      config.mongoUri,
      baseDeLaUri(config.mongoUri)
        ? {}
        : { dbName: baseElegida(config.mongoUri) }
    );

    console.log(`Conectado a MongoDB (base de datos: ${mongoose.connection.name})`);

    if (mongoose.connection.name === "test") {
      console.warn(
        'Aviso: estás usando la base "test". Cambia MONGO_URI para que termine en /queseria.'
      );
    }
  } catch (error) {
    console.error("No se pudo conectar a MongoDB:", error.message);
    process.exit(1);
  }

  // Crea los índices.
  await Promise.all(
    Object.values(mongoose.models).map((modelo) =>
      modelo.init().catch((error) =>
        console.warn(
          `Aviso: no se pudo crear un índice de ${modelo.modelName}: ${error.message}`
        )
      )
    )
  );
}
