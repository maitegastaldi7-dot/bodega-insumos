// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { Badge, CatBadge } from "@/components/ui/Badge";
import { useInsumos } from "@/hooks/useInsumos";
import { ESTADO_STOCK_META, estadoStock, formatNum } from "@/lib/format";
import { Info, PackageCheck } from "lucide-react";
import { useMemo } from "react";

interface AlertasViewProps {
  onVerFicha: (id: string) => void;
}

export function AlertasView({ onVerFicha }: AlertasViewProps) {
  const { data: insumos = [] } = useInsumos({ activo: "true" });

  const conMinimo = insumos.filter((i) => i.stockMinimo !== null);
  const sinMinimo = insumos.length - conMinimo.length;
  const enAlerta = useMemo(
    () => conMinimo.filter((i) => estadoStock(i) !== "ok").sort((a, b) => a.stockSistema - b.stockSistema),
    [conMinimo]
  );

  return (
    <div className="p-6">
      <div className="mb-5 flex items-start gap-3 rounded-xl bg-accent-soft px-4 py-3.5" style={{ border: "1px solid rgba(24,104,160,0.2)" }}>
        <Info size={18} color="#1868A0" className="mt-0.5 shrink-0" />
        <div className="font-sans text-[12.5px] leading-relaxed text-text-secondary">
          Alertas calculadas en vivo (StockSistema ≤ Stock Mínimo). <strong>{sinMinimo} insumos</strong> no tienen stock mínimo
          definido — no generan alerta hasta que se les cargue un mínimo desde su ficha.
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg">
              {["Categoría", "Descripción", "Código Interno", "Stock Actual", "Stock Mínimo", "Estado"].map((h) => (
                <th key={h} className="border-b border-border px-4 py-3 text-left font-sans text-[11px] font-bold uppercase tracking-wide text-text-secondary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enAlerta.map((i) => {
              const est = estadoStock(i);
              const meta = ESTADO_STOCK_META[est];
              return (
                <tr key={i.id} onClick={() => onVerFicha(i.id)} className="cursor-pointer border-b border-border hover:bg-bg">
                  <td className="px-4 py-3.5"><CatBadge categoria={i.categoria} /></td>
                  <td className="px-4 py-3.5 font-sans text-[13.5px] font-semibold text-text-primary">{i.descripcion}</td>
                  <td className="px-4 py-3.5 font-mono text-[12.5px] text-text-muted">{i.codigoInterno}</td>
                  <td className="px-4 py-3.5 font-mono text-[15px] font-bold" style={{ color: meta.color }}>{formatNum(i.stockSistema)}</td>
                  <td className="px-4 py-3.5 font-mono text-[13px] text-text-secondary">{formatNum(i.stockMinimo)}</td>
                  <td className="px-4 py-3.5"><Badge label="Pendiente" color={meta.color} soft={meta.soft} pulse={est === "sin_stock"} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {enAlerta.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <PackageCheck size={28} color="#1D8A5C" />
            <p className="mt-2.5 font-sans text-[13.5px] text-text-secondary">Ningún insumo con mínimo definido está por debajo de su umbral.</p>
          </div>
        )}
      </div>
    </div>
  );
}
