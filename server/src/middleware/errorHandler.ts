import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { SupabaseQueryError } from "../modules/insumos/insumos.errors.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      mensaje: "Datos inválidos.",
      errores: err.issues.map((i) => ({ campo: i.path.join("."), mensaje: i.message })),
    });
    return;
  }

  if (err instanceof SupabaseQueryError) {
    console.error(`[Supabase:${err.categoria}]`, err.message, err.detalle ?? "");
    res.status(err.httpStatus).json({
      mensaje: err.message,
      categoria: err.categoria,
      detalle: err.detalle,
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Error interno del servidor.";
  console.error(err);
  res.status(500).json({ mensaje: message });
}
