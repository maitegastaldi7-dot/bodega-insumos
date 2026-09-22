import { AlertCircle, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ESTADO_STOCK_META, estadoStock, type InsumoReal } from "../types/insumo.types";

function formatNum(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("es-AR").format(n);
}

interface InsumoTableProps {
  insumos: InsumoReal[];
  cargando: boolean;
  error: string | null;
  onSelect: (insumo: InsumoReal) => void;
}

export function InsumoTable({ insumos, cargando, error, onSelect }: InsumoTableProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-12">
        <AlertCircle size={26} color="#C13B2A" />
        <p className="max-w-md text-center font-sans text-[13.5px] text-danger">{error}</p>
        <p className="max-w-md text-center font-sans text-[12px] text-text-muted">
          Revisá la conexión con Supabase (URL / Publishable Key) y las políticas RLS de la tabla.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg">
              {["Descripción", "Código Interno", "Código de Barras", "Proveedor", "Código Proveedor", "Stock", "Recepción", "Estado"].map((h) => (
                <th key={h} className="whitespace-nowrap border-b border-border px-4 py-3 text-left font-sans text-[11px] font-bold uppercase tracking-wide text-text-secondary">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center font-sans text-[13px] text-text-muted">Cargando desde Supabase…</td></tr>
            ) : (
              insumos.map((i) => {
                const est = estadoStock(i);
                const meta = ESTADO_STOCK_META[est];
                return (
                  <tr key={i.id} onClick={() => onSelect(i)} className="cursor-pointer border-b border-border hover:bg-bg">
                    <td className="max-w-[260px] px-4 py-3.5 font-sans text-[13.5px] font-semibold text-text-primary">{i.descripcion ?? "—"}</td>
                    <td className="px-4 py-3.5 font-mono text-[12.5px] text-text-muted">{i.codigoInterno ?? "—"}</td>
                    <td className="px-4 py-3.5 font-mono text-[12.5px] text-text-muted">{i.codigoBarras ?? "—"}</td>
                    <td className="px-4 py-3.5 font-sans text-[13px] text-text-secondary">{i.proveedor ?? i.nombreProveedor ?? "—"}</td>
                    <td className="px-4 py-3.5 font-mono text-[12.5px] text-text-secondary">{i.codigoProveedor ?? "—"}</td>
                    <td className="px-4 py-3.5 font-mono text-sm font-bold text-text-primary">{formatNum(i.stock)}</td>
                    <td className="px-4 py-3.5 font-mono text-[13px] text-text-secondary">{formatNum(i.recepcion)}</td>
                    <td className="px-4 py-3.5"><Badge label={meta.label} color={meta.color} soft={meta.soft} pulse={est === "sin_stock"} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {!cargando && insumos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Package size={28} color="#8A97A3" />
          <p className="mt-2.5 font-sans text-[13.5px] text-text-secondary">Esta tabla no devolvió filas desde Supabase.</p>
        </div>
      )}
    </div>
  );
}
