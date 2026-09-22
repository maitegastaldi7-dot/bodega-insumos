// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { BarcodeImage } from "@/components/barcode/BarcodeImage";
import { Badge, CatBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useHistorial } from "@/hooks/useHistorial";
import { diferenciaStock, ESTADO_STOCK_META, formatFecha, formatNum, estadoStock } from "@/lib/format";
import { generarYCompartirFichaPDF } from "@/lib/pdf";
import type { Insumo, TipoMovimiento } from "@/types";
import {
  ArrowDown, Info, Loader2, PackageCheck, PackageX, Pencil, Plus,
  Printer, ScanBarcode, SlidersHorizontal, Truck,
} from "lucide-react";
import { useState, type ComponentType } from "react";

interface FichaInsumoModalProps {
  insumo: Insumo;
  onClose: () => void;
  onEscanear: () => void;
  onRegistrarRecepcion: (id: string) => void;
  onAjustarStock: (id: string) => void;
  onEditar: (id: string) => void;
  onCambiarBaja: (id: string, aBaja: boolean) => void;
  notify: (msg: string, type?: "success" | "error") => void;
}

const HISTORIAL_META: Record<TipoMovimiento, { label: string; icon: ComponentType<{ size?: number; color?: string }>; color: string }> = {
  recepcion: { label: "Recepción", icon: ArrowDown, color: "#1D8A5C" },
  creacion: { label: "Alta de insumo", icon: Plus, color: "#1868A0" },
  edicion: { label: "Edición", icon: Pencil, color: "#1868A0" },
  ajuste_stock: { label: "Ajuste de stock", icon: SlidersHorizontal, color: "#C77D14" },
  baja: { label: "Dado de baja", icon: PackageX, color: "#C13B2A" },
  alta: { label: "Reactivado", icon: PackageCheck, color: "#1D8A5C" },
};

