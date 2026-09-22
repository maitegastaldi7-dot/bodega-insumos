// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { FieldLabel, Modal, inputClass } from "@/components/ui/Modal";
import { useInsumos } from "@/hooks/useInsumos";
import { formatNum, normalizeCode } from "@/lib/format";
import { CATEGORIAS, type Categoria, type EditarInsumoInput, type Insumo, type NuevoInsumoInput, type Proveedor } from "@/types";
import { Check, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ProveedoresEditor } from "./ProveedoresEditor";

interface InsumoFormModalProps {
  mode: "crear" | "editar";
  insumo: Insumo | null;
  usuario: string;
  onClose: () => void;
  onSave: (payload: NuevoInsumoInput | EditarInsumoInput) => void;
  guardando: boolean;
  errorMensaje: string | null;
}

export function InsumoFormModal({ mode, insumo, usuario, onClose, onSave, guardando, errorMensaje }: InsumoFormModalProps) {
  const esEdicion = mode === "editar";
  const { data: todosLosInsumos = [] } = useInsumos({ activo: "true" });

  const [categoria, setCategoria] = useState<Categoria>(insumo?.categoria ?? CATEGORIAS[0]);
  const [descripcion, setDescripcion] = useState(insumo?.descripcion ?? "");
  const [codigoInterno, setCodigoInterno] = useState(insumo?.codigoInterno ?? "");
  const [codigoBarras, setCodigoBarras] = useState(insumo?.codigoBarras ?? "");
  const [codigoBusqueda, setCodigoBusqueda] = useState(insumo?.codigoBusqueda ?? "");
  const [tipo, setTipo] = useState(insumo?.tipo ?? "");
  const [color, setColor] = useState(insumo?.color ?? "");
  const [dimensiones, setDimensiones] = useState(insumo?.dimensiones ?? "");
  const [proveedores, setProveedores] = useState<Proveedor[]>(insumo?.proveedores ?? []);
  const [stockSistema, setStockSistema] = useState(insumo?.stockSistema !== undefined ? String(insumo.stockSistema) : "0");
  const [stockPiso, setStockPiso] = useState(insumo?.stockPiso !== null && insumo?.stockPiso !== undefined ? String(insumo.stockPiso) : "");
  const [stockMinimo, setStockMinimo] = useState(insumo?.stockMinimo !== null && insumo?.stockMinimo !== undefined ? String(insumo.stockMinimo) : "");
  const [motivo, setMotivo] = useState("");

  const duplicado = useMemo(() => {
    const norm = normalizeCode(codigoInterno);
    if (!norm) return null;
    return todosLosInsumos.find((i) => i.id !== insumo?.id && normalizeCode(i.codigoInterno) === norm) ?? null;
  }, [codigoInterno, todosLosInsumos, insumo]);

  const valido = descripcion.trim() && codigoInterno.trim() && !duplicado && (!esEdicion || motivo.trim());

  function guardar() {
    const base = {
      categoria,
      descripcion: descripcion.trim(),
      codigoInterno: codigoInterno.trim(),
      codigoBarras: codigoBarras.trim() || null,
      codigoBusqueda: codigoBusqueda.trim() || null,
      tipo: tipo.trim() || null,
      color: color.trim() || null,
      dimensiones: dimensiones.trim() || null,
      proveedores: proveedores.filter((p) => (p.nombre && p.nombre.trim()) || (p.codigo && p.codigo.trim())),
      stockMinimo: stockMinimo === "" ? null : parseFloat(stockMinimo),
      usuario,
    };
    if (esEdicion) {
      onSave({ ...base, motivo: motivo.trim() });
    } else {
      onSave({ ...base, stockSistema: stockSistema === "" ? 0 : parseFloat(stockSistema), stockPiso: stockPiso === "" ? null : parseFloat(stockPiso) });
    }
  }

  return (
    <Modal onClose={onClose} title={esEdicion ? "Editar Insumo" : "Nuevo Insumo"} icon={esEdicion ? Pencil : Plus} width={600}>
      {errorMensaje && (
        <div className="mb-4 rounded-lg bg-danger-soft px-3.5 py-2.5 font-sans text-[13px] font-semibold text-danger">{errorMensaje}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Categoría</FieldLabel>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)} className={inputClass}>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Descripción</FieldLabel>
          <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Botella Bordelesa 750ml" className={inputClass} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Código Interno</FieldLabel>
          <input
            value={codigoInterno}
            onChange={(e) => setCodigoInterno(e.target.value)}
            className={`${inputClass} font-mono`}
            style={{ borderColor: duplicado ? "#C13B2A" : undefined }}
          />
          {duplicado && (
            <div className="mt-1 font-sans text-[11.5px] text-danger">
              Ya existe: "{duplicado.descripcion}" ({duplicado.categoria})
            </div>
          )}
        </div>
        <div>
          <FieldLabel>Código Interno Barras</FieldLabel>
          <input value={codigoBarras ?? ""} onChange={(e) => setCodigoBarras(e.target.value)} className={`${inputClass} font-mono`} placeholder="Opcional" />
          <div className="mt-1 font-sans text-[11px] text-text-muted">Se usa para generar el código de barras gráfico de la ficha.</div>
        </div>
      </div>

      <div className="mt-4">
        <FieldLabel>Código de Búsqueda (opcional)</FieldLabel>
        <input value={codigoBusqueda ?? ""} onChange={(e) => setCodigoBusqueda(e.target.value)} className={`${inputClass} max-w-[220px] font-mono`} />
      </div>

      <div className="mt-4">
        <FieldLabel>Atributos adicionales (opcional)</FieldLabel>
        <div className="grid grid-cols-3 gap-3">
          <input value={tipo ?? ""} onChange={(e) => setTipo(e.target.value)} placeholder="Tipo" className={inputClass} />
          <input value={color ?? ""} onChange={(e) => setColor(e.target.value)} placeholder="Color" className={inputClass} />
          <input value={dimensiones ?? ""} onChange={(e) => setDimensiones(e.target.value)} placeholder="Dimensiones" className={inputClass} />
        </div>
      </div>

      <div className="mt-4">
        <FieldLabel>Proveedores — Nombre y Código de Proveedor (distinto del Código Interno)</FieldLabel>
        <ProveedoresEditor proveedores={proveedores} onChange={setProveedores} />
      </div>

      {!esEdicion ? (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div><FieldLabel>Stock Sistema inicial</FieldLabel><input type="number" value={stockSistema} onChange={(e) => setStockSistema(e.target.value)} className={`${inputClass} font-mono`} /></div>
          <div><FieldLabel>Stock Piso inicial</FieldLabel><input type="number" value={stockPiso} onChange={(e) => setStockPiso(e.target.value)} className={`${inputClass} font-mono`} placeholder="Opcional" /></div>
          <div><FieldLabel>Stock Mínimo</FieldLabel><input type="number" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} className={`${inputClass} font-mono`} placeholder="Opcional" /></div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <FieldLabel>Stock Sistema</FieldLabel>
              <div className={`${inputClass} bg-bg font-mono text-text-muted`}>{formatNum(insumo?.stockSistema)}</div>
            </div>
            <div>
              <FieldLabel>Stock Piso</FieldLabel>
              <div className={`${inputClass} bg-bg font-mono text-text-muted`}>{formatNum(insumo?.stockPiso)}</div>
            </div>
            <div><FieldLabel>Stock Mínimo</FieldLabel><input type="number" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} className={`${inputClass} font-mono`} placeholder="Opcional" /></div>
          </div>
          <div className="mt-1.5 font-sans text-[11px] text-text-muted">
            Para modificar Stock Sistema o Stock Piso usá "Ajustar stock" o "Registrar recepción" desde la ficha.
          </div>
        </div>
      )}

      {esEdicion && (
        <div className="mt-4">
          <FieldLabel>Motivo del cambio (obligatorio)</FieldLabel>
          <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: Corrección de descripción según remito" className={inputClass} />
        </div>
      )}

      <button
        disabled={!valido || guardando}
        onClick={guardar}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-sans text-[15px] font-bold text-white disabled:cursor-not-allowed"
        style={{ backgroundColor: valido && !guardando ? "#1868A0" : "#DCE2E8", color: valido && !guardando ? "#fff" : "#8A97A3" }}
      >
        <Check size={18} /> {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear insumo"}
      </button>
    </Modal>
  );
}
