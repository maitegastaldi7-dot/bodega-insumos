// ⚠️ LEGACY (prototipo anterior): asume una tabla unificada "insumos" que
// NO existe en tu proyecto Supabase real (que usa botellas/tapones/tapas/...).
// Este archivo no está montado en index.ts. Se conserva como referencia.

export type Categoria =
  | "Botellas"
  | "Tapones"
  | "Tapas"
  | "Cápsulas"
  | "Etiquetas"
  | "Contraetiqueta"
  | "Cajas"
  | "Separadores";

export type TipoAuditoria = "creacion" | "edicion" | "ajuste_stock" | "baja" | "alta";
export type EstadoOrden = "pendiente" | "en_proceso" | "completada";
export type EstadoLinea = "pendiente" | "abastecido" | "insuficiente";

export interface InsumoRow {
  id: string;
  categoria: Categoria;
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

export interface InsumoProveedorRow {
  id: string;
  insumo_id: string;
  nombre: string | null;
  codigo: string | null;
}

export interface RecepcionRow {
  id: string;
  insumo_id: string | null;
  cantidad: number;
  foto_url: string | null;
  usuario: string | null;
  orden_id: string | null;
  fecha: string;
}

export interface AuditoriaRow {
  id: string;
  insumo_id: string | null;
  tipo: TipoAuditoria;
  usuario: string;
  motivo: string | null;
  detalle: Record<string, unknown> | null;
  fecha: string;
}

export interface EscaneoRow {
  id: string;
  codigo: string;
  insumo_id: string | null;
  encontrado: boolean;
  fecha: string;
}

export interface OrdenProduccionRow {
  id: string;
  codigo: string;
  producto: string;
  cantidad: number;
  estado: EstadoOrden;
  fecha_creacion: string;
}

export interface OrdenInsumoRow {
  id: string;
  orden_id: string;
  insumo_id: string;
  cantidad_necesaria: number;
  cantidad_entregada: number;
  estado: EstadoLinea;
}

// Tipado mínimo de la base para el cliente tipado de supabase-js.
// (Un proyecto real generaría esto con `supabase gen types typescript`.)
export interface Database {
  public: {
    Tables: {
      insumos: {
        Row: InsumoRow;
        Insert: Partial<InsumoRow> & Pick<InsumoRow, "categoria" | "descripcion" | "codigo_interno">;
        Update: Partial<InsumoRow>;
      };
      insumo_proveedores: {
        Row: InsumoProveedorRow;
        Insert: Partial<InsumoProveedorRow> & Pick<InsumoProveedorRow, "insumo_id">;
        Update: Partial<InsumoProveedorRow>;
      };
      recepciones: {
        Row: RecepcionRow;
        Insert: Partial<RecepcionRow> & Pick<RecepcionRow, "cantidad">;
        Update: Partial<RecepcionRow>;
      };
      auditoria: {
        Row: AuditoriaRow;
        Insert: Partial<AuditoriaRow> & Pick<AuditoriaRow, "tipo">;
        Update: Partial<AuditoriaRow>;
      };
      escaneos: {
        Row: EscaneoRow;
        Insert: Partial<EscaneoRow> & Pick<EscaneoRow, "codigo" | "encontrado">;
        Update: Partial<EscaneoRow>;
      };
      ordenes_produccion: {
        Row: OrdenProduccionRow;
        Insert: Partial<OrdenProduccionRow> & Pick<OrdenProduccionRow, "codigo" | "producto" | "cantidad">;
        Update: Partial<OrdenProduccionRow>;
      };
      orden_insumos: {
        Row: OrdenInsumoRow;
        Insert: Partial<OrdenInsumoRow> & Pick<OrdenInsumoRow, "orden_id" | "insumo_id" | "cantidad_necesaria">;
        Update: Partial<OrdenInsumoRow>;
      };
    };
    Views: {
      v_historial_movimientos: {
        Row: {
          id: string;
          tipo: string;
          insumo_id: string | null;
          cantidad: number | null;
          usuario: string | null;
          motivo: string | null;
          detalle: Record<string, unknown> | null;
          fecha: string;
        };
      };
    };
  };
}

// ---- DTOs que expone la API (camelCase, listos para el frontend) ----

export interface ProveedorDTO {
  nombre: string | null;
  codigo: string | null;
}

export interface InsumoDTO {
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
  proveedores: ProveedorDTO[];
}

export interface MovimientoDTO {
  id: string;
  tipo: TipoAuditoria | "recepcion";
  insumoId: string | null;
  cantidad: number | null;
  fotoUrl: string | null;
  usuario: string | null;
  motivo: string | null;
  detalle: Record<string, unknown> | null;
  fecha: string;
}

export interface OrdenInsumoDTO {
  insumoId: string;
  cantidadNecesaria: number;
  cantidadEntregada: number;
  estado: EstadoLinea;
}

export interface OrdenDTO {
  id: string;
  codigo: string;
  producto: string;
  cantidad: number;
  estado: EstadoOrden;
  fechaCreacion: string;
  insumos: OrdenInsumoDTO[];
}
