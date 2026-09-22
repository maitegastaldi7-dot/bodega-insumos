export const CATEGORIAS_INSUMOS = [
  "Botellas",
  "Tapones",
  "Tapas",
  "Cápsulas",
  "Etiquetas",
  "Contraetiqueta",
  "Cajas",
  "Separadores",
] as const;

export type CategoriaInsumo = (typeof CATEGORIAS_INSUMOS)[number];

export function esCategoriaValida(valor: string): valor is CategoriaInsumo {
  return (CATEGORIAS_INSUMOS as readonly string[]).includes(valor);
}

export interface InsumoRowReal {
  id: string;
  categoria: CategoriaInsumo;
  descripcion: string;
  codigo_interno: string;
  codigo_interno_barras: string | null;
  codigo_busqueda: string | null;
  tipo: string | null;
  color: string | null;
  dimensiones: string | null;
  stock_sistema: number;
  stock_piso: number | null;
  stock_minimo: number | null;
  recepcion: number | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface InsumoRealDTO {
  id: string;
  categoria: CategoriaInsumo;
  codigoInterno: string;
  codigoBarras: string | null;
  codigoBusqueda: string | null;
  descripcion: string;
  tipo: string | null;
  color: string | null;
  dimensiones: string | null;
  stock: number;
  stockPiso: number | null;
  stockMinimo: number | null;
  recepcion: number | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export function mapInsumoReal(row: InsumoRowReal): InsumoRealDTO {
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
    stock: Number(row.stock_sistema ?? 0),
    stockPiso: row.stock_piso === null ? null : Number(row.stock_piso),
    stockMinimo: row.stock_minimo === null ? null : Number(row.stock_minimo),
    recepcion: row.recepcion === null ? null : Number(row.recepcion),
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
