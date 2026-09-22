import { Badge } from "@/components/ui/Badge";
import { Keypad } from "@/components/ui/Keypad";
import { FieldLabel, Modal } from "@/components/ui/Modal";
import { Check, Info, Loader2, Printer, ScanBarcode, Truck } from "lucide-react";
import { useState } from "react";
import { useRegistrarRecepcion } from "../hooks/useInsumosPorCategoria";
import { generarYCompartirFichaPDF } from "../lib/pdf";
import { ESTADO_STOCK_META, TABLA_LABEL, estadoStock, type InsumoReal } from "../types/insumo.types";
import { BarcodeImage } from "./BarcodeImage";

function formatNum(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("es-AR").format(n);
}

interface FichaInsumoModalProps {
  insumo: InsumoReal;
  onClose: () => void;
  onEscanear: () => void;
  notify: (msg: string, type?: "success" | "error") => void;
}

export function FichaInsumoModal({ insumo, onClose, onEscanear, notify }: FichaInsumoModalProps) {
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [mostrarRecepcion, setMostrarRecepcion] = useState(false);
  const [cantidad, setCantidad] = useState("");
  const registrarRecepcion = useRegistrarRecepcion(insumo.tabla, insumo.id);

  const est = estadoStock(insumo);
  const meta = ESTADO_STOCK_META[est];
  const diff = insumo.stockPiso !== undefined && insumo.stockPiso !== null && insumo.stock !== null ? insumo.stock - insumo.stockPiso : null;

  function confirmarRecepcion() {
    const cant = parseFloat(cantidad);
    if (!cant || cant <= 0) return;
    registrarRecepcion.mutate(cant, {
      onSuccess: () => { notify(`Recepción de ${cant} unidades registrada.`); setMostrarRecepcion(false); setCantidad(""); },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : "No se pudo registrar la recepción.";
        notify(msg, "error");
      },
    });
  }

  return (
    <Modal onClose={onClose} title="Ficha de Insumo" icon={Info} width={620}>
      <div className="ficha-print-area">
        <div className="mb-5 rounded-xl bg-bg px-4 py-4">
          <span className="rounded-md bg-white px-2 py-[3px] font-sans text-[11px] font-bold uppercase tracking-wide text-text-secondary">
            {TABLA_LABEL[insumo.tabla]}
          </span>
          <div className="mt-2 font-display text-lg font-bold text-text-primary">{insumo.descripcion ?? "—"}</div>
          <div className="mt-1 font-mono text-xs text-text-muted">{insumo.codigoInterno ?? "sin código interno"}</div>
          <div className="mt-2"><Badge label={meta.label} color={meta.color} soft={meta.soft} pulse={est === "sin_stock"} /></div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border px-4 py-3.5">
            <div className="font-sans text-[11.5px] font-bold uppercase tracking-wide text-text-muted">Stock</div>
            <div className="mt-1 font-mono text-[22px] font-bold text-text-primary">{formatNum(insumo.stock)}</div>
          </div>
          <div className="rounded-xl border border-border px-4 py-3.5">
            <div className="font-sans text-[11.5px] font-bold uppercase tracking-wide text-text-muted">Recepción</div>
            <div className="mt-1 font-mono text-[22px] font-bold text-text-primary">{formatNum(insumo.recepcion)}</div>
          </div>
          <div className="rounded-xl border border-border px-4 py-3.5">
            <div className="font-sans text-[11.5px] font-bold uppercase tracking-wide text-text-muted">Stock Piso</div>
            <div className="mt-1 font-mono text-[22px] font-bold text-text-primary">
              {insumo.stockPiso === undefined ? <span className="text-[13px] font-semibold text-text-muted">No disponible en esta tabla</span> : formatNum(insumo.stockPiso)}
            </div>
          </div>
          <div className="rounded-xl border border-border px-4 py-3.5">
            <div className="font-sans text-[11.5px] font-bold uppercase tracking-wide text-text-muted">Stock Mínimo</div>
            <div className="mt-1 font-mono text-[22px] font-bold text-text-primary">
              {insumo.stockMinimo === undefined ? <span className="text-[13px] font-semibold text-text-muted">No disponible en esta tabla</span> : formatNum(insumo.stockMinimo)}
            </div>
          </div>
        </div>

        {diff !== null && (
          <div className="mb-5 font-sans text-[12.5px] text-text-secondary">
            Diferencia Stock − Stock Piso: <strong style={{ color: diff === 0 ? "#1D8A5C" : "#C13B2A" }}>{diff > 0 ? `+${formatNum(diff)}` : formatNum(diff)}</strong>
          </div>
        )}

        <div className="mb-2 font-sans text-[12.5px] font-bold uppercase tracking-wide text-text-secondary">Código de barras</div>
        <div className="mb-5">
          <BarcodeImage value={insumo.codigoBarras} />
        </div>
      </div>

      <div className="mb-2 font-sans text-[12.5px] font-bold uppercase tracking-wide text-text-secondary">Proveedor</div>
      <div className="mb-5 rounded-xl border border-border">
        {[
          ["Proveedor", insumo.proveedor],
          ["Nombre Proveedor", insumo.nombreProveedor],
          ["Código de Proveedor", insumo.codigoProveedor],
        ].map(([k, v], idx, arr) => (
          <div key={k} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: idx < arr.length - 1 ? "1px solid #DCE2E8" : "none" }}>
            <span className="font-sans text-[13px] text-text-secondary">{k}</span>
            <span className="font-mono text-[13px] font-semibold text-text-primary">{v || "—"}</span>
          </div>
        ))}
      </div>

      {mostrarRecepcion ? (
        <div className="mb-5 rounded-xl border border-border p-4">
          <FieldLabel>Cantidad recibida</FieldLabel>
          <Keypad value={cantidad} onChange={setCantidad} unidad="unid" />
          <div className="mt-3 flex gap-2">
            <button onClick={() => setMostrarRecepcion(false)} className="flex-1 rounded-xl border border-border py-3 font-sans text-[13.5px] font-bold text-text-secondary">Cancelar</button>
            <button
              disabled={registrarRecepcion.isPending || !cantidad}
              onClick={confirmarRecepcion}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 font-sans text-[13.5px] font-bold text-white disabled:bg-border disabled:text-text-muted"
            >
              <Check size={16} /> {registrarRecepcion.isPending ? "Guardando…" : "Confirmar"}
            </button>
          </div>
          <p className="mt-2 font-sans text-[11px] text-text-muted">
            Esto hace un UPDATE real en Supabase (suma a <code>stock</code> y a <code>recepcion</code>). Requiere que la política RLS de UPDATE lo permita para el rol anon.
          </p>
        </div>
      ) : (
        <div className="flex gap-2.5">
          <button onClick={() => setMostrarRecepcion(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-sans text-[13.5px] font-bold text-white">
            <Truck size={16} /> Registrar recepción
          </button>
          <button onClick={onEscanear} className="flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-border px-4 py-3.5 text-text-secondary">
            <ScanBarcode size={16} />
          </button>
          <button
            disabled={generandoPdf}
            onClick={async () => { setGenerandoPdf(true); await generarYCompartirFichaPDF(insumo, notify); setGenerandoPdf(false); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-[1.5px] border-border py-3.5 font-sans text-[13.5px] font-bold text-text-primary"
          >
            {generandoPdf ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} Imprimir / PDF
          </button>
        </div>
      )}
    </Modal>
  );
}
