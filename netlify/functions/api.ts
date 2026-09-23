import serverless from "serverless-http";
import express from "express";
import cors from "cors";
import { env } from "../../server/src/env.js";
import { errorHandler } from "../../server/src/middleware/errorHandler.js";
import { insumosRouter } from "../../server/src/modules/insumos/insumos.routes.js";

const app = express();

app.use(
  cors({
    origin: true,
  })
);

app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    servicio: "bodega-insumos-api",
    supabaseUrl: env.supabaseUrl,
  });
});

app.use("/api/insumos", insumosRouter);

app.use((_req, res) => {
  res.status(404).json({
    mensaje: "Recurso no encontrado.",
  });
});

app.use(errorHandler);

export const handler = serverless(app);