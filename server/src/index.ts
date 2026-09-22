import cors from "cors";
import express from "express";
import { env } from "./env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { insumosRouter } from "./modules/insumos/insumos.routes.js";
// Rutas de la iteración anterior (prototipo con tabla unificada "insumos").
// Quedan DESACTIVADAS: esa tabla no existe en tu proyecto Supabase real, que
// usa una tabla por categoría (botellas, tapones, tapas, ...). Se dejan los
// archivos por si sirven de referencia al rediseñar recepciones/órdenes para
// que funcionen contra las 8 tablas reales.
// import { historialRouter } from "./routes/historial.js";
// import { ordenesRouter } from "./routes/ordenes.js";
// import { recepcionesRouter } from "./routes/recepciones.js";

const app = express();

app.use(cors({ origin: env.webOrigin }));
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, servicio: "bodega-insumos-api", supabaseUrl: env.supabaseUrl });
});

app.use("/api/insumos", insumosRouter);
// app.use("/api/recepciones", recepcionesRouter);
// app.use("/api/historial", historialRouter);
// app.use("/api/ordenes", ordenesRouter);

app.use((_req, res) => {
  res.status(404).json({ mensaje: "Recurso no encontrado." });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API de Bodega · Insumos escuchando en http://localhost:${env.port}`);
  console.log(`Conectada a Supabase: ${env.supabaseUrl}`);
});
