// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Movimiento } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useHistorial(filtros?: { insumoId?: string; tipo?: string }) {
  const params = new URLSearchParams();
  if (filtros?.insumoId) params.set("insumoId", filtros.insumoId);
  if (filtros?.tipo && filtros.tipo !== "Todos") params.set("tipo", filtros.tipo);
  const qs = params.toString();

  return useQuery({
    queryKey: queryKeys.historial(filtros),
    queryFn: () => api.get<Movimiento[]>(`/historial${qs ? `?${qs}` : ""}`),
    staleTime: 15_000,
  });
}
