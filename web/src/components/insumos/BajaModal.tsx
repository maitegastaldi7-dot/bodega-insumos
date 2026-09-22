// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { CatBadge } from "@/components/ui/Badge";
import { FieldLabel, Modal, inputClass } from "@/components/ui/Modal";
import type { Insumo } from "@/types";
import { Check, Info, PackageCheck, PackageX } from "lucide-react";
import { useState } from "react";

interface BajaModalProps {
  insumo: Insumo;
  aBaja: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  guardando: boolean;
}

export function BajaModal({ insumo, aBaja, onClose, onConfirm, guardando }: BajaModalProps) {
  const [motivo, setMotivo] = useState("");
  const valido = motivo.trim().length > 0;

  return (
    <Modal onClose={onClose} title={aBaja ? "Dar de baja el insumo" : "Dar de alta el insumo"} icon={aBaja ? PackageX : PackageCheck} width={460}>
      <div className="mb-5 rounded-xl bg-bg px-4 py-3.5">
        <CatBadge categoria={insumo.categoria} />
        <div className="mt-1.5 font-display text-base font-bold text-text-primary">{insumo.descripcion}</div>
        <div className="mt-0.5 font-mono text-[11.5px] text-text-muted">{insumo.codigoInterno}</div>
      </div>
      <div className="mb-4 flex items-start gap-2.5 rounded-xl px-3.5 py-3" style={{ backgroundColor: aBaja ? "#FAE4E0" : "#E2F4EA" }}>
        <Info size={16} color={aBaja ? "#C13B2A" : "#1D8A5C"} className="mt-0.5 shrink-0" />
        <span className="font-sans text-xs leading-relaxed text-text-secondary">
          {aBaja
            ? "El insumo dejará de aparecer en el catálogo activo, pero su historial y datos se conservan intactos."
            : "El insumo vuelve a aparecer en el catálogo activo."}
        </span>
      </div>
      <FieldLabel>Motivo (obligatorio)</FieldLabel>
      <input
        autoFocus
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder={aBaja ? "Ej: Insumo discontinuado" : "Ej: Vuelve a utilizarse"}
        className={inputClass}
      />
      <button
        disabled={!valido || guardando}
        onClick={() => onConfirm(motivo.trim())}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-sans text-[15px] font-bold disabled:cursor-not-allowed"
        style={{ backgroundColor: valido && !guardando ? (aBaja ? "#C13B2A" : "#1D8A5C") : "#DCE2E8", color: valido && !guardando ? "#fff" : "#8A97A3" }}
      >
        <Check size={18} /> {guardando ? "Guardando…" : "Confirmar"}
      </button>
    </Modal>
  );
}
