import express from "express";
import cors from "cors";
import dotenv from "dotenv";
 
dotenv.config();
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
app.get("/api/ping", (req, res) => {
  res.json({ mensaje: "El backend de la quesería está vivo" });
});
 
const PUERTO = process.env.PORT || 5000;
 
app.listen(PUERTO, () => {
  console.log("Servidor en http://localhost:" + PUERTO);
});
