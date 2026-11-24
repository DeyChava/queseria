import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config/env.js";
import { manejarErrores, rutaNoEncontrada } from "./middlewares/errores.js";
import rutas from "./routes/index.js";

const app = express();

if (config.confiarEnProxy) app.set("trust proxy", 1);   

app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,                            
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => { req.body ??= {}; next(); });   

app.use("/api", rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
