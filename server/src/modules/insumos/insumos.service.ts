import { supabase } from "../../supabaseClient.js";
import { env } from "../../env.js";
import {
  CATEGORIAS_INSUMOS,
  type CategoriaInsumo,
  mapInsumoReal,
  type InsumoRealDTO,
  type InsumoRowReal,
} from "./insumos.types.js";

interface OpcionesListado {
  q?: string;
}

export async function listarInsumos(
  categoria: CategoriaInsumo,
  opciones: OpcionesListado = {}
): Promise<InsumoRealDTO[]> {
  let query = supabase
    .from("insumos")
    .select("*")
    .eq("categoria", categoria)
    .eq("activo", true)
    .order("descripcion", { ascending: true });

  if (opciones.q && opciones.q.trim()) {
    const q = opciones.q.trim();

    query = query.or(
      `descripcion.ilike.%${q}%,codigo_interno.ilike.%${q}%,codigo_interno_barras.ilike.%${q}%,codigo_busqueda.ilike.%${q}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `Error al leer los insumos de ${categoria}: ${error.message}`
    );
  }

  return ((data ?? []) as InsumoRowReal[]).map(mapInsumoReal);
}

export async function listarTodasLasCategorias(
  opciones: OpcionesListado = {}
): Promise<{
  datos: Record<CategoriaInsumo, InsumoRealDTO[]>;
  errores: Partial<Record<CategoriaInsumo, string>>;
}> {
  const datos = {} as Record<CategoriaInsumo, InsumoRealDTO[]>;
  const errores: Partial<Record<CategoriaInsumo, string>> = {};

  await Promise.all(
    CATEGORIAS_INSUMOS.map(async (categoria) => {
      try {
        datos[categoria] = await listarInsumos(categoria, opciones);
      } catch (error) {
        datos[categoria] = [];

        errores[categoria] =
          error instanceof Error
            ? error.message
            : "Error desconocido.";
      }
    })
  );

  return { datos, errores };
}

export async function obtenerInsumo(
  id: string
): Promise<InsumoRealDTO | null> {
  const { data, error } = await supabase
    .from("insumos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Error al obtener el insumo: ${error.message}`
    );
  }

  if (!data) return null;

  return mapInsumoReal(data as InsumoRowReal);
}

export async function buscarInsumoPorCodigo(
  codigoRaw: string
): Promise<InsumoRealDTO | null> {
  const codigo = codigoRaw.trim();

  if (!codigo) return null;

  const { data, error } = await supabase
    .from("insumos")
    .select("*")
    .or(
      `codigo_interno.ilike.${codigo},codigo_interno_barras.ilike.${codigo},codigo_busqueda.ilike.${codigo}`
    )
    .eq("activo", true)
    .limit(1);

  if (error) {
    throw new Error(
      `Error al buscar el código: ${error.message}`
    );
  }

  if (!data || data.length === 0) return null;

  return mapInsumoReal(data[0] as InsumoRowReal);
}

export async function registrarRecepcion(
  id: string,
  cantidad: number
): Promise<InsumoRealDTO> {
  const actual = await obtenerInsumo(id);

  if (!actual) {
    throw new Error("No se encontró el insumo.");
  }

  const nuevoStock = (actual.stock ?? 0) + cantidad;
  const nuevaRecepcion = (actual.recepcion ?? 0) + cantidad;

  const { data, error } = await supabase
    .from("insumos")
    .update({
      stock_sistema: nuevoStock,
      recepcion: nuevaRecepcion,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Error al registrar la recepción: ${error.message}`
    );
  }

  return mapInsumoReal(data as InsumoRowReal);
}

export interface DiagnosticoConexion {
  ok: boolean;
  supabaseUrl: string;
  tablaProbada: string;
  mensaje?: string;
  detalle?: string;
  filasLeidas?: number;
}

export async function diagnosticarConexion(): Promise<DiagnosticoConexion> {
  try {
    const { data, error } = await supabase
      .from("insumos")
      .select("id", { count: "exact" })
      .limit(1);

    if (error) {
      return {
        ok: false,
        supabaseUrl: env.supabaseUrl,
        tablaProbada: "insumos",
        mensaje: error.message,
        detalle: error.details,
      };
    }

    return {
      ok: true,
      supabaseUrl: env.supabaseUrl,
      tablaProbada: "insumos",
      filasLeidas: data?.length ?? 0,
    };
  } catch (error) {
    return {
      ok: false,
      supabaseUrl: env.supabaseUrl,
      tablaProbada: "insumos",
      mensaje:
        error instanceof Error
          ? error.message
          : "Error desconocido.",
    };
  }
}