// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

export type Categoria =
  | "Botellas"
  | "Tapones"
  | "Tapas"
  | "Cápsulas"
  | "Etiquetas"
  | "Contraetiqueta"
  | "Cajas"
  | "Separadores";

export const CATEGORIAS: Categoria[] = [
  "Botellas", "Tapones", "Tapas", "Cápsulas", "Etiquetas", "Contraetiqueta", "Cajas", "Separadores",
];

export type TipoMovimiento = "recepcion" | "creacion" | "edicion" | "ajuste_stock" | "baja" | "alta";
export type EstadoOrden = "pendiente" | "en_proceso" | "completada";
export type EstadoLinea = "pendiente" | "abastecido" | "insuficiente";
export type EstadoStock = "ok" | "bajo" | "sin_stock" | "sin_dato";

export interface Proveedor {
  nombre: string | null;
  codigo: string | null;
}

export interface Insumo {
  id: string;
  categoria: Categoria;
  descripcion: string;
  codigoInterno: string;
  codigoBarras: string | null;
  codigoBusqueda: string | null;
  tipo: string | null;
  color: string | null;
  dimensiones: string | null;
  stockSistema: number;
  stockPiso: number | null;
  stockMinimo: number | null;
  recepcion: number | null;
  activo: boolean;
  proveedores: Proveedor[];
}

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  insumoId: string | null;
  cantidad: number | null;
  fotoUrl: string | null;
  usuario: string | null;
  motivo: string | null;
  detalle: Record<string, unknown> | null;
  fecha: string;
}

export interface OrdenInsumo {
  insumoId: string;
  cantidadNecesaria: number;
  cantidadEntregada: number;
  estado: EstadoLinea;
}

export interface Orden {
  id: string;
  codigo: string;
  producto: string;
  cantidad: number;
  estado: EstadoOrden;
  fechaCreacion: string;
  insumos: OrdenInsumo[];
}

export interface NuevoInsumoInput {
  categoria: Categoria;
  descripcion: string;
  codigoInterno: string;
  codigoBarras: string | null;
  codigoBusqueda: string | null;
  tipo: string | null;
  color: string | null;
  dimensiones: string | null;
  proveedores: Proveedor[];
  stockSistema: number;
  stockPiso: number | null;
  stockMinimo: number | null;
  usuario: string;
  motivo?: string;
}

export type EditarInsumoInput = Omit<NuevoInsumoInput, "stockSistema" | "stockPiso"> & { motivo: string };
