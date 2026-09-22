// ⚠️ LEGACY (prototipo anterior): asume una tabla unificada "insumos" que
// NO existe en tu proyecto Supabase real (que usa botellas/tapones/tapas/...).
// Este archivo no está montado en index.ts. Se conserva como referencia.

import type { InsumoDTO, InsumoProveedorRow, InsumoRow, MovimientoDTO, OrdenDTO, OrdenInsumoRow, OrdenProduccionRow } from "../types.js";

export function mapInsumo(row: InsumoRow, proveedores: InsumoProveedorRow[]): InsumoDTO {
  return {
    id: row.id,
    categoria: row.categoria,
    descripcion: row.descripcion,
    codigoInterno: row.codigo_interno,
    codigoBarras: row.codigo_interno_barras,
    codigoBusqueda: row.codigo_busqueda,
    tipo: row.tipo,
    color: row.color,
    dimensiones: row.dimensiones,
    stockSistema: Number(row.stock_sistema),
    stockPiso: row.stock_piso === null ? null : Number(row.stock_piso),
    stockMinimo: row.stock_minimo === null ? null : Number(row.stock_minimo),
    recepcion: row.recepcion === null ? null : Number(row.recepcion),
    activo: row.activo,
    proveedores: proveedores
      .filter((p) => p.insumo_id === row.id)
      .map((p) => ({ nombre: p.nombre, codigo: p.codigo })),
  };
}

export function mapMovimiento(row: {
  id: string;
  tipo: string;
  insumo_id: string | null;
  cantidad: number | null;
  foto_url?: string | null;
  usuario: string | null;
  motivo: string | null;
  detalle: Record<string, unknown> | null;
  fecha: string;
}): MovimientoDTO {
  return {
    id: row.id,
    tipo: row.tipo as MovimientoDTO["tipo"],
    insumoId: row.insumo_id,
    cantidad: row.cantidad === null ? null : Number(row.cantidad),
    fotoUrl: row.foto_url ?? null,
    usuario: row.usuario,
    motivo: row.motivo,
    detalle: row.detalle,
    fecha: row.fecha,
  };
}

export function mapOrden(row: OrdenProduccionRow, lineas: OrdenInsumoRow[]): OrdenDTO {
  return {
    id: row.id,
    codigo: row.codigo,
    producto: row.producto,
    cantidad: Number(row.cantidad),
    estado: row.estado,
    fechaCreacion: row.fecha_creacion,
    insumos: lineas
      .filter((l) => l.orden_id === row.id)
      .map((l) => ({
        insumoId: l.insumo_id,
        cantidadNecesaria: Number(l.cantidad_necesaria),
        cantidadEntregada: Number(l.cantidad_entregada),
        estado: l.estado,
      })),
  };
}
