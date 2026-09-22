// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { Modal } from "@/components/ui/Modal";
import { useInsumos } from "@/hooks/useInsumos";
import { useRecepciones } from "@/hooks/useRecepciones";
import { formatFecha, formatNum } from "@/lib/format";
import { Image as ImageIcon, ScanBarcode, Truck } from "lucide-react";
import { useMemo, useState } from "react";

interface RecepcionesViewProps {
  onNuevaRecepcion: () => void;
}

export function RecepcionesView({ onNuevaRecepcion }: RecepcionesViewProps) {
  const { data: recepciones = [] } = useRecepciones();
  const { data: insumos = [] } = useInsumos();
  const [verFoto, setVerFoto] = useState<string | null>(null);

  const ordenadas = useMemo(() => [...recepciones].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()), [recepciones]);
  const insumoOf = (id: string | null) => insumos.find((i) => i.id === id);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-sans text-[13.5px] text-text-secondary">Historial de recepciones de insumos. Cada recepción incrementa el stock de sistema.</p>
        <button onClick={onNuevaRecepcion} className="flex shrink-0 items-center gap-2 rounded-xl bg-accent px-[18px] py-3 font-sans text-sm font-bold text-white hover:brightness-110">
          <ScanBarcode size={18} /> Nueva Recepción
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg">
              {["Fecha", "Insumo", "Cantidad recibida", "Usuario", "Remito"].map((h) => (
                <th key={h} className="border-b border-border px-4 py-3 text-left font-sans text-[11px] font-bold uppercase tracking-wide text-text-secondary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((r) => {
              const ins = insumoOf(r.insumoId);
              return (
                <tr key={r.id} className="border-b border-border hover:bg-bg">
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[12.5px] text-text-secondary">{formatFecha(r.fecha)}</td>
                  <td className="px-4 py-3.5 font-sans text-[13.5px] font-semibold text-text-primary">{ins?.descripcion ?? "—"}</td>
                  <td className="px-4 py-3.5 font-mono text-sm font-bold text-success">+{formatNum(r.cantidad)}</td>
                  <td className="px-4 py-3.5 font-sans text-[13px] text-text-secondary">{r.usuario ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    {r.fotoUrl ? (
                      <button className="flex items-center gap-1.5 font-sans text-[12.5px] font-semibold text-accent" onClick={() => setVerFoto(r.fotoUrl)}>
                        <ImageIcon size={14} /> Ver remito
                      </button>
                    ) : (
                      <span className="font-sans text-[12.5px] text-text-muted">Sin foto</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {ordenadas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Truck size={28} color="#8A97A3" />
            <p className="mt-2.5 font-sans text-[13.5px] text-text-secondary">Todavía no hay recepciones registradas.</p>
          </div>
        )}
      </div>

      {verFoto && (
        <Modal onClose={() => setVerFoto(null)} title="Foto del remito" icon={ImageIcon} width={480}>
          <img src={verFoto} alt="Remito" className="w-full rounded-[10px]" />
        </Modal>
      )}
    </div>
  );
}
