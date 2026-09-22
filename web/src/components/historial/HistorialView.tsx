// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { useHistorial } from "@/hooks/useHistorial";
import { useInsumos } from "@/hooks/useInsumos";
import { formatFecha, formatNum } from "@/lib/format";
import { inputClass } from "@/components/ui/Modal";
import type { TipoMovimiento } from "@/types";
import {
  ArrowDown, History, PackageCheck, PackageX, Pencil, Plus, Search, SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState, type ComponentType } from "react";

const TIPO_META: Record<TipoMovimiento, { label: string; icon: ComponentType<{ size?: number }>; color: string }> = {
  recepcion: { label: "Recepción", icon: ArrowDown, color: "#1D8A5C" },
  creacion: { label: "Alta de insumo", icon: Plus, color: "#1868A0" },
  edicion: { label: "Edición", icon: Pencil, color: "#1868A0" },
  ajuste_stock: { label: "Ajuste de stock", icon: SlidersHorizontal, color: "#C77D14" },
  baja: { label: "Dado de baja", icon: PackageX, color: "#C13B2A" },
  alta: { label: "Reactivado", icon: PackageCheck, color: "#1D8A5C" },
};

export function HistorialView() {
  const [tipoFiltro, setTipoFiltro] = useState<TipoMovimiento | "Todos">("Todos");
  const [q, setQ] = useState("");
  const { data: historial = [] } = useHistorial({ tipo: tipoFiltro });
  const { data: insumos = [] } = useInsumos();

  const insumoOf = (id: string | null) => insumos.find((i) => i.id === id);

  const filtrado = useMemo(() => {
    if (!q) return historial;
    const qq = q.toLowerCase();
    return historial.filter((m) => {
      const ins = insumoOf(m.insumoId);
      return (
        (ins?.descripcion.toLowerCase().includes(qq) ?? false) ||
        (m.usuario?.toLowerCase().includes(qq) ?? false) ||
        (m.motivo?.toLowerCase().includes(qq) ?? false)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historial, q]);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border-[1.5px] border-border bg-surface px-3.5">
          <Search size={17} color="#8A97A3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por insumo, usuario o motivo…" className="flex-1 bg-transparent py-2.5 font-sans text-sm outline-none" />
        </div>
        <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value as TipoMovimiento | "Todos")} className={`${inputClass} w-[220px]`}>
          <option value="Todos">Todos los movimientos</option>
          {Object.entries(TIPO_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg">
              {["Fecha", "Tipo", "Insumo", "Detalle", "Motivo", "Usuario"].map((h) => (
                <th key={h} className="border-b border-border px-4 py-3 text-left font-sans text-[11px] font-bold uppercase tracking-wide text-text-secondary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrado.map((m) => {
              const ins = insumoOf(m.insumoId);
              const meta = TIPO_META[m.tipo] ?? TIPO_META.edicion;
              const HIcon = meta.icon;
              const diferencia = m.detalle && "diferencia" in m.detalle ? (m.detalle.diferencia as number) : null;
              const stockNuevo = m.detalle && "stockNuevo" in m.detalle ? (m.detalle.stockNuevo as number) : null;
              const cambios = m.detalle && "cambios" in m.detalle ? (m.detalle.cambios as Array<{ campo: string }>) : null;
              return (
                <tr key={m.id} className="border-b border-border hover:bg-bg">
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-text-secondary">{formatFecha(m.fecha)}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-bold" style={{ backgroundColor: `${meta.color}18`, color: meta.color }}>
                      <HIcon size={12} /> {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-sans text-[13px] font-semibold text-text-primary">{ins?.descripcion ?? "—"}</td>
                  <td className="px-4 py-3.5 font-mono text-[12.5px] text-text-secondary">
                    {m.tipo === "recepcion" && <span className="font-bold text-success">+{formatNum(m.cantidad)}</span>}
                    {m.tipo === "ajuste_stock" && diferencia !== null && (
                      <span className="font-bold" style={{ color: diferencia >= 0 ? "#1D8A5C" : "#C13B2A" }}>
                        {diferencia >= 0 ? "+" : ""}{formatNum(diferencia)} (→ {formatNum(stockNuevo)})
                      </span>
                    )}
                    {m.tipo === "edicion" && cambios && <span>{cambios.map((c) => c.campo).join(", ")}</span>}
                    {!["recepcion", "ajuste_stock", "edicion"].includes(m.tipo) && "—"}
                  </td>
                  <td className="max-w-[260px] px-4 py-3.5 font-sans text-[12.5px] text-text-secondary">{m.motivo ?? "—"}</td>
                  <td className="px-4 py-3.5 font-sans text-[12.5px] text-text-secondary">{m.usuario ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtrado.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <History size={28} color="#8A97A3" />
            <p className="mt-2.5 font-sans text-[13.5px] text-text-secondary">No hay movimientos registrados con esos filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
