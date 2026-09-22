import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insumosService } from "../services/insumosService";
import type { TablaInsumo } from "../types/insumo.types";

export function useDiagnosticoConexion(tabla: TablaInsumo = "botellas") {
  return useQuery({
    queryKey: ["insumos-real", "diagnostico", tabla],
    queryFn: () => insumosService.diagnostico(tabla),
    retry: false,
    refetchOnMount: "always",
  });
}

export function useInsumosPorTabla(tabla: TablaInsumo, q?: string) {
  return useQuery({
    queryKey: ["insumos-real", tabla, q ?? ""],
    queryFn: () => insumosService.listarPorTabla(tabla, q),
    staleTime: 30_000,
  });
}

export function useInsumosTodasLasTablas(q?: string) {
  return useQuery({
    queryKey: ["insumos-real", "todas", q ?? ""],
    queryFn: () => insumosService.listarTodas(q),
    staleTime: 30_000,
  });
}

export function useInsumoReal(tabla: TablaInsumo | null, id: string | null) {
  return useQuery({
    queryKey: ["insumos-real", tabla, id],
    queryFn: () => insumosService.obtenerPorId(tabla as TablaInsumo, id as string),
    enabled: Boolean(tabla && id),
  });
}

export function useBuscarInsumoPorCodigo() {
  return useMutation({
    mutationFn: (codigo: string) => insumosService.buscarPorCodigo(codigo),
  });
}

export function useRegistrarRecepcion(tabla: TablaInsumo, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cantidad: number) => insumosService.registrarRecepcion(tabla, id, cantidad),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["insumos-real"] });
    },
  });
}
