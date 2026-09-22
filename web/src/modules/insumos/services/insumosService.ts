import { api } from "@/lib/api";
import type { InsumoReal, TablaInsumo } from "../types/insumo.types";

export interface DiagnosticoConexion {
  ok: boolean;
  supabaseUrl: string;
  tablaProbada: TablaInsumo;
  categoria?: string;
  mensaje?: string;
  detalle?: string;
  filasLeidas?: number;
}

export interface ListadoTodasLasTablas {
  datos: Record<TablaInsumo, InsumoReal[]>;
  errores: Partial<Record<TablaInsumo, string>>;
}

export const insumosService = {
  diagnostico: (tabla: TablaInsumo = "botellas") =>
    api.get<DiagnosticoConexion>(
      `/insumos/diagnostico?tabla=${tabla}`
    ),

  listarPorTabla: (tabla: TablaInsumo, q?: string) => {
    const categorias: Record<TablaInsumo, string> = {
      botellas: "Botellas",
      tapones: "Tapones",
      tapas: "Tapas",
      capsulas: "Cápsulas",
      etiquetas: "Etiquetas",
      contraetiqueta: "Contraetiqueta",
      cajas: "Cajas",
      separadores: "Separadores",
    };

    const categoria = categorias[tabla];
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";

    return api.get<InsumoReal[]>(
      `/insumos/categoria/${encodeURIComponent(categoria)}${qs}`
    );
  },

  listarTodas: (q?: string) => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";

    return api.get<ListadoTodasLasTablas>(
      `/insumos${qs}`
    );
  },

  obtenerPorId: (tabla: TablaInsumo, id: string) =>
    api.get<InsumoReal>(
      `/insumos/${tabla}/${id}`
    ),

  buscarPorCodigo: (codigo: string) =>
    api
      .get<{ encontrado: true; insumo: InsumoReal }>(
        `/insumos/buscar/${encodeURIComponent(codigo)}`
      )
      .catch((err) => {
        if (err?.status === 404) {
          return {
            encontrado: false as const,
            mensaje: err.message as string,
          };
        }

        throw err;
      }),

  registrarRecepcion: (
    tabla: TablaInsumo,
    id: string,
    cantidad: number
  ) =>
    api.post<InsumoReal>(
      `/insumos/${tabla}/${id}/recepcion`,
      { cantidad }
    ),
};