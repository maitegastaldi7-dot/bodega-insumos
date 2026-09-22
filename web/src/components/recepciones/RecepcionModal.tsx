// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { CatBadge } from "@/components/ui/Badge";
import { FieldLabel, Modal } from "@/components/ui/Modal";
import { Keypad } from "@/components/ui/Keypad";
import { formatNum } from "@/lib/format";
import type { Insumo } from "@/types";
import { Camera, Check, Loader2, Truck, X } from "lucide-react";
import { useRef, useState } from "react";

interface RecepcionModalProps {
  insumo: Insumo;
  onClose: () => void;
  onConfirm: (input: { cantidad: number; fotoUrl: string | null }) => void;
  guardando: boolean;
}

export function RecepcionModal({ insumo, onClose, onConfirm, guardando }: RecepcionModalProps) {
  const [cantidad, setCantidad] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setFoto(canvas.toDataURL("image/jpeg", 0.6));
        setSubiendo(false);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  const puedeConfirmar = parseFloat(cantidad || "0") > 0;

  return (
    <Modal onClose={onClose} title="Registrar Recepción" icon={Truck} width={480}>
      <div className="mb-5 rounded-xl bg-bg px-4 py-3.5">
        <CatBadge categoria={insumo.categoria} />
        <div className="mt-1.5 font-display text-base font-bold text-text-primary">{insumo.descripcion}</div>
        <div className="mt-0.5 font-mono text-[11.5px] text-text-muted">{insumo.codigoInterno} · Stock actual: {formatNum(insumo.stockSistema)}</div>
      </div>

      <FieldLabel>Cantidad recibida</FieldLabel>
      <Keypad value={cantidad} onChange={setCantidad} unidad="unid" />

      <div className="mt-4">
        <FieldLabel>Foto del remito (opcional)</FieldLabel>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFoto} className="hidden" />
        {!foto ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-border py-3.5 font-sans text-[13.5px] font-semibold text-text-secondary"
          >
            {subiendo ? <Loader2 size={17} className="animate-spin" /> : <Camera size={17} />} {subiendo ? "Procesando…" : "Adjuntar foto del remito"}
          </button>
        ) : (
          <div className="relative">
            <img src={foto} alt="Remito" className="max-h-[180px] w-full rounded-[10px] border border-border object-cover" />
            <button onClick={() => setFoto(null)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white">
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      <button
        disabled={!puedeConfirmar || guardando}
        onClick={() => onConfirm({ cantidad: parseFloat(cantidad), fotoUrl: foto })}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-sans text-[15.5px] font-bold disabled:cursor-not-allowed"
        style={{ backgroundColor: puedeConfirmar && !guardando ? "#1868A0" : "#DCE2E8", color: puedeConfirmar && !guardando ? "#fff" : "#8A97A3" }}
      >
        <Check size={19} /> {guardando ? "Guardando…" : "Confirmar recepción"}
      </button>
    </Modal>
  );
}
