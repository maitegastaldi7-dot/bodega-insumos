import { Router } from "express";
import { z } from "zod";
import {
  CATEGORIAS_INSUMOS,
  esCategoriaValida,
} from "./insumos.types.js";

import {
  buscarInsumoPorCodigo,
  diagnosticarConexion,
  listarInsumos,
  listarTodasLasCategorias,
  obtenerInsumo,
  registrarRecepcion,
} from "./insumos.service.js";

export const insumosRouter = Router();

/** Diagnóstico de conexión con Supabase */
insumosRouter.get("/diagnostico", async (_req, res) => {
  const resultado = await diagnosticarConexion();
  res.status(resultado.ok ? 200 : 502).json(resultado);
});

/** Todas las categorías juntas */
insumosRouter.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q as string | undefined)?.trim();

    const resultado = await listarTodasLasCategorias({ q });

    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

/** Lista de categorías */
insumosRouter.get("/categorias", (_req, res) => {
  res.json(CATEGORIAS_INSUMOS);
});

/** Buscar por código interno, código de barras o código de búsqueda */
insumosRouter.get("/buscar/:codigo", async (req, res, next) => {
  try {
    const insumo = await buscarInsumoPorCodigo(req.params.codigo);

    if (!insumo) {
      res.status(404).json({
        encontrado: false,
        mensaje: "No se encontró ningún insumo con ese código.",
      });
      return;
    }

    res.json({
      encontrado: true,
      insumo,
    });
  } catch (err) {
    next(err);
  }
});

/** Lista una categoría */
insumosRouter.get("/categoria/:categoria", async (req, res, next) => {
  try {
    const categoria = req.params.categoria;

    if (!esCategoriaValida(categoria)) {
      res.status(400).json({
        mensaje: `"${categoria}" no es una categoría válida.`,
        categorias: CATEGORIAS_INSUMOS,
      });
      return;
    }

    const q = (req.query.q as string | undefined)?.trim();

    const insumos = await listarInsumos(categoria, { q });

    res.json(insumos);
  } catch (err) {
    next(err);
  }
});

/** Obtener un insumo por ID */
insumosRouter.get("/id/:id", async (req, res, next) => {
  try {
    const insumo = await obtenerInsumo(req.params.id);

    if (!insumo) {
      res.status(404).json({
        mensaje: "Insumo no encontrado.",
      });
      return;
    }

    res.json(insumo);
  } catch (err) {
    next(err);
  }
});

const recepcionSchema = z.object({
  cantidad: z.number().positive(),
});

/** Registrar recepción */
insumosRouter.post("/id/:id/recepcion", async (req, res, next) => {
  try {
    const body = recepcionSchema.parse(req.body);

    const insumo = await registrarRecepcion(
      req.params.id,
      body.cantidad
    );

    res.json(insumo);
  } catch (err) {
    next(err);
  }
});