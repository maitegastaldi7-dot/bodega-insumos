// ⚠️ LEGACY (prototipo anterior): asume una tabla unificada "insumos" que
// NO existe en tu proyecto Supabase real (que usa botellas/tapones/tapas/...).
// Este archivo no está montado en index.ts. Se conserva como referencia.

import { Router } from "express";
import { z } from "zod";
import { supabase } from "../supabaseClient.js";
import { mapInsumo } from "../lib/mappers.js";
import { normalizeCode } from "../lib/codes.js";
import type { InsumoProveedorRow, InsumoRow } from "../types.js";

export const insumosRouter = Router();

const CATEGORIAS = [
  "Botellas", "Tapones", "Tapas", "Cápsulas", "Etiquetas", "Contraetiqueta", "Cajas", "Separadores",
] as const;

const proveedorSchema = z.object({
  nombre: z.string().trim().optional().nullable(),
  codigo: z.string().trim().optional().nullable(),
});

const crearInsumoSchema = z.object({
  categoria: z.enum(CATEGORIAS),
  descripcion: z.string().trim().min(1),
  codigoInterno: z.string().trim().min(1),
  codigoBarras: z.string().trim().min(1).optional().nullable(),
  codigoBusqueda: z.string().trim().min(1).optional().nullable(),
  tipo: z.string().trim().min(1).optional().nullable(),
  color: z.string().trim().min(1).optional().nullable(),
  dimensiones: z.string().trim().min(1).optional().nullable(),
  proveedores: z.array(proveedorSchema).default([]),
  stockSistema: z.number().default(0),
  stockPiso: z.number().optional().nullable(),
  stockMinimo: z.number().optional().nullable(),
  usuario: z.string().trim().min(1),
  motivo: z.string().trim().optional(),
});

const editarInsumoSchema = crearInsumoSchema
  .omit({ stockSistema: true, stockPiso: true })
  .extend({
    stockMinimo: z.number().optional().nullable(),
    motivo: z.string().trim().min(1, "El motivo es obligatorio para editar un insumo."),
  });

const ajusteStockSchema = z.object({
  nuevoValor: z.number(),
  motivo: z.string().trim().min(1, "El motivo es obligatorio para ajustar stock."),
  usuario: z.string().trim().min(1),
});

const bajaAltaSchema = z.object({
  motivo: z.string().trim().min(1, "El motivo es obligatorio."),
  usuario: z.string().trim().min(1),
});

async function fetchInsumoConProveedores(id: string) {
  const { data: insumo, error } = await supabase.from("insumos").select("*").eq("id", id).single();
  if (error || !insumo) return null;
  const { data: proveedores } = await supabase.from("insumo_proveedores").select("*").eq("insumo_id", id);
  return mapInsumo(insumo as InsumoRow, (proveedores ?? []) as InsumoProveedorRow[]);
}

/** GET /api/insumos?activo=true|false|todos&categoria=&q= */
insumosRouter.get("/", async (req, res, next) => {
  try {
    let query = supabase.from("insumos").select("*").order("descripcion", { ascending: true });

    const activo = req.query.activo as string | undefined;
    if (activo === "true") query = query.eq("activo", true);
    if (activo === "false") query = query.eq("activo", false);

    const categoria = req.query.categoria as string | undefined;
    if (categoria && categoria !== "Todas") query = query.eq("categoria", categoria);

    const q = (req.query.q as string | undefined)?.trim();
    if (q) query = query.or(`descripcion.ilike.%${q}%,codigo_interno.ilike.%${q}%,codigo_interno_barras.ilike.%${q}%`);

    const { data: insumos, error } = await query;
    if (error) throw error;

    const ids = (insumos ?? []).map((i) => i.id);
    const { data: proveedores } = ids.length
      ? await supabase.from("insumo_proveedores").select("*").in("insumo_id", ids)
      : { data: [] as InsumoProveedorRow[] };

    res.json((insumos ?? []).map((i) => mapInsumo(i as InsumoRow, (proveedores ?? []) as InsumoProveedorRow[])));
  } catch (err) {
    next(err);
  }
});

/** GET /api/insumos/buscar/:codigo — busca por código interno, de barras, de
 * búsqueda o de proveedor. Registra el escaneo exista o no coincidencia. */
