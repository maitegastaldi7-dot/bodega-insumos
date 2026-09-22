// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { Badge } from "@/components/ui/Badge";
import { CatBadge } from "@/components/ui/Badge";
import { useInsumos } from "@/hooks/useInsumos";
import { useOrdenes } from "@/hooks/useOrdenes";
import { useRecepciones } from "@/hooks/useRecepciones";
import { ESTADO_STOCK_META, esUltimosDias, estadoStock, formatFecha, formatFechaCorta, formatNum } from "@/lib/format";
import type { Seccion } from "@/components/layout/Sidebar";
import {
  AlertTriangle, ArrowDown, Boxes, CircleAlert, Clock, LayoutGrid, Package, PackageCheck, PackageX,
  ScanBarcode, Search, SlidersHorizontal, Truck,
} from "lucide-react";
import { KpiCard } from "./KpiCard";
import { QuickAction } from "./QuickAction";

interface DashboardProps {
  onNav: (s: Seccion) => void;
  onScan: () => void;
  onVerFicha: (id: string) => void;
}

export function Dashboard({ onNav, onScan, onVerFicha }: DashboardProps) {
  const { data: insumos = [] } = useInsumos({ activo: "true" });
  const { data: recepciones = [] } = useRecepciones();
  const { data: ordenes = [] } = useOrdenes();

  const conMinimo = insumos.filter((i) => i.stockMinimo !== null);
  const bajoMinimo = conMinimo.filter((i) => estadoStock(i) === "bajo");
  const sinStock = insumos.filter((i) => estadoStock(i) === "sin_stock");
  const disponibles = insumos.filter((i) => estadoStock(i) === "ok").length;
  const recepcionesRecientes = recepciones.filter((r) => esUltimosDias(r.fecha, 7));
  const conDiferencia = insumos.filter((i) => i.stockPiso !== null && i.stockSistema - (i.stockPiso ?? 0) !== 0);
  const ordenesPendientes = ordenes.filter((o) => o.estado !== "completada");

  const alertasPrioridad = [...bajoMinimo, ...sinStock]
    .sort((a, b) => a.stockSistema - b.stockSistema)
    .slice(0, 6);

  const insumoNombre = (id: string | null) => insumos.find((i) => i.id === id)?.descripcion ?? "Insumo eliminado";

  return (
    <div className="p-6">
      <div className="mb-6 grid grid-cols-3 gap-4">
        <KpiCard icon={Package} label="Total de insumos" value={formatNum(insumos.length)} color="#1868A0" sub="8 categorías" onClick={() => onNav("insumos")} />
        <KpiCard icon={AlertTriangle} label="Bajo stock mínimo" value={bajoMinimo.length} color="#C77D14" sub={`sobre ${conMinimo.length} con mínimo definido`} onClick={() => onNav("alertas")} />
        <KpiCard icon={PackageX} label="Sin stock" value={sinStock.length} color="#C13B2A" sub="stock de sistema en cero" onClick={() => onNav("alertas")} />
        <KpiCard icon={Truck} label="Recepciones (7 días)" value={recepcionesRecientes.length} color="#1D8A5C" sub={`${recepciones.length} históricas`} onClick={() => onNav("recepciones")} />
        <KpiCard icon={PackageCheck} label="Insumos disponibles" value={disponibles} color="#1868A0" sub="stock por sobre el mínimo" onClick={() => onNav("insumos")} />
        <KpiCard icon={SlidersHorizontal} label="Diferencias de stock" value={conDiferencia.length} color="#6952C4" sub="sistema ≠ físico de piso" onClick={() => onNav("insumos")} />
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-surface px-5 py-[18px]">
        <div className="mb-3 font-sans text-[12.5px] font-bold uppercase tracking-wide text-text-secondary">Accesos rápidos</div>
        <div className="grid grid-cols-6 gap-3">
          <QuickAction icon={ScanBarcode} label="Escanear insumo" color="#1868A0" onClick={onScan} />
          <QuickAction icon={Truck} label="Registrar recepción" color="#1D8A5C" onClick={onScan} />
          <QuickAction icon={Search} label="Buscar insumo" color="#1868A0" onClick={() => onNav("insumos")} />
          <QuickAction icon={Boxes} label="Ver stock" color="#5E6C7A" onClick={() => onNav("insumos")} />
          <QuickAction icon={AlertTriangle} label="Ver alertas" color="#C77D14" onClick={() => onNav("alertas")} />
          <QuickAction icon={LayoutGrid} label="Ver categorías" color="#6952C4" onClick={() => onNav("insumos")} />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3 rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <CircleAlert size={17} color="#C13B2A" />
              <h3 className="font-display text-[15.5px] font-bold text-text-primary">Alertas Prioritarias</h3>
            </div>
            <button onClick={() => onNav("alertas")} className="font-sans text-[13px] font-semibold text-accent hover:underline">
              Ver todas →
            </button>
          </div>
          {alertasPrioridad.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <PackageCheck size={30} color="#1D8A5C" />
              <p className="mt-2.5 font-sans text-[13.5px] text-text-secondary">Todos los insumos están dentro de su nivel mínimo.</p>
            </div>
          ) : (
            alertasPrioridad.map((i) => {
              const est = estadoStock(i);
              const meta = ESTADO_STOCK_META[est];
              return (
                <button
                  key={i.id}
                  onClick={() => onVerFicha(i.id)}
                  className="flex w-full items-center justify-between border-b border-border px-5 py-3.5 text-left hover:bg-bg"
                >
                  <div className="min-w-0">
                    <CatBadge categoria={i.categoria} />
                    <div className="mt-1 font-sans text-sm font-semibold text-text-primary">{i.descripcion}</div>
                    <div className="font-mono text-[11px] text-text-muted">{i.codigoInterno}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-[15px] font-bold" style={{ color: meta.color }}>{formatNum(i.stockSistema)}</div>
                      <div className="font-sans text-[10.5px] text-text-muted">mín. {formatNum(i.stockMinimo)}</div>
                    </div>
                    <Badge label={meta.label} color={meta.color} soft={meta.soft} pulse={est === "sin_stock"} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="col-span-2 rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Clock size={17} color="#1868A0" />
              <h3 className="font-display text-[15.5px] font-bold text-text-primary">Recepciones Recientes</h3>
            </div>
            <button onClick={() => onNav("recepciones")} className="font-sans text-[13px] font-semibold text-accent hover:underline">
              Ver todas →
            </button>
          </div>
          {recepciones.length === 0 ? (
            <p className="p-5 font-sans text-[13.5px] text-text-secondary">Sin recepciones registradas todavía.</p>
          ) : (
            [...recepciones]
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .slice(0, 7)
              .map((r) => (
                <div key={r.id} className="flex items-center gap-3 border-b border-border px-5 py-3">
                  <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-success-soft">
                    <ArrowDown size={15} color="#1D8A5C" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-sans text-[13px] font-semibold text-text-primary">{insumoNombre(r.insumoId)}</div>
                    <div className="font-mono text-[10.5px] text-text-muted">{formatFecha(r.fecha)}</div>
                  </div>
                  <div className="font-mono text-[13.5px] font-bold text-success">+{formatNum(r.cantidad)}</div>
                </div>
              ))
          )}
        </div>
      </div>

      {ordenesPendientes.length > 0 && (
        <div className="mt-5 rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-display text-[15.5px] font-bold text-text-primary">Órdenes en Curso</h3>
            <button onClick={() => onNav("produccion")} className="font-sans text-[13px] font-semibold text-accent hover:underline">
              Ver todas →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 p-5">
            {ordenesPendientes.slice(0, 3).map((o) => {
              const total = o.insumos.length;
              const ok = o.insumos.filter((l) => l.estado === "abastecido").length;
              const pct = total ? Math.round((ok / total) * 100) : 0;
              return (
                <button key={o.id} onClick={() => onNav("produccion")} className="rounded-xl border border-border p-4 text-left hover:border-accent">
                  <div className="mb-2 font-mono text-xs font-bold text-accent">{o.codigo}</div>
                  <div className="mb-2.5 font-sans text-sm font-semibold text-text-primary">{o.producto}</div>
                  <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-bg">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="font-sans text-[11.5px] text-text-muted">{ok}/{total} insumos abastecidos · {formatFechaCorta(o.fechaCreacion)}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
