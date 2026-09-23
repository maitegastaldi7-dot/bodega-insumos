export const CATEGORIAS_INSUMOS = [
  "Botellas",
  "Tapones",
  "Tapas",
  "Cápsulas",
  "Etiquetas",
  "Contraetiquetas",
  "Cajas",
  "Separadores",
] as const;

export type CategoriaInsumo =
  (typeof CATEGORIAS_INSUMOS)[number];

export interface InsumoRowReal {
  id: string;
  categoria: CategoriaInsumo;
  codigo_interno: string | null;
  codigo_interno_barras: string | null;
  codigo_busqueda: string | null;
  descripcion: string | null;
  tipo: string | null;
  color: string | null;
  dimensiones: string | null;
  stock_sistema: number | null;
  stock_piso: number | null;
  stock_minimo: number | null;
  recepcion: number | null;
  activo: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InsumoRealDTO {
  id: string;
  categoria: CategoriaInsumo;
  codigoInterno: string | null;
  codigoBarras: string | null;
  codigoBusqueda: string | null;
  descripcion: string | null;
  tipo: string | null;
  color: string | null;
  dimensiones: string | null;
  stock: number | null;
  stockPiso: number | null;
  stockMinimo: number | null;
  recepcion: number | null;
  activo: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export function mapInsumoReal(
  row: InsumoRowReal
): InsumoRealDTO {
  return {
    id: row.id,
    categoria: row.categoria,
    codigoInterno: row.codigo_interno,
    codigoBarras: row.codigo_interno_barras,
    codigoBusqueda: row.codigo_busqueda,
    descripcion: row.descripcion,
    tipo: row.tipo,
    color: row.color,
    dimensiones: row.dimensiones,
    stock: row.stock_sistema,
    stockPiso: row.stock_piso,
    stockMinimo: row.stock_minimo,
    recepcion: row.recepcion,
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function esCategoriaValida(
  categoria: string
): categoria is CategoriaInsumo {
  return (
    CATEGORIAS_INSUMOS as readonly string[]
  ).includes(categoria);
}