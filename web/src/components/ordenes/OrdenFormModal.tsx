// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { CatBadge } from "@/components/ui/Badge";
import { FieldLabel, Modal, inputClass } from "@/components/ui/Modal";
import { useInsumos } from "@/hooks/useInsumos";
import type { NuevaOrdenInput } from "@/hooks/useOrdenes";
import { formatNum } from "@/lib/format";
import { Check, ClipboardList, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

interface OrdenFormModalProps {
  onClose: () => void;
  onSave: (input: NuevaOrdenInput) => void;
  guardando: boolean;
}

interface Linea {
  insumoId: string;
  cantidadNecesaria: string;
}

export function OrdenFormModal({ onClose, onSave, guardando }: OrdenFormModalProps) {
  const { data: insumos = [] } = useInsumos({ activo: "true" });
  const [codigo, setCodigo] = useState(`OP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`);
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [buscar, setBuscar] = useState("");

  const sugerencias = useMemo(() => {
    if (buscar.length < 2) return [];
    const q = buscar.toLowerCase();
    return insumos.filter((i) => !lineas.some((l) => l.insumoId === i.id) && i.descripcion.toLowerCase().includes(q)).slice(0, 6);
  }, [buscar, insumos, lineas]);

  const agregar = (insumoId: string) => { setLineas((l) => [...l, { insumoId, cantidadNecesaria: "" }]); setBuscar(""); };
  const quitar = (id: string) => setLineas((l) => l.filter((x) => x.insumoId !== id));
  const setCant = (id: string, v: string) => setLineas((l) => l.map((x) => (x.insumoId === id ? { ...x, cantidadNecesaria: v } : x)));

  const valido = producto.trim() && cantidad !== "" && lineas.length > 0 && lineas.every((l) => parseFloat(l.cantidadNecesaria) > 0);

  function guardar() {
    onSave({
      codigo,
      producto: producto.trim(),
      cantidad: parseFloat(cantidad) || 0,
      insumos: lineas.map((l) => ({ insumoId: l.insumoId, cantidadNecesaria: parseFloat(l.cantidadNecesaria) || 0 })),
    });
  }

  return (
    <Modal onClose={onClose} title="Nueva Orden de Producción" icon={ClipboardList} width={580}>
      <div className="grid grid-cols-2 gap-4">
        <div><FieldLabel>Código de orden</FieldLabel><input value={codigo} onChange={(e) => setCodigo(e.target.value)} className={`${inputClass} font-mono`} /></div>
        <div><FieldLabel>Cantidad a producir</FieldLabel><input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className={`${inputClass} font-mono`} /></div>
      </div>
      <div className="mt-4"><FieldLabel>Producto</FieldLabel><input value={producto} onChange={(e) => setProducto(e.target.value)} placeholder="Ej: Vino Tinto Reserva 750ml x12" className={inputClass} /></div>

      <div className="mt-5">
        <FieldLabel>Insumos necesarios (busca en las 8 categorías)</FieldLabel>
        <div className="relative">
          <input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar insumo para agregar…" className={inputClass} />
          {sugerencias.length > 0 && (
            <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
              {sugerencias.map((i) => (
                <button key={i.id} onClick={() => agregar(i.id)} className="flex w-full items-center justify-between px-3.5 py-2.5 text-left hover:bg-bg">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[13.5px] font-semibold text-text-primary">{i.descripcion}</span>
                    <CatBadge categoria={i.categoria} />
                  </div>
                  <Plus size={15} color="#1868A0" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {lineas.map((l) => {
            const ins = insumos.find((i) => i.id === l.insumoId);
            return (
              <div key={l.insumoId} className="flex items-center gap-3 rounded-xl bg-bg px-3 py-2.5">
                <div className="flex-1">
                  <div className="font-sans text-[13.5px] font-semibold text-text-primary">{ins?.descripcion}</div>
                  <div className="font-mono text-[11px] text-text-muted">Disponible: {formatNum(ins?.stockSistema)}</div>
                </div>
                <input
                  type="number"
                  value={l.cantidadNecesaria}
                  onChange={(e) => setCant(l.insumoId, e.target.value)}
                  placeholder="Cantidad"
                  className="w-[110px] rounded-lg border-[1.5px] border-border px-2.5 py-2 font-mono text-[13.5px]"
                />
                <button onClick={() => quitar(l.insumoId)} className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg text-danger">
                  <X size={16} />
                </button>
              </div>
            );
          })}
          {lineas.length === 0 && <p className="px-0.5 py-1.5 font-sans text-[12.5px] text-text-muted">Todavía no agregaste insumos a esta orden.</p>}
        </div>
      </div>

      <button
        disabled={!valido || guardando}
        onClick={guardar}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-sans text-[15px] font-bold disabled:cursor-not-allowed"
        style={{ backgroundColor: valido && !guardando ? "#1868A0" : "#DCE2E8", color: valido && !guardando ? "#fff" : "#8A97A3" }}
      >
        <Check size={18} /> {guardando ? "Creando…" : "Crear orden — insumos quedan en estado Pendiente"}
      </button>
    </Modal>
  );
}
