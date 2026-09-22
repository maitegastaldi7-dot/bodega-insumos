import type { EstadoStock, Insumo } from "@/types";

export function formatNum(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("es-AR").format(n);
}

export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${mi}`;
}

export function formatFechaCorta(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function esHoy(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

export function esUltimosDias(iso: string | null | undefined, dias: number): boolean {
  if (!iso) return false;
  const d = new Date(iso).getTime();
  const t = Date.now();
  return (t - d) / (1000 * 3600 * 24) <= dias;
}

export function normalizeCode(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).trim().replace(/^\*+|\*+$/g, "").trim().toUpperCase();
}

export function estadoStock(insumo: Pick<Insumo, "stockSistema" | "stockMinimo">): EstadoStock {
  const stock = insumo.stockSistema;
  const minimo = insumo.stockMinimo;
  if (stock === null || stock === undefined) return "sin_dato";
  if (stock <= 0) return "sin_stock";
  if (minimo !== null && minimo !== undefined && stock <= minimo) return "bajo";
  return "ok";
}

export function diferenciaStock(insumo: Pick<Insumo, "stockSistema" | "stockPiso">): number | null {
  if (insumo.stockSistema === null || insumo.stockPiso === null || insumo.stockPiso === undefined) return null;
  return insumo.stockSistema - insumo.stockPiso;
}

export const ESTADO_STOCK_META: Record<EstadoStock, { label: string; color: string; soft: string }> = {
  ok: { label: "Stock OK", color: "#1D8A5C", soft: "#E2F4EA" },
  bajo: { label: "Bajo mínimo", color: "#C77D14", soft: "#FBEEDA" },
  sin_stock: { label: "Sin stock", color: "#C13B2A", soft: "#FAE4E0" },
  sin_dato: { label: "Sin dato", color: "#8A97A3", soft: "#EEF1F4" },
};
