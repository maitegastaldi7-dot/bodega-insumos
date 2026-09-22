// ⚠️ LEGACY (prototipo anterior): asume una tabla unificada "insumos" que
// NO existe en tu proyecto Supabase real (que usa botellas/tapones/tapas/...).
// Este archivo no está montado en index.ts. Se conserva como referencia.

import { Router } from "express";
import { z } from "zod";
import { supabase } from "../supabaseClient.js";
import { mapMovimiento } from "../lib/mappers.js";
import type { OrdenInsumoRow } from "../types.js";

export const recepcionesRouter = Router();

const crearRecepcionSchema = z.object({
  insumoId: z.string().uuid(),
  cantidad: z.number().positive(),
  fotoUrl: z.string().url().optional().nullable(),
  usuario: z.string().trim().min(1),
  ordenId: z.string().uuid().optional().nullable(),
});

/** GET /api/recepciones — historial completo, más reciente primero */
recepcionesRouter.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from("recepciones").select("*").order("fecha", { ascending: false });
    if (error) throw error;
    res.json((data ?? []).map(mapMovimiento));
  } catch (err) {
    next(err);
  }
});

/** POST /api/recepciones — registra el ingreso, suma stock y, si viene
 * ligada a una orden de producción, actualiza esa línea. */
recepcionesRouter.post("/", async (req, res, next) => {
  try {
    const body = crearRecepcionSchema.parse(req.body);

    const { data: insumo } = await supabase.from("insumos").select("*").eq("id", body.insumoId).single();
    if (!insumo) { res.status(404).json({ mensaje: "Insumo no encontrado." }); return; }

    const stockNuevo = Number(insumo.stock_sistema) + body.cantidad;
    const recepcionNueva = (insumo.recepcion === null ? 0 : Number(insumo.recepcion)) + body.cantidad;

    const { error: updError } = await supabase
      .from("insumos")
      .update({ stock_sistema: stockNuevo, recepcion: recepcionNueva })
      .eq("id", body.insumoId);
    if (updError) throw updError;

    const { data: recepcion, error } = await supabase
      .from("recepciones")
      .insert({
        insumo_id: body.insumoId,
        cantidad: body.cantidad,
        foto_url: body.fotoUrl ?? null,
        usuario: body.usuario,
        orden_id: body.ordenId ?? null,
      })
      .select("*")
      .single();
    if (error || !recepcion) throw error ?? new Error("No se pudo registrar la recepción.");

    if (body.ordenId) {
      const { data: linea } = await supabase
        .from("orden_insumos")
        .select("*")
        .eq("orden_id", body.ordenId)
        .eq("insumo_id", body.insumoId)
        .maybeSingle();
      if (linea) {
        const entregadaNueva = Math.min(linea.cantidad_necesaria, Number(linea.cantidad_entregada) + body.cantidad);
        const faltante = linea.cantidad_necesaria - entregadaNueva;
        const estado: OrdenInsumoRow["estado"] = faltante <= 0 ? "abastecido" : stockNuevo < faltante ? "insuficiente" : "pendiente";
        await supabase.from("orden_insumos").update({ cantidad_entregada: entregadaNueva, estado }).eq("id", linea.id);

        const { data: todasLineas } = await supabase.from("orden_insumos").select("*").eq("orden_id", body.ordenId);
        const total = todasLineas?.length ?? 0;
        const abastecidas = (todasLineas ?? []).filter((l) => l.estado === "abastecido").length;
        const nuevoEstadoOrden = total > 0 && abastecidas === total ? "completada" : abastecidas > 0 ? "en_proceso" : "pendiente";
        await supabase.from("ordenes_produccion").update({ estado: nuevoEstadoOrden }).eq("id", body.ordenId);
      }
    }

    res.status(201).json(mapMovimiento(recepcion));
  } catch (err) {
    next(err);
  }
});
