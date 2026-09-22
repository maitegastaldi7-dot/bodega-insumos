// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { CatBadge } from "@/components/ui/Badge";
import { FieldLabel, Modal, inputClass } from "@/components/ui/Modal";
import { formatNum } from "@/lib/format";
import type { Insumo } from "@/types";
import { Check, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface AjusteStockModalProps {
  insumo: Insumo;
  onClose: () => void;
  onConfirm: (input: { nuevoValor: number; motivo: string }) => void;
  guardando: boolean;
}

export function AjusteStockModal({ insumo, onClose, onConfirm, guardando }: AjusteStockModalProps) {
  const [valor, setValor] = useState(String(insumo.stockSistema));
  const [motivo, setMotivo] = useState("");

  const nuevo = parseFloat(valor || "0");
  const diferencia = nuevo - insumo.stockSistema;
  const valido = valor !== "" && !Number.isNaN(nuevo) && motivo.trim().length > 0 && diferencia !== 0;

  return (
    <Modal onClose={onClose} title="Ajustar Stock" icon={SlidersHorizontal} width={460}>
      <div className="mb-5 rounded-xl bg-bg px-4 py-3.5">
        <CatBadge categoria={insumo.categoria} />
        <div className="mt-1.5 font-display text-base font-bold text-text-primary">{insumo.descripcion}</div>
        <div className="mt-0.5 font-mono text-[11.5px] text-text-muted">{insumo.codigoInterno} · Stock actual: {formatNum(insumo.stockSistema)}</div>
      </div>

      <FieldLabel>Nuevo valor de Stock Sistema</FieldLabel>
      <input
        type="number"
        autoFocus
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className={`${inputClass} mb-1.5 py-3.5 font-mono text-xl`}
      />
      {diferencia !== 0 && !Number.isNaN(nuevo) && (
        <div className="mb-3.5 font-sans text-[12.5px] font-bold" style={{ color: diferencia > 0 ? "#1D8A5C" : "#C13B2A" }}>
          {diferencia > 0 ? `+${formatNum(diferencia)}` : formatNum(diferencia)} respecto al stock actual
        </div>
      )}

      <FieldLabel>Motivo del ajuste (obligatorio)</FieldLabel>
      <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: Conteo físico, rotura, corrección de carga" className={inputClass} />

      <button
        disabled={!valido || guardando}
        onClick={() => onConfirm({ nuevoValor: nuevo, motivo: motivo.trim() })}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-sans text-[15px] font-bold disabled:cursor-not-allowed"
        style={{ backgroundColor: valido && !guardando ? "#C77D14" : "#DCE2E8", color: valido && !guardando ? "#fff" : "#8A97A3" }}
      >
        <Check size={18} /> {guardando ? "Guardando…" : "Confirmar ajuste"}
      </button>
    </Modal>
  );
}
