// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { CameraScanner } from "@/components/barcode/CameraScanner";
import { CatBadge } from "@/components/ui/Badge";
import { FieldLabel, Modal } from "@/components/ui/Modal";
import { useBuscarPorCodigo, useInsumos } from "@/hooks/useInsumos";
import type { Insumo } from "@/types";
import { AlertTriangle, Camera, ChevronRight, Keyboard, ScanBarcode } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface EscanerModalProps {
  onClose: () => void;
  onEncontrado: (insumo: Insumo) => void;
}

export function EscanerModal({ onClose, onEncontrado }: EscanerModalProps) {
  const [codigo, setCodigo] = useState("");
  const [noEncontrado, setNoEncontrado] = useState<string | null>(null);
  const [modo, setModo] = useState<"manual" | "camara">("manual");
  const inputRef = useRef<HTMLInputElement>(null);
  const buscarMutation = useBuscarPorCodigo();
  const { data: sugerenciasInsumos = [] } = useInsumos(codigo.length >= 2 ? { q: codigo } : undefined);

  useEffect(() => { if (modo === "manual") inputRef.current?.focus(); }, [modo]);

  function buscar(raw: string) {
    buscarMutation.mutate(raw, {
      onSuccess: (res) => {
        if (res.encontrado) {
          setNoEncontrado(null);
          onEncontrado(res.insumo);
        } else {
          setNoEncontrado(raw);
        }
      },
    });
  }

  return (
    <Modal onClose={onClose} title="Escanear Código" icon={ScanBarcode} width={520}>
      <div className="mb-4 flex overflow-hidden rounded-xl border-[1.5px] border-border">
        <button
          onClick={() => setModo("camara")}
          className={`flex flex-1 items-center justify-center gap-2 py-2.5 font-sans text-[13.5px] font-bold ${modo === "camara" ? "bg-ink-soft text-white" : "bg-surface text-text-secondary"}`}
        >
          <Camera size={16} /> Cámara / Celular
        </button>
        <button
          onClick={() => setModo("manual")}
          className={`flex flex-1 items-center justify-center gap-2 py-2.5 font-sans text-[13.5px] font-bold ${modo === "manual" ? "bg-ink-soft text-white" : "bg-surface text-text-secondary"}`}
        >
          <Keyboard size={16} /> Lector / Manual
        </button>
      </div>

      {modo === "camara" && (
        <div className="mb-4">
          <CameraScanner onDetected={(code) => { setCodigo(code); buscar(code); }} onCancel={() => setModo("manual")} />
        </div>
      )}

      {modo === "manual" && (
        <>
          <FieldLabel>Escaneá con un lector físico (se comporta como teclado) o escribí para buscar</FieldLabel>
          <div className="mb-2 flex items-center gap-2 rounded-xl border-[1.5px] border-accent bg-accent-soft py-1 pl-3.5 pr-1">
            <ScanBarcode size={20} color="#1868A0" />
            <input
              ref={inputRef}
              value={codigo}
              onChange={(e) => { setCodigo(e.target.value); setNoEncontrado(null); }}
              onKeyDown={(e) => { if (e.key === "Enter" && codigo.trim()) buscar(codigo); }}
              placeholder="Código de barras o descripción…"
              className="flex-1 bg-transparent py-3.5 font-mono text-base outline-none"
            />
            <button
              onClick={() => codigo.trim() && buscar(codigo)}
              className="rounded-lg bg-accent px-4 py-2.5 font-sans text-[13.5px] font-bold text-white"
            >
              Buscar
            </button>
          </div>
        </>
      )}

      <p className="mb-3.5 font-sans text-[12.5px] text-text-muted">
        Se busca en código interno, código de barras, código de proveedor y código de búsqueda — de todas las categorías.
      </p>

      {noEncontrado && (
        <div className="mb-3 flex items-start gap-3 rounded-xl px-4 py-3.5" style={{ backgroundColor: "#FAE4E0", border: "1px solid rgba(193,59,42,0.2)" }}>
          <AlertTriangle size={19} color="#C13B2A" className="mt-0.5 shrink-0" />
          <div>
            <div className="font-sans text-sm font-bold text-danger">Código no encontrado</div>
            <div className="mt-0.5 font-mono text-xs text-danger">"{noEncontrado}"</div>
            <div className="mt-1.5 font-sans text-[12.5px] text-text-secondary">
              No se creó ningún insumo nuevo. Verificá el código o buscá manualmente por descripción.
            </div>
          </div>
        </div>
      )}

      {modo === "manual" && sugerenciasInsumos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          {sugerenciasInsumos.slice(0, 5).map((i) => (
            <button
              key={i.id}
              onClick={() => { setCodigo(i.codigoInterno); buscar(i.codigoInterno); }}
              className="flex w-full items-center justify-between border-b border-border px-3.5 py-3 text-left last:border-b-0 hover:bg-bg"
            >
              <div>
                <div className="font-sans text-sm font-semibold text-text-primary">{i.descripcion}</div>
                <div className="mt-0.5 flex items-center gap-2">
                  <CatBadge categoria={i.categoria} />
                  <span className="font-mono text-[11px] text-text-muted">{i.codigoInterno}</span>
                </div>
              </div>
              <ChevronRight size={17} color="#8A97A3" />
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
