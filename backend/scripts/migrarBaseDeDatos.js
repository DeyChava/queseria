
import mongoose from "mongoose";
import { pathToFileURL } from "node:url";
import { baseElegida } from "../config/baseDeDatos.js";
import { config, exigirVariables } from "../config/env.js";

const LOTE = 500;

async function copiarColeccion(origen, destino, nombre, ejecutar) {
  const cantidadOrigen = await origen.collection(nombre).countDocuments();
  const cantidadAntes = await destino.collection(nombre).countDocuments();

  if (!ejecutar) {
    return {
      nombre,
      cantidadOrigen,
      cantidadAntes,
      copiados: 0,
      verificado: null,
    };
  }

  let copiados = 0;
  const cursor = origen.collection(nombre).find();
  let lote = [];

  const volcar = async () => {
    if (!lote.length) return;

    try {
      const r = await destino.collection(nombre).insertMany(lote, {
        ordered: false,
      });
      copiados += r.insertedCount;
    } catch (error) {
      // Los documentos existentes con el mismo _id se omiten.
      const errores = error.writeErrors
        ? [].concat(error.writeErrors)
        : null;

      if (!errores || errores.some((e) => e.code !== 11000)) {
        throw error;
      }

      copiados +=
        error.insertedCount ??
        error.result?.insertedCount ??
        lote.length - errores.length;
    }

    lote = [];
  };

  for await (const documento of cursor) {
    lote.push(documento);
    if (lote.length >= LOTE) await volcar();
  }

  await volcar();

  // Verificar que todos los _id del origen existan en el destino.
  let faltantes = 0;
  const ids = origen.collection(nombre).find(
    {},
    { projection: { _id: 1 } }
  );

  let grupo = [];

  const comprobar = async () => {
    if (!grupo.length) return;

    faltantes +=
      grupo.length -
      (await destino.collection(nombre).countDocuments({
        _id: { $in: grupo },
      }));

    grupo = [];
  };

  for await (const { _id } of ids) {
    grupo.push(_id);
    if (grupo.length >= LOTE) await comprobar();
  }

  await comprobar();

  return {
    nombre,
    cantidadOrigen,
    cantidadAntes,
    copiados,
    verificado: faltantes === 0,
    faltantes,
  };
}

export async function migrar({ uri, dbOrigen, dbDestino, ejecutar }) {
  if (dbOrigen === dbDestino) {
    throw new Error(
      `El origen y el destino son la misma base ("${dbOrigen}")`
    );
  }

  const conexion = await mongoose.createConnection(uri).asPromise();

  try {
    const cliente = conexion.getClient();
    const origen = cliente.db(dbOrigen);
    const destino = cliente.db(dbDestino);

    const colecciones = (
      await origen.listCollections({ type: "collection" }).toArray()
    )
      .map((c) => c.name)
      .filter((n) => !n.startsWith("system."));

    const resultados = [];

    for (const nombre of colecciones) {
      resultados.push(
        await copiarColeccion(origen, destino, nombre, ejecutar)
      );
    }

    return resultados;
  } finally {
    await conexion.close();
  }
}

async function principal() {
  exigirVariables(["MONGO_URI"]);

  const ejecutar = process.argv.includes("--ejecutar");
  const dbOrigen = process.env.DB_ORIGEN || "test";
  const dbDestino = process.env.DB_DESTINO || baseElegida(config.mongoUri);

  console.log(
    `Origen: "${dbOrigen}" -> Destino: "${dbDestino}" (${ejecutar ? "COPIA REAL" : "simulación"})\n`
  );

  const resultados = await migrar({
    uri: config.mongoUri,
    dbOrigen,
    dbDestino,
    ejecutar,
  });

  if (!resultados.length) {
    console.log(`La base "${dbOrigen}" no tiene colecciones: no hay nada que migrar.`);
  }

  for (const r of resultados) {
    const detalle = ejecutar
      ? `copiados ${r.copiados}, ya existían ${r.cantidadOrigen - r.copiados} ${
          r.verificado ? "verificado" : `FALTAN ${r.faltantes}`
        }`
      : `${r.cantidadOrigen} documento(s) en el origen, ${r.cantidadAntes} en el destino`;

    console.log(`   ${r.nombre.padEnd(20)} ${detalle}`);
  }

  if (resultados.some((r) => r.verificado === false)) {
    console.error("\nHubo documentos sin copiar. NO borres la base de origen.");
    process.exitCode = 1;
    return;
  }

  console.log(
    ejecutar
      ? `\nListo. La base "${dbOrigen}" NO se tocó. Comprueba los datos de destino antes de considerar borrar el origen.`
      : "\nNo se cambió nada. Para copiar de verdad: npm run migrar:db -- --ejecutar"
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  principal().catch((error) => {
    console.error("Error:", error.message);
    process.exitCode = 1;
  });
}