insumosRouter.get("/buscar/:codigo", async (req, res, next) => {
  try {
    const codigoOriginal = req.params.codigo;
    const norm = normalizeCode(codigoOriginal);

    const { data: porCampoPropio } = await supabase
      .from("insumos")
      .select("*")
      .or(`codigo_interno.ilike.${norm},codigo_interno_barras.ilike.${norm},codigo_busqueda.ilike.${norm}`)
      .limit(1);

    let insumoRow = porCampoPropio?.[0] as InsumoRow | undefined;

    if (!insumoRow) {
      const { data: porProveedor } = await supabase
        .from("insumo_proveedores")
        .select("insumo_id")
        .ilike("codigo", norm)
        .limit(1);
      const insumoId = porProveedor?.[0]?.insumo_id;
      if (insumoId) {
        const { data } = await supabase.from("insumos").select("*").eq("id", insumoId).single();
        insumoRow = (data ?? undefined) as InsumoRow | undefined;
      }
    }

    await supabase.from("escaneos").insert({
      codigo: codigoOriginal,
      insumo_id: insumoRow ? insumoRow.id : null,
      encontrado: Boolean(insumoRow),
    });

    if (!insumoRow) {
      res.status(404).json({ encontrado: false, mensaje: "No se encontró ningún insumo con ese código." });
      return;
    }

    const { data: proveedores } = await supabase.from("insumo_proveedores").select("*").eq("insumo_id", insumoRow.id);
    res.json({ encontrado: true, insumo: mapInsumo(insumoRow, (proveedores ?? []) as InsumoProveedorRow[]) });
  } catch (err) {
    next(err);
  }
});

