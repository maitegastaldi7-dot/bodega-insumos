import { inputClass } from "@/components/ui/Modal";
import type { Proveedor } from "@/types";
import { Plus, X } from "lucide-react";

interface ProveedoresEditorProps {
  proveedores: Proveedor[];
  onChange: (proveedores: Proveedor[]) => void;
}

export function ProveedoresEditor({ proveedores, onChange }: ProveedoresEditorProps) {
  const set = (i: number, campo: keyof Proveedor, v: string) =>
    onChange(proveedores.map((p, idx) => (idx === i ? { ...p, [campo]: v } : p)));
  const agregar = () => onChange([...proveedores, { nombre: "", codigo: "" }]);
  const quitar = (i: number) => onChange(proveedores.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex flex-col gap-2">
        {proveedores.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={p.nombre ?? ""}
              onChange={(e) => set(i, "nombre", e.target.value)}
              placeholder="Nombre del proveedor"
              className={`${inputClass} flex-[1.4]`}
            />
            <input
              value={p.codigo ?? ""}
              onChange={(e) => set(i, "codigo", e.target.value)}
              placeholder="Código de Proveedor"
              className={`${inputClass} flex-1 font-mono`}
            />
            <button onClick={() => quitar(i)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-danger hover:brightness-95">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={agregar} className="mt-2 flex items-center gap-1.5 font-sans text-[12.5px] font-bold text-accent">
        <Plus size={14} /> Agregar proveedor
      </button>
    </div>
  );
}
