export const TABLAS_INSUMOS = [
  "botellas",
  "tapones",
  "tapas",
  "capsulas",
  "etiquetas",
  "contraetiquetas",
  "cajas",
  "separadores",
] as const;

export type TablaInsumo = (typeof TABLAS_INSUMOS)[number];

export const TABLA_LABEL: Record<TablaInsumo, string> = {
  botellas: "Botellas",
  tapones: "Tapones",
  tapas: "Tapas",
  capsulas: "Cápsulas",
  etiquetas: "Etiquetas",
  contraetiquetas: "Contraetiquetas",
  cajas: "Cajas",
  separadores: "Separadores",
};

/**
 * Insumo tal como lo devuelve la API, en base a las columnas reales de Supabase.
 * `stockPiso`/`stockMinimo` son `undefined` cuando la columna no existe en esa
 * tabla (no confundir con `null`, que significa "existe pero está vacía").
 */
export interface InsumoReal {
  id: string;
  tabla: TablaInsumo;
  codigoInterno: string | null;
  codigoBarras: string | null;
  descripcion: string | null;
  proveedor: string | null;
  codigoProveedor: string | null;
  nombreProveedor: string | null;
  stock: number | null;
  recepcion: number | null;
  stockPiso: number | null | undefined;
  stockMinimo: number | null | undefined;
  createdAt: string;
  updatedAt: string;
}

export type EstadoStock = "ok" | "bajo" | "sin_stock" | "sin_minimo_configurado";

export function estadoStock(insumo: Pick<InsumoReal, "stock" | "stockMinimo">): EstadoStock {
  if (insumo.stock === null || insumo.stock === undefined) return "sin_minimo_configurado";
  if (insumo.stock <= 0) return "sin_stock";
  if (insumo.stockMinimo === null || insumo.stockMinimo === undefined) return "sin_minimo_configurado";
  if (insumo.stock <= insumo.stockMinimo) return "bajo";
  return "ok";
}

export const ESTADO_STOCK_META: Record<EstadoStock, { label: string; color: string; soft: string }> = {
  ok: { label: "Stock OK", color: "#1D8A5C", soft: "#E2F4EA" },
  bajo: { label: "Bajo mínimo", color: "#C77D14", soft: "#FBEEDA" },
  sin_stock: { label: "Sin stock", color: "#C13B2A", soft: "#FAE4E0" },
  sin_minimo_configurado: { label: "Sin mínimo configurado", color: "#8A97A3", soft: "#EEF1F4" },
};