/** GET /api/insumos/:id */
insumosRouter.get("/:id", async (req, res, next) => {
  try {
    const dto = await fetchInsumoConProveedores(req.params.id);
    if (!dto) { res.status(404).json({ mensaje: "Insumo no encontrado." }); return; }
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/** POST /api/insumos — alta de insumo (nunca duplica Código Interno) */
insumosRouter.post("/", async (req, res, next) => {
  try {
    const body = crearInsumoSchema.parse(req.body);

    const { data: existente } = await supabase
      .from("insumos")
      .select("id, descripcion")
      .ilike("codigo_interno", normalizeCode(body.codigoInterno))
      .maybeSingle();
    if (existente) {
      res.status(409).json({ mensaje: `Ya existe un insumo con ese Código Interno: "${existente.descripcion}"` });
      return;
    }

    const { data: nuevo, error } = await supabase
      .from("insumos")
      .insert({
        categoria: body.categoria,
        descripcion: body.descripcion,
        codigo_interno: body.codigoInterno,
        codigo_interno_barras: body.codigoBarras ?? null,
        codigo_busqueda: body.codigoBusqueda ?? null,
        tipo: body.tipo ?? null,
        color: body.color ?? null,
        dimensiones: body.dimensiones ?? null,
        stock_sistema: body.stockSistema,
        stock_piso: body.stockPiso ?? null,
        stock_minimo: body.stockMinimo ?? null,
        recepcion: null,
        activo: true,
      })
      .select("*")
      .single();
    if (error || !nuevo) throw error ?? new Error("No se pudo crear el insumo.");

    const proveedoresValidos = body.proveedores.filter((p) => (p.nombre && p.nombre.trim()) || (p.codigo && p.codigo.trim()));
    if (proveedoresValidos.length) {
      await supabase.from("insumo_proveedores").insert(
        proveedoresValidos.map((p) => ({ insumo_id: nuevo.id, nombre: p.nombre ?? null, codigo: p.codigo ?? null }))
      );
    }

    await supabase.from("auditoria").insert({
      insumo_id: nuevo.id,
      tipo: "creacion",
      usuario: body.usuario,
      motivo: body.motivo ?? "Alta de nuevo insumo",
    });

    const dto = await fetchInsumoConProveedores(nuevo.id);
    res.status(201).json(dto);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/insumos/:id — edición (Código Interno / Barras / Proveedor
 * siempre se guardan por separado; requiere motivo). */
insumosRouter.put("/:id", async (req, res, next) => {
  try {
    const body = editarInsumoSchema.parse(req.body);
    const { id } = req.params;

    const { data: anterior } = await supabase.from("insumos").select("*").eq("id", id).single();
    if (!anterior) { res.status(404).json({ mensaje: "Insumo no encontrado." }); return; }

    const { data: duplicado } = await supabase
      .from("insumos")
      .select("id, descripcion")
      .neq("id", id)
      .ilike("codigo_interno", normalizeCode(body.codigoInterno))
      .maybeSingle();
    if (duplicado) {
      res.status(409).json({ mensaje: `Ya existe un insumo con ese Código Interno: "${duplicado.descripcion}"` });
      return;
    }

    const campos: Array<[string, unknown, unknown]> = [
      ["categoria", anterior.categoria, body.categoria],
      ["descripcion", anterior.descripcion, body.descripcion],
      ["codigoInterno", anterior.codigo_interno, body.codigoInterno],
      ["codigoBarras", anterior.codigo_interno_barras, body.codigoBarras ?? null],
      ["codigoBusqueda", anterior.codigo_busqueda, body.codigoBusqueda ?? null],
      ["tipo", anterior.tipo, body.tipo ?? null],
      ["color", anterior.color, body.color ?? null],
      ["dimensiones", anterior.dimensiones, body.dimensiones ?? null],
      ["stockMinimo", anterior.stock_minimo, body.stockMinimo ?? null],
    ];
    const cambios = campos
      .filter(([, antes, despues]) => String(antes ?? "") !== String(despues ?? ""))
      .map(([campo, antes, despues]) => ({ campo, antes, despues }));

    const { error } = await supabase
      .from("insumos")
      .update({
        categoria: body.categoria,
        descripcion: body.descripcion,
        codigo_interno: body.codigoInterno,
        codigo_interno_barras: body.codigoBarras ?? null,
        codigo_busqueda: body.codigoBusqueda ?? null,
        tipo: body.tipo ?? null,
        color: body.color ?? null,
        dimensiones: body.dimensiones ?? null,
        stock_minimo: body.stockMinimo ?? null,
      })
      .eq("id", id);
    if (error) throw error;

    await supabase.from("insumo_proveedores").delete().eq("insumo_id", id);
    const proveedoresValidos = body.proveedores.filter((p) => (p.nombre && p.nombre.trim()) || (p.codigo && p.codigo.trim()));
    if (proveedoresValidos.length) {
      await supabase.from("insumo_proveedores").insert(
        proveedoresValidos.map((p) => ({ insumo_id: id, nombre: p.nombre ?? null, codigo: p.codigo ?? null }))
      );
    }

    await supabase.from("auditoria").insert({
      insumo_id: id,
      tipo: "edicion",
      usuario: body.usuario,
      motivo: body.motivo,
      detalle: { cambios },
    });

    const dto = await fetchInsumoConProveedores(id);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/** POST /api/insumos/:id/ajuste-stock — corrige stock_sistema (conteo físico,
 * rotura, etc.), independiente de las recepciones. Motivo obligatorio. */
insumosRouter.post("/:id/ajuste-stock", async (req, res, next) => {
  try {
    const body = ajusteStockSchema.parse(req.body);
    const { id } = req.params;
    const { data: insumo } = await supabase.from("insumos").select("*").eq("id", id).single();
    if (!insumo) { res.status(404).json({ mensaje: "Insumo no encontrado." }); return; }

    const stockAnterior = Number(insumo.stock_sistema);
    const diferencia = body.nuevoValor - stockAnterior;
    if (diferencia === 0) { res.status(400).json({ mensaje: "El nuevo valor es igual al stock actual." }); return; }

    const { error } = await supabase.from("insumos").update({ stock_sistema: body.nuevoValor }).eq("id", id);
    if (error) throw error;

    await supabase.from("auditoria").insert({
      insumo_id: id,
      tipo: "ajuste_stock",
      usuario: body.usuario,
      motivo: body.motivo,
      detalle: { stockAnterior, stockNuevo: body.nuevoValor, diferencia },
    });

    const dto = await fetchInsumoConProveedores(id);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/** POST /api/insumos/:id/baja | /alta — nunca elimina el registro ni su historial */
function bajaAltaHandler(activo: boolean, tipo: "baja" | "alta") {
  return async (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => {
    try {
      const body = bajaAltaSchema.parse(req.body);
      const { id } = req.params;
      const { data: insumo } = await supabase.from("insumos").select("*").eq("id", id).single();
      if (!insumo) { res.status(404).json({ mensaje: "Insumo no encontrado." }); return; }

      const { error } = await supabase.from("insumos").update({ activo }).eq("id", id);
      if (error) throw error;

      await supabase.from("auditoria").insert({ insumo_id: id, tipo, usuario: body.usuario, motivo: body.motivo });

      const dto = await fetchInsumoConProveedores(id);
      res.json(dto);
    } catch (err) {
      next(err);
    }
  };
}
insumosRouter.post("/:id/baja", bajaAltaHandler(false, "baja"));
insumosRouter.post("/:id/alta", bajaAltaHandler(true, "alta"));
