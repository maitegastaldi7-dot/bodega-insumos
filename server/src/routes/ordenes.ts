// ⚠️ LEGACY (prototipo anterior): asume una tabla unificada "insumos" que
// NO existe en tu proyecto Supabase real (que usa botellas/tapones/tapas/...).
// Este archivo no está montado en index.ts. Se conserva como referencia.

import { Router } from "express";
import { z } from "zod";
import { supabase } from "../supabaseClient.js";
import { mapOrden } from "../lib/mappers.js";
import type { OrdenInsumoRow, OrdenProduccionRow } from "../types.js";

export const ordenesRouter = Router();

const lineaSchema = z.object({
  insumoId: z.string().uuid(),
  cantidadNecesaria: z.number().positive(),
});

const crearOrdenSchema = z.object({
  codigo: z.string().trim().min(1),
  producto: z.string().trim().min(1),
  cantidad: z.number().positive(),
  insumos: z.array(lineaSchema).min(1, "Agregá al menos un insumo a la orden."),
});

async function fetchOrdenCompleta(id: string) {
  const { data: orden } = await supabase.from("ordenes_produccion").select("*").eq("id", id).single();
  if (!orden) return null;
  const { data: lineas } = await supabase.from("orden_insumos").select("*").eq("orden_id", id);
  return mapOrden(orden as OrdenProduccionRow, (lineas ?? []) as OrdenInsumoRow[]);
}

/** GET /api/ordenes */
ordenesRouter.get("/", async (_req, res, next) => {
  try {
    const { data: ordenes, error } = await supabase
      .from("ordenes_produccion")
      .select("*")
      .order("fecha_creacion", { ascending: false });
    if (error) throw error;

    const ids = (ordenes ?? []).map((o) => o.id);
    const { data: lineas } = ids.length
      ? await supabase.from("orden_insumos").select("*").in("orden_id", ids)
      : { data: [] as OrdenInsumoRow[] };

    res.json((ordenes ?? []).map((o) => mapOrden(o as OrdenProduccionRow, (lineas ?? []) as OrdenInsumoRow[])));
  } catch (err) {
    next(err);
  }
});

/** POST /api/ordenes — crea la orden con todas sus líneas en estado Pendiente */
ordenesRouter.post("/", async (req, res, next) => {
  try {
    const body = crearOrdenSchema.parse(req.body);

    const { data: orden, error } = await supabase
      .from("ordenes_produccion")
      .insert({ codigo: body.codigo, producto: body.producto, cantidad: body.cantidad, estado: "pendiente" })
      .select("*")
      .single();
    if (error || !orden) throw error ?? new Error("No se pudo crear la orden.");

    await supabase.from("orden_insumos").insert(
      body.insumos.map((l) => ({
        orden_id: orden.id,
        insumo_id: l.insumoId,
        cantidad_necesaria: l.cantidadNecesaria,
        cantidad_entregada: 0,
        estado: "pendiente" as const,
      }))
    );

    const dto = await fetchOrdenCompleta(orden.id);
    res.status(201).json(dto);
  } catch (err) {
    next(err);
  }
});

/** GET /api/ordenes/:id */
ordenesRouter.get("/:id", async (req, res, next) => {
  try {
    const dto = await fetchOrdenCompleta(req.params.id);
    if (!dto) { res.status(404).json({ mensaje: "Orden no encontrada." }); return; }
    res.json(dto);
  } catch (err) {
    next(err);
  }
});
