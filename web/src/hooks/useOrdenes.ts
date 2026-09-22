// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Orden } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useOrdenes() {
  return useQuery({
    queryKey: queryKeys.ordenes(),
    queryFn: () => api.get<Orden[]>("/ordenes"),
    staleTime: 15_000,
  });
}

export interface NuevaOrdenInput {
  codigo: string;
  producto: string;
  cantidad: number;
  insumos: Array<{ insumoId: string; cantidadNecesaria: number }>;
}

export function useCrearOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NuevaOrdenInput) => api.post<Orden>("/ordenes", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.ordenes() }),
  });
}
