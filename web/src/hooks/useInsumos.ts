// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { EditarInsumoInput, Insumo, NuevoInsumoInput } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface FiltrosInsumos {
  activo?: "true" | "false";
  categoria?: string;
  q?: string;
}

function buildQuery(filtros?: FiltrosInsumos): string {
  const params = new URLSearchParams();
  if (filtros?.activo) params.set("activo", filtros.activo);
  if (filtros?.categoria && filtros.categoria !== "Todas") params.set("categoria", filtros.categoria);
  if (filtros?.q) params.set("q", filtros.q);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useInsumos(filtros?: FiltrosInsumos) {
  return useQuery({
    queryKey: queryKeys.insumos(filtros),
    queryFn: () => api.get<Insumo[]>(`/insumos${buildQuery(filtros)}`),
    staleTime: 30_000,
  });
}

export function useInsumo(id: string | null) {
  return useQuery({
    queryKey: queryKeys.insumo(id ?? ""),
    queryFn: () => api.get<Insumo>(`/insumos/${id}`),
    enabled: Boolean(id),
  });
}

export function useBuscarPorCodigo() {
  return useMutation({
    mutationFn: (codigo: string) =>
      api
        .get<{ encontrado: true; insumo: Insumo } | { encontrado: false; mensaje: string }>(
          `/insumos/buscar/${encodeURIComponent(codigo)}`
        )
        .catch((err) => {
          // el endpoint responde 404 cuando no hay coincidencia: lo tratamos como resultado, no como error de red
          if (err?.status === 404) return { encontrado: false as const, mensaje: err.message as string };
          throw err;
        }),
  });
}

function invalidarInsumos(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["insumos"] });
  qc.invalidateQueries({ queryKey: ["historial"] });
}

export function useCrearInsumo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NuevoInsumoInput) => api.post<Insumo>("/insumos", input),
    onSuccess: () => invalidarInsumos(qc),
  });
}

export function useEditarInsumo(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EditarInsumoInput) => api.put<Insumo>(`/insumos/${id}`, input),
    onSuccess: () => invalidarInsumos(qc),
  });
}

export function useAjustarStock(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { nuevoValor: number; motivo: string; usuario: string }) =>
      api.post<Insumo>(`/insumos/${id}/ajuste-stock`, input),
    onSuccess: () => invalidarInsumos(qc),
  });
}

export function useCambiarBaja(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ aBaja, motivo, usuario }: { aBaja: boolean; motivo: string; usuario: string }) =>
      api.post<Insumo>(`/insumos/${id}/${aBaja ? "baja" : "alta"}`, { motivo, usuario }),
    onSuccess: () => invalidarInsumos(qc),
  });
}
