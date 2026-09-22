import { Info, Truck } from "lucide-react";

export function RecepcionesInfoPage() {
  return (
    <div className="p-6">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
          <Truck size={20} color="#1868A0" />
        </div>
        <h3 className="font-display text-lg font-bold text-text-primary">Registrar una recepción</h3>
        <p className="mt-2 max-w-xl font-sans text-[13.5px] leading-relaxed text-text-secondary">
          Por ahora, las recepciones se registran directamente desde la <strong>ficha de cada insumo</strong>
          (sección Insumos → tocá una fila → "Registrar recepción"). Eso hace un <code>UPDATE</code> real en
          Supabase, sumando la cantidad recibida a las columnas <code>stock</code> y <code>recepcion</code> de
          esa tabla.
        </p>
        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-accent-soft px-4 py-3">
          <Info size={16} color="#1868A0" className="mt-0.5 shrink-0" />
          <p className="font-sans text-[12.5px] leading-relaxed text-text-secondary">
            Lo que falta para tener acá un <strong>historial</strong> de recepciones (quién, cuándo, cuánto, por
            insumo) es una tabla nueva de registro — no existe en tu esquema actual y no la creamos sin
            confirmación tuya, para no modificar tu base sin avisarte. Decime si querés que la agreguemos y con
            qué columnas.
          </p>
        </div>
      </div>
    </div>
  );
}
