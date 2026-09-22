// ⚠️ LEGACY (prototipo anterior): asume una tabla unificada "insumos" que
// NO existe en tu proyecto Supabase real (que usa botellas/tapones/tapas/...).
// Este archivo no está montado en index.ts. Se conserva como referencia.

import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { mapMovimiento } from "../lib/mappers.js";

export const historialRouter = Router();

/** GET /api/historial?insumoId=&tipo= — usa la vista v_historial_movimientos
 * (unión de recepciones + auditoría) para traer todo en un solo listado. */
historialRouter.get("/", async (req, res, next) => {
  try {
    let query = supabase.from("v_historial_movimientos").select("*").order("fecha", { ascending: false });

    const insumoId = req.query.insumoId as string | undefined;
    if (insumoId) query = query.eq("insumo_id", insumoId);

    const tipo = req.query.tipo as string | undefined;
    if (tipo && tipo !== "Todos") query = query.eq("tipo", tipo);

    const { data, error } = await query.limit(500);
    if (error) throw error;
    res.json((data ?? []).map(mapMovimiento));
  } catch (err) {
    next(err);
  }
});
