export const queryKeys = {
  insumos: (filtros?: { activo?: "true" | "false"; categoria?: string; q?: string }) =>
    ["insumos", filtros ?? {}] as const,
  insumo: (id: string) => ["insumos", id] as const,
  recepciones: () => ["recepciones"] as const,
  historial: (filtros?: { insumoId?: string; tipo?: string }) => ["historial", filtros ?? {}] as const,
  ordenes: () => ["ordenes"] as const,
  orden: (id: string) => ["ordenes", id] as const,
};
