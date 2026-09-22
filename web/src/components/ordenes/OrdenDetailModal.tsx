// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { Badge, CatBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useInsumos } from "@/hooks/useInsumos";
import { formatFechaCorta, formatNum } from "@/lib/format";
import type { EstadoLinea, EstadoOrden, Orden } from "@/types";
import { ClipboardList, Truck } from "lucide-react";

const ESTADO_LINEA_META: Record<EstadoLinea, { label: string; color: string; soft: string }> = {
  pendiente: { label: "Pendiente", color: "#8A97A3", soft: "#EEF1F4" },
  abastecido: { label: "Abastecido", color: "#1D8A5C", soft: "#E2F4EA" },
  insuficiente: { label: "Stock insuficiente", color: "#C13B2A", soft: "#FAE4E0" },
};

export const ESTADO_ORDEN_META: Record<EstadoOrden, { label: string; color: string; soft: string }> = {
  pendiente: { label: "Pendiente", color: "#8A97A3", soft: "#EEF1F4" },
  en_proceso: { label: "En proceso", color: "#1868A0", soft: "#E4EFF7" },
  completada: { label: "Completada", color: "#1D8A5C", soft: "#E2F4EA" },
};

interface OrdenDetailModalProps {
  orden: Orden;
  onClose: () => void;
  onQuickMove: (insumoId: string, ordenId: string) => void;
}

export function OrdenDetailModal({ orden, onClose, onQuickMove }: OrdenDetailModalProps) {
  const { data: insumos = [] } = useInsumos();
  const meta = ESTADO_ORDEN_META[orden.estado];

  return (
    <Modal onClose={onClose} title={orden.codigo} icon={ClipboardList} width={620}>
      <div className="mb-5 flex items-center justify-between rounded-xl bg-bg px-4 py-3.5">
        <div>
          <div className="font-display text-[17px] font-bold text-text-primary">{orden.producto}</div>
          <div className="mt-0.5 font-sans text-[12.5px] text-text-muted">
            Cantidad a producir: {formatNum(orden.cantidad)} · Creada {formatFechaCorta(orden.fechaCreacion)}
          </div>
        </div>
        <Badge label={meta.label} color={meta.color} soft={meta.soft} />
      </div>

      <div className="mb-2.5 font-sans text-[12.5px] font-bold uppercase tracking-wide text-text-secondary">Insumos requeridos</div>
      <div className="flex flex-col gap-2">
        {orden.insumos.map((l) => {
          const ins = insumos.find((i) => i.id === l.insumoId);
          const lmeta = ESTADO_LINEA_META[l.estado];
          const pct = Math.min(100, (l.cantidadEntregada / (l.cantidadNecesaria || 1)) * 100);
          return (
            <div key={l.insumoId} className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-3.5">
              <div className="min-w-0 flex-1">
                {ins && <CatBadge categoria={ins.categoria} />}
                <div className="mt-1 font-sans text-sm font-semibold text-text-primary">{ins?.descripcion ?? "—"}</div>
                <div className="mt-0.5 font-mono text-[11px] text-text-muted">
                  {formatNum(l.cantidadEntregada)} / {formatNum(l.cantidadNecesaria)} entregado · stock disponible {formatNum(ins?.stockSistema)}
                </div>
                <div className="mt-2 h-[5px] max-w-[220px] overflow-hidden rounded-full bg-bg">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: lmeta.color }} />
                </div>
              </div>
              <Badge label={lmeta.label} color={lmeta.color} soft={lmeta.soft} />
              {l.estado !== "abastecido" && (
                <button
                  onClick={() => onQuickMove(l.insumoId, orden.id)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-soft px-3 py-2 font-sans text-[12.5px] font-bold text-accent"
                >
                  <Truck size={14} /> Registrar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
