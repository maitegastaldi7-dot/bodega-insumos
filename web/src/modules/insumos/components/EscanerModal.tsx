import { FieldLabel, Modal } from "@/components/ui/Modal";
import { AlertTriangle, Camera, Keyboard, ScanBarcode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useBuscarInsumoPorCodigo } from "../hooks/useInsumosPorCategoria";
import type { InsumoReal } from "../types/insumo.types";
import { CameraScanner } from "./CameraScanner";

interface EscanerModalProps {
  onClose: () => void;
  onEncontrado: (insumo: InsumoReal) => void;
}

/** Compatible con lector USB/Bluetooth (funciona como teclado: tipea y
 * dispara Enter) y con la cámara del dispositivo. Un código sin coincidencia
 * NUNCA crea un insumo nuevo — solo se informa que no se encontró. */
export function EscanerModal({ onClose, onEncontrado }: EscanerModalProps) {
  const [codigo, setCodigo] = useState("");
  const [noEncontrado, setNoEncontrado] = useState<string | null>(null);
  const [modo, setModo] = useState<"manual" | "camara">("manual");
  const inputRef = useRef<HTMLInputElement>(null);
  const buscar = useBuscarInsumoPorCodigo();

  useEffect(() => { if (modo === "manual") inputRef.current?.focus(); }, [modo]);

  function ejecutarBusqueda(raw: string) {
    if (!raw.trim()) return;
    buscar.mutate(raw, {
      onSuccess: (res) => {
        if (res.encontrado) { setNoEncontrado(null); onEncontrado(res.insumo); }
        else setNoEncontrado(raw);
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
          <Keyboard size={16} /> Lector USB / Manual
        </button>
      </div>

      {modo === "camara" && (
        <div className="mb-4">
          <CameraScanner onDetected={(code) => { setCodigo(code); ejecutarBusqueda(code); }} onCancel={() => setModo("manual")} />
        </div>
      )}

      {modo === "manual" && (
        <>
          <FieldLabel>Escaneá con el lector (funciona como teclado) o escribí el código</FieldLabel>
          <div className="mb-2 flex items-center gap-2 rounded-xl border-[1.5px] border-accent bg-accent-soft py-1 pl-3.5 pr-1">
            <ScanBarcode size={20} color="#1868A0" />
            <input
              ref={inputRef}
              value={codigo}
              onChange={(e) => { setCodigo(e.target.value); setNoEncontrado(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") ejecutarBusqueda(codigo); }}
              placeholder="Código interno, de barras o de proveedor…"
              className="flex-1 bg-transparent py-3.5 font-mono text-base outline-none"
            />
            <button onClick={() => ejecutarBusqueda(codigo)} className="rounded-lg bg-accent px-4 py-2.5 font-sans text-[13.5px] font-bold text-white">
              Buscar
            </button>
          </div>
        </>
      )}

      <p className="mb-3.5 font-sans text-[12.5px] text-text-muted">
        Se busca en <code>codigo_interno</code>, <code>codigo_interno_barras</code> y <code>codigo_proveedor</code>, en las 8 tablas reales de Supabase.
      </p>

      {buscar.isPending && <p className="font-sans text-[12.5px] text-text-muted">Consultando Supabase…</p>}

      {noEncontrado && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3.5" style={{ backgroundColor: "#FAE4E0", border: "1px solid rgba(193,59,42,0.2)" }}>
          <AlertTriangle size={19} color="#C13B2A" className="mt-0.5 shrink-0" />
          <div>
            <div className="font-sans text-sm font-bold text-danger">Código no encontrado</div>
            <div className="mt-0.5 font-mono text-xs text-danger">"{noEncontrado}"</div>
            <div className="mt-1.5 font-sans text-[12.5px] text-text-secondary">
              No se creó ningún insumo nuevo. Verificá el código, o puede que la búsqueda haya fallado por conexión/RLS.
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
