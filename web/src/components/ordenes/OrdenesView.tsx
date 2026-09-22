// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { Badge } from "@/components/ui/Badge";
import { useCrearOrden, useOrdenes, type NuevaOrdenInput } from "@/hooks/useOrdenes";
import { formatFechaCorta } from "@/lib/format";
import type { EstadoOrden, Orden } from "@/types";
import { AlertTriangle, ClipboardList, Plus } from "lucide-react";
import { useState } from "react";
import { OrdenDetailModal, ESTADO_ORDEN_META } from "./OrdenDetailModal";
import { OrdenFormModal } from "./OrdenFormModal";

interface OrdenesViewProps {
  onQuickMove: (insumoId: string, ordenId: string) => void;
}

export function OrdenesView({ onQuickMove }: OrdenesViewProps) {
  const { data: ordenes = [] } = useOrdenes();
  const crearOrden = useCrearOrden();
  const [creating, setCreating] = useState(false);
  const [detalle, setDetalle] = useState<Orden | null>(null);
  const [filtro, setFiltro] = useState<EstadoOrden | "Todas">("Todas");

  const filtradas = [...ordenes]
    .filter((o) => filtro === "Todas" || o.estado === filtro)
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());

  function handleCrear(input: NuevaOrdenInput) {
    crearOrden.mutate(input, { onSuccess: () => setCreating(false) });
  }

  const ordenActual = detalle ? ordenes.find((o) => o.id === detalle.id) ?? detalle : null;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex overflow-hidden rounded-xl border-[1.5px] border-border">
          {(["Todas", "pendiente", "en_proceso", "completada"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2.5 font-sans text-[13px] font-semibold ${filtro === f ? "bg-ink-soft text-white" : "bg-surface text-text-secondary"}`}
            >
              {f === "Todas" ? "Todas" : ESTADO_ORDEN_META[f].label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-xl bg-accent px-[18px] py-3 font-sans text-sm font-bold text-white hover:brightness-110">
          <Plus size={18} /> Nueva Orden
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtradas.map((o) => {
          const total = o.insumos.length;
          const ok = o.insumos.filter((l) => l.estado === "abastecido").length;
          const insuf = o.insumos.some((l) => l.estado === "insuficiente");
          const pct = total ? Math.round((ok / total) * 100) : 0;
          const meta = ESTADO_ORDEN_META[o.estado];
          return (
            <button key={o.id} onClick={() => setDetalle(o)} className="rounded-2xl border border-border bg-surface p-[18px] text-left hover:border-accent hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[12.5px] font-bold text-accent">{o.codigo}</span>
                <Badge label={meta.label} color={meta.color} soft={meta.soft} />
              </div>
              <div className="mb-1 font-display text-[15.5px] font-bold text-text-primary">{o.producto}</div>
              <div className="mb-3 font-sans text-xs text-text-muted">Cantidad: {o.cantidad} · {formatFechaCorta(o.fechaCreacion)}</div>
              <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-bg">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: insuf ? "#C13B2A" : "#1868A0" }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-[11.5px] text-text-muted">{ok}/{total} insumos abastecidos</span>
                {insuf && (
                  <span className="flex items-center gap-1 font-sans text-[11px] font-bold text-danger">
                    <AlertTriangle size={12} /> Falta stock
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filtradas.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16">
          <ClipboardList size={28} color="#8A97A3" />
          <p className="mt-2.5 font-sans text-[13.5px] text-text-secondary">No hay órdenes de producción en este estado.</p>
        </div>
      )}

      {creating && <OrdenFormModal onClose={() => setCreating(false)} onSave={handleCrear} guardando={crearOrden.isPending} />}
      {ordenActual && (
        <OrdenDetailModal
          orden={ordenActual}
          onClose={() => setDetalle(null)}
          onQuickMove={(insumoId, ordenId) => { setDetalle(null); onQuickMove(insumoId, ordenId); }}
        />
      )}
    </div>
  );
}
