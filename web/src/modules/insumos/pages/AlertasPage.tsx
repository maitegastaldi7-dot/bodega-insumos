import { Info, PackageCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { FichaInsumoModal } from "../components/FichaInsumoModal";
import { useInsumosTodasLasTablas } from "../hooks/useInsumosPorCategoria";
import { ESTADO_STOCK_META, TABLA_LABEL, estadoStock, type InsumoReal } from "../types/insumo.types";

function formatNum(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("es-AR").format(n);
}

export function AlertasPage({ toast }: { toast: (msg: string, type?: "success" | "error") => void }) {
  const { data, isLoading } = useInsumosTodasLasTablas();
  const [ficha, setFicha] = useState<InsumoReal | null>(null);

  const todos = useMemo(() => (data ? Object.values(data.datos).flat() : []), [data]);
  const conMinimo = todos.filter((i) => i.stockMinimo !== undefined);
  const sinMinimo = todos.length - conMinimo.length;
  const enAlerta = useMemo(
    () => [...todos.filter((i) => estadoStock(i) === "sin_stock"), ...conMinimo.filter((i) => estadoStock(i) === "bajo")]
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)),
    [todos, conMinimo]
  );

  return (
    <div className="p-6">
      <div className="mb-5 flex items-start gap-3 rounded-xl bg-accent-soft px-4 py-3.5" style={{ border: "1px solid rgba(24,104,160,0.2)" }}>
        <Info size={18} color="#1868A0" className="mt-0.5 shrink-0" />
        <div className="font-sans text-[12.5px] leading-relaxed text-text-secondary">
          Alertas calculadas en vivo desde Supabase (<code>stock ≤ stock_minimo</code>). <strong>{sinMinimo} insumos</strong> no tienen
          la columna <code>stock_minimo</code> configurada en su tabla y no generan alerta por ahora.
        </div>
      </div>

      {isLoading ? (
        <p className="font-sans text-[13px] text-text-muted">Cargando…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bg">
                {["Categoría", "Descripción", "Código Interno", "Stock", "Mínimo", "Estado"].map((h) => (
                  <th key={h} className="border-b border-border px-4 py-3 text-left font-sans text-[11px] font-bold uppercase tracking-wide text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enAlerta.map((i) => {
                const meta = ESTADO_STOCK_META[estadoStock(i)];
                return (
                  <tr key={i.id} onClick={() => setFicha(i)} className="cursor-pointer border-b border-border hover:bg-bg">
                    <td className="px-4 py-3.5 font-sans text-[12px] font-bold uppercase text-text-secondary">{TABLA_LABEL[i.tabla]}</td>
                    <td className="px-4 py-3.5 font-sans text-[13.5px] font-semibold text-text-primary">{i.descripcion}</td>
                    <td className="px-4 py-3.5 font-mono text-[12.5px] text-text-muted">{i.codigoInterno}</td>
                    <td className="px-4 py-3.5 font-mono text-[15px] font-bold" style={{ color: meta.color }}>{formatNum(i.stock)}</td>
                    <td className="px-4 py-3.5 font-mono text-[13px] text-text-secondary">{formatNum(i.stockMinimo)}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold" style={{ backgroundColor: meta.soft, color: meta.color }}>{meta.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {enAlerta.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <PackageCheck size={28} color="#1D8A5C" />
              <p className="mt-2.5 font-sans text-[13.5px] text-text-secondary">Ningún insumo con mínimo configurado está por debajo de su umbral.</p>
            </div>
          )}
        </div>
      )}

      {ficha && <FichaInsumoModal insumo={ficha} onClose={() => setFicha(null)} onEscanear={() => setFicha(null)} notify={toast} />}
    </div>
  );
}
