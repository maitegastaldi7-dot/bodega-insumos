import { TABLAS_INSUMOS, TABLA_LABEL, type TablaInsumo } from "../types/insumo.types";

interface CategoriaTabsProps {
  activa: TablaInsumo;
  onChange: (tabla: TablaInsumo) => void;
}

export function CategoriaTabs({ activa, onChange }: CategoriaTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5">
      {TABLAS_INSUMOS.map((tabla) => {
        const active = activa === tabla;
        return (
          <button
            key={tabla}
            onClick={() => onChange(tabla)}
            className={`shrink-0 rounded-xl border px-4 py-2.5 font-sans text-[13px] font-bold ${
              active ? "border-ink-soft bg-ink-soft text-white" : "border-border bg-surface text-text-secondary"
            }`}
          >
            {TABLA_LABEL[tabla]}
          </button>
        );
      })}
    </div>
  );
}
