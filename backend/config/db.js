import mongoose from "mongoose";
import { baseDeLaUri, baseElegida } from "./baseDeDatos.js";
import { config } from "./env.js";

export async function conectarDB() {
  try {
    // Si la cadena no trae el nombre de la base, se usa "queseria" (así los datos no caen en la base "test")
    await mongoose.connect(config.mongoUri, baseDeLaUri(config.mongoUri) ? {} : { dbName: baseElegida(config.mongoUri) });
    console.log(`Conectado a MongoDB (base de datos: ${mongoose.connection.name})`);
    if (mongoose.connection.name === "test") {
      console.warn('Aviso: estás usando la base "test". Cambia MONGO_URI para que termine en /queseria (ver backend/README.md, "Migrar la base de datos").');
    }
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