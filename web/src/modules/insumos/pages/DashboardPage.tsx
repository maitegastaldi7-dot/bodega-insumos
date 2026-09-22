import { AlertTriangle, Boxes, Package, PackageCheck, PackageX, ScanBarcode, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DiagnosticoBanner } from "../components/DiagnosticoBanner";
import { EscanerModal } from "../components/EscanerModal";
import { FichaInsumoModal } from "../components/FichaInsumoModal";
import { useInsumosTodasLasTablas } from "../hooks/useInsumosPorCategoria";
import { ESTADO_STOCK_META, TABLA_LABEL, TABLAS_INSUMOS, estadoStock, type InsumoReal } from "../types/insumo.types";

function formatNum(n: number): string {
  return new Intl.NumberFormat("es-AR").format(n);
}

interface DashboardPageProps {
  onIrAInsumos: () => void;
  toast: (msg: string, type?: "success" | "error") => void;
}

export function DashboardPage({ onIrAInsumos, toast }: DashboardPageProps) {
  const { data, isLoading } = useInsumosTodasLasTablas();
  const [ficha, setFicha] = useState<InsumoReal | null>(null);
  const [escanerAbierto, setEscanerAbierto] = useState(false);

  const todos = useMemo(() => (data ? Object.values(data.datos).flat() : []), [data]);
  const bajoMinimo = todos.filter((i) => estadoStock(i) === "bajo");
  const sinStock = todos.filter((i) => estadoStock(i) === "sin_stock");
  const conMinimoConfigurado = todos.filter((i) => i.stockMinimo !== undefined).length;
  const totalPorTabla = TABLAS_INSUMOS.map((t) => ({ tabla: t, cantidad: data?.datos[t]?.length ?? 0 }));
  const errores = data ? Object.entries(data.errores) : [];

  return (
    <div className="p-6">
      <DiagnosticoBanner tabla="botellas" />

      {errores.length > 0 && (
        <div className="mb-4 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3">
          <div className="font-sans text-[12.5px] font-bold text-danger">Algunas tablas no se pudieron leer:</div>
          <ul className="mt-1 list-disc pl-5 font-sans text-[12px] text-text-secondary">
            {errores.map(([tabla, msg]) => <li key={tabla}><strong>{tabla}</strong>: {msg}</li>)}
          </ul>
        </div>
      )}

      <div className="mb-6 grid grid-cols-3 gap-4">
        <button onClick={onIrAInsumos} className="rounded-2xl border border-border bg-surface p-5 text-left hover:shadow-md">
          <div className="mb-3 flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-accent/10">
            <Package size={19} color="#1868A0" />
          </div>
          <div className="font-mono text-[28px] font-bold leading-none text-text-primary">{isLoading ? "…" : formatNum(todos.length)}</div>
          <div className="mt-2 font-sans text-[13px] font-semibold text-text-secondary">Total de insumos (8 tablas)</div>
        </button>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex h-[38px] w-[38px] items-center justify-center rounded-lg" style={{ backgroundColor: "#C77D1418" }}>
            <AlertTriangle size={19} color="#C77D14" />
          </div>
          <div className="font-mono text-[28px] font-bold leading-none text-text-primary">{isLoading ? "…" : bajoMinimo.length}</div>
          <div className="mt-2 font-sans text-[13px] font-semibold text-text-secondary">Bajo stock mínimo</div>
          <div className="mt-0.5 font-sans text-[11.5px] text-text-muted">sobre {conMinimoConfigurado} con mínimo configurado</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex h-[38px] w-[38px] items-center justify-center rounded-lg" style={{ backgroundColor: "#C13B2A18" }}>
            <PackageX size={19} color="#C13B2A" />
          </div>
          <div className="font-mono text-[28px] font-bold leading-none text-text-primary">{isLoading ? "…" : sinStock.length}</div>
          <div className="mt-2 font-sans text-[13px] font-semibold text-text-secondary">Sin stock</div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-surface px-5 py-[18px]">
        <div className="mb-3 font-sans text-[12.5px] font-bold uppercase tracking-wide text-text-secondary">Accesos rápidos</div>
        <div className="flex gap-3">
          <button onClick={() => setEscanerAbierto(true)} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-4 py-4 hover:border-accent">
            <ScanBarcode size={18} color="#1868A0" />
            <span className="font-sans text-xs font-semibold text-text-primary">Escanear insumo</span>
          </button>
          <button onClick={onIrAInsumos} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-4 py-4 hover:border-accent">
            <Search size={18} color="#1868A0" />
            <span className="font-sans text-xs font-semibold text-text-primary">Buscar insumo</span>
          </button>
          <button onClick={onIrAInsumos} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-4 py-4 hover:border-accent">
            <Boxes size={18} color="#5E6C7A" />
            <span className="font-sans text-xs font-semibold text-text-primary">Ver categorías</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4 font-display text-[15.5px] font-bold text-text-primary">Filas por categoría</div>
          <div className="p-4">
            {totalPorTabla.map(({ tabla, cantidad }) => (
              <div key={tabla} className="flex items-center justify-between px-2 py-2">
                <span className="font-sans text-[13px] text-text-secondary">{TABLA_LABEL[tabla]}</span>
                <span className="font-mono text-sm font-bold text-text-primary">{formatNum(cantidad)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <PackageCheck size={16} color="#C13B2A" />
            <div className="font-display text-[15.5px] font-bold text-text-primary">Alertas prioritarias</div>
          </div>
          {bajoMinimo.length === 0 && sinStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <PackageCheck size={26} color="#1D8A5C" />
              <p className="mt-2 font-sans text-[13px] text-text-secondary">Sin alertas (o sin stock mínimo configurado todavía).</p>
            </div>
          ) : (
            [...sinStock, ...bajoMinimo].slice(0, 6).map((i) => {
              const meta = ESTADO_STOCK_META[estadoStock(i)];
              return (
                <button key={i.id} onClick={() => setFicha(i)} className="flex w-full items-center justify-between border-b border-border px-5 py-3 text-left last:border-b-0 hover:bg-bg">
                  <div className="min-w-0">
                    <div className="truncate font-sans text-[13px] font-semibold text-text-primary">{i.descripcion}</div>
                    <div className="font-mono text-[10.5px] text-text-muted">{TABLA_LABEL[i.tabla]} · {i.codigoInterno}</div>
                  </div>
                  <span className="shrink-0 rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold" style={{ backgroundColor: meta.soft, color: meta.color }}>
                    {meta.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {ficha && <FichaInsumoModal insumo={ficha} onClose={() => setFicha(null)} onEscanear={() => { setFicha(null); setEscanerAbierto(true); }} notify={toast} />}
      {escanerAbierto && <EscanerModal onClose={() => setEscanerAbierto(false)} onEncontrado={(insumo) => { setEscanerAbierto(false); setFicha(insumo); }} />}
    </div>
  );
}