export function FichaInsumoModal({ insumo, onClose, onEscanear, onRegistrarRecepcion, onAjustarStock, onEditar, onCambiarBaja, notify }: FichaInsumoModalProps) {
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const { data: historial = [] } = useHistorial({ insumoId: insumo.id });
  const est = estadoStock(insumo);
  const meta = ESTADO_STOCK_META[est];
  const diff = diferenciaStock(insumo);
  const inactivo = !insumo.activo;

  return (
    <Modal onClose={onClose} title="Ficha de Insumo" icon={Info} width={640}>
      <div className="ficha-print-area">
        <div className="mb-5 flex items-start justify-between rounded-xl bg-bg px-4 py-4" style={{ opacity: inactivo ? 0.65 : 1 }}>
          <div>
            <div className="flex items-center gap-2">
              <CatBadge categoria={insumo.categoria} />
              {inactivo && <Badge label="Dado de baja" color="#C13B2A" soft="#FAE4E0" />}
            </div>
            <div className="mt-2 font-display text-lg font-bold text-text-primary">{insumo.descripcion}</div>
            <div className="mt-1 font-mono text-xs text-text-muted">{insumo.codigoInterno}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge label={meta.label} color={meta.color} soft={meta.soft} pulse={est === "sin_stock"} />
            <button onClick={() => onEditar(insumo.id)} className="no-print flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-sans text-xs font-bold text-accent">
              <Pencil size={13} /> Editar
            </button>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border px-4 py-3.5">
            <div className="font-sans text-[11.5px] font-bold uppercase tracking-wide text-text-muted">Stock Sistema</div>
            <div className="mt-1 font-mono text-[22px] font-bold text-text-primary">{formatNum(insumo.stockSistema)}</div>
          </div>
          <div className="rounded-xl border border-border px-4 py-3.5">
            <div className="font-sans text-[11.5px] font-bold uppercase tracking-wide text-text-muted">Stock Piso</div>
            <div className="mt-1 font-mono text-[22px] font-bold text-text-primary">{formatNum(insumo.stockPiso)}</div>
          </div>
          <div className="rounded-xl border border-border px-4 py-3.5">
            <div className="font-sans text-[11.5px] font-bold uppercase tracking-wide text-text-muted">Diferencia (Sist. − Piso)</div>
            <div className="mt-1 font-mono text-[22px] font-bold" style={{ color: diff === null ? "#8A97A3" : diff === 0 ? "#1D8A5C" : "#C13B2A" }}>
              {diff === null ? "Sin control físico" : diff > 0 ? `+${formatNum(diff)}` : formatNum(diff)}
            </div>
          </div>
          <div className="rounded-xl border border-border px-4 py-3.5">
            <div className="font-sans text-[11.5px] font-bold uppercase tracking-wide text-text-muted">Stock Mínimo</div>
            <div className="mt-1 font-mono text-[22px] font-bold text-text-primary">{formatNum(insumo.stockMinimo)}</div>
          </div>
        </div>

        <div className="mb-2 font-sans text-[12.5px] font-bold uppercase tracking-wide text-text-secondary">Código de barras</div>
        <div className="mb-5">
          <BarcodeImage value={insumo.codigoBarras} />
        </div>
      </div>

      <div className="mb-2 font-sans text-[12.5px] font-bold uppercase tracking-wide text-text-secondary">Identificación</div>
      <div className="mb-5 rounded-xl border border-border">
        {[
          ["Código interno", insumo.codigoInterno],
          insumo.codigoBusqueda ? ["Código de búsqueda", insumo.codigoBusqueda] : null,
          insumo.tipo ? ["Tipo", insumo.tipo] : null,
          insumo.color ? ["Color", insumo.color] : null,
          insumo.dimensiones ? ["Dimensiones", insumo.dimensiones] : null,
          insumo.recepcion !== null ? ["Recepción acumulada", formatNum(insumo.recepcion)] : null,
        ]
          .filter((row): row is [string, string] => row !== null)
          .map(([k, v], idx, arr) => (
            <div key={k} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: idx < arr.length - 1 ? "1px solid #DCE2E8" : "none" }}>
              <span className="font-sans text-[13px] text-text-secondary">{k}</span>
              <span className="font-mono text-[13px] font-semibold text-text-primary">{v}</span>
            </div>
          ))}
      </div>

      {insumo.proveedores.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 font-sans text-[12.5px] font-bold uppercase tracking-wide text-text-secondary">Proveedores (Código de Proveedor)</div>
          <div className="flex flex-col gap-2">
            {insumo.proveedores.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-bg px-3.5 py-2.5">
                <span className="font-sans text-[13px] font-semibold text-text-primary">{p.nombre || "Proveedor sin nombre"}</span>
                {p.codigo && <span className="font-mono text-[11.5px] text-text-muted">{p.codigo}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {historial.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 font-sans text-[12.5px] font-bold uppercase tracking-wide text-text-secondary">Historial de movimientos</div>
          <div className="flex flex-col gap-1.5">
            {historial.slice(0, 8).map((m) => {
              const hm = HISTORIAL_META[m.tipo] ?? HISTORIAL_META.edicion;
              const HIcon = hm.icon;
              const diferencia = m.detalle && "diferencia" in m.detalle ? (m.detalle.diferencia as number) : null;
              return (
                <div key={m.id} className="flex items-center gap-3 rounded-lg bg-bg px-3.5 py-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${hm.color}18` }}>
                    <HIcon size={12.5} color={hm.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-[12.5px] font-semibold text-text-primary">{hm.label}</span>
                      {m.tipo === "recepcion" && <span className="font-mono text-xs font-bold text-success">+{formatNum(m.cantidad)}</span>}
                      {m.tipo === "ajuste_stock" && diferencia !== null && (
                        <span className="font-mono text-xs font-bold" style={{ color: diferencia >= 0 ? "#1D8A5C" : "#C13B2A" }}>
                          {diferencia >= 0 ? "+" : ""}{formatNum(diferencia)}
                        </span>
                      )}
                    </div>
                    {m.motivo && <div className="mt-0.5 font-sans text-[11.5px] text-text-secondary">{m.motivo}</div>}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-[10.5px] text-text-muted">{formatFecha(m.fecha)}</div>
                    {m.usuario && <div className="font-mono text-[10.5px] text-text-muted">{m.usuario}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <div className="flex gap-2.5">
          <button
            disabled={inactivo}
            onClick={() => onRegistrarRecepcion(insumo.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-sans text-[13.5px] font-bold text-white disabled:cursor-not-allowed"
            style={{ backgroundColor: inactivo ? "#DCE2E8" : "#1868A0", color: inactivo ? "#8A97A3" : "#fff" }}
          >
            <Truck size={16} /> Recepción
          </button>
          <button
            disabled={inactivo}
            onClick={() => onAjustarStock(insumo.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-[1.5px] py-3.5 font-sans text-[13.5px] font-bold disabled:cursor-not-allowed"
            style={{ borderColor: inactivo ? "#DCE2E8" : "#C77D14", color: inactivo ? "#8A97A3" : "#C77D14" }}
          >
            <SlidersHorizontal size={16} /> Ajustar stock
          </button>
          <button onClick={onEscanear} className="flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-border px-4 py-3.5 text-text-secondary">
            <ScanBarcode size={16} />
          </button>
        </div>
        <div className="flex gap-2.5">
          <button
            disabled={generandoPdf}
            onClick={async () => { setGenerandoPdf(true); await generarYCompartirFichaPDF(insumo, notify); setGenerandoPdf(false); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-[1.5px] border-border py-3.5 font-sans text-[13.5px] font-bold text-text-primary"
          >
            {generandoPdf ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} Imprimir / Compartir PDF
          </button>
          <button
            onClick={() => onCambiarBaja(insumo.id, !inactivo)}
            className="flex items-center justify-center gap-2 rounded-xl border-[1.5px] px-4 py-3.5 font-sans text-[13.5px] font-bold"
            style={{ borderColor: inactivo ? "#1D8A5C" : "#C13B2A", color: inactivo ? "#1D8A5C" : "#C13B2A" }}
          >
            {inactivo ? <PackageCheck size={16} /> : <PackageX size={16} />} {inactivo ? "Dar de alta" : "Dar de baja"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
