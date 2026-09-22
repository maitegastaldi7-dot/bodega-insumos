// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Movimiento } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useRecepciones() {
  return useQuery({
    queryKey: queryKeys.recepciones(),
    queryFn: () => api.get<Movimiento[]>("/recepciones"),
    staleTime: 15_000,
  });
}

export interface NuevaRecepcionInput {
  insumoId: string;
  cantidad: number;
  fotoUrl?: string | null;
  usuario: string;
  ordenId?: string | null;
}

export function useRegistrarRecepcion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NuevaRecepcionInput) => api.post<Movimiento>("/recepciones", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["insumos"] });
      qc.invalidateQueries({ queryKey: queryKeys.recepciones() });
      qc.invalidateQueries({ queryKey: ["historial"] });
      qc.invalidateQueries({ queryKey: ["ordenes"] });
    },
  });
}
