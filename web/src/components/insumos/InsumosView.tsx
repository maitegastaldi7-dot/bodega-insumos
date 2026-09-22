// ⚠️ LEGACY: prototipo contra una tabla unificada "insumos" que NO existe en
// tu Supabase real. NO está importado por App.tsx. Referencia únicamente.

import { Badge, CatBadge } from "@/components/ui/Badge";
import { inputClass } from "@/components/ui/Modal";
import { useInsumos } from "@/hooks/useInsumos";
import { diferenciaStock, ESTADO_STOCK_META, estadoStock, formatNum } from "@/lib/format";
import { CATEGORIAS, type Categoria, type EstadoStock } from "@/types";
import {
  Boxes, ChevronLeft, ChevronRight, FileText, Layers, Package, PackageCheck, PackageX, Plus, Search,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";

const PAGE_SIZE = 40;

const CATEGORIA_ICONO: Record<Categoria, ComponentType<{ size?: number }>> = {
  Botellas: Package, Tapones: Layers, Tapas: PackageCheck, Cápsulas: Boxes,
  Etiquetas: FileText, Contraetiqueta: FileText, Cajas: Package, Separadores: Layers,
};

interface InsumosViewProps {
  onVerFicha: (id: string) => void;
  onNuevo: () => void;
}

export function InsumosView({ onVerFicha, onNuevo }: InsumosViewProps) {
  const [cat, setCat] = useState<Categoria | "Todas">("Todas");
  const [q, setQ] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoStock | "Todos">("Todos");
  const [incluirBajas, setIncluirBajas] = useState(false);
  const [page, setPage] = useState(1);

  const { data: insumosActivos = [] } = useInsumos({ activo: "true", categoria: cat, q: q || undefined });
  const { data: insumosBajas = [] } = useInsumos({ activo: "false" });
  const { data: todosActivosSinFiltro = [] } = useInsumos({ activo: "true" });

  const visibles = incluirBajas ? [...insumosActivos, ...insumosBajas.filter((i) => cat === "Todas" || i.categoria === cat)] : insumosActivos;
  const filtrados = useMemo(
    () => visibles.filter((i) => estadoFiltro === "Todos" || estadoStock(i) === estadoFiltro),
    [visibles, estadoFiltro]
  );

  useEffect(() => setPage(1), [cat, q, estadoFiltro, incluirBajas]);
  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const pageItems = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const conteoPorCat = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of CATEGORIAS) m[c] = todosActivosSinFiltro.filter((i) => i.categoria === c).length;
    return m;
  }, [todosActivosSinFiltro]);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          <button
            onClick={() => setCat("Todas")}
            className={`shrink-0 rounded-xl border px-4 py-2.5 font-sans text-[13px] font-bold ${cat === "Todas" ? "border-ink-soft bg-ink-soft text-white" : "border-border bg-surface text-text-secondary"}`}
          >
            Todas ({todosActivosSinFiltro.length})
          </button>
          {CATEGORIAS.map((c) => {
            const Icon = CATEGORIA_ICONO[c];
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-4 py-2.5 font-sans text-[13px] font-bold ${active ? "border-ink-soft bg-ink-soft text-white" : "border-border bg-surface text-text-secondary"}`}
              >
                <Icon size={14} /> {c} ({conteoPorCat[c]})
              </button>
            );
          })}
        </div>
        <button onClick={onNuevo} className="flex shrink-0 items-center gap-2 rounded-xl bg-accent px-[18px] py-3 font-sans text-sm font-bold text-white hover:brightness-110">
          <Plus size={18} /> Nuevo Insumo
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border-[1.5px] border-border bg-surface px-3.5">
          <Search size={17} color="#8A97A3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por descripción o cualquier código…"
            className="flex-1 bg-transparent py-2.5 font-sans text-sm outline-none"
          />
        </div>
        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value as EstadoStock | "Todos")} className={`${inputClass} w-[190px]`}>
          <option value="Todos">Todos los estados</option>
          <option value="ok">Stock OK</option>
          <option value="bajo">Bajo mínimo</option>
          <option value="sin_stock">Sin stock</option>
          <option value="sin_dato">Sin dato de stock</option>
        </select>
        <button
          onClick={() => setIncluirBajas((v) => !v)}
          className="flex shrink-0 items-center gap-2 rounded-xl border-[1.5px] px-4 py-2.5 font-sans text-[12.5px] font-bold"
          style={{ borderColor: incluirBajas ? "#C13B2A" : "#DCE2E8", backgroundColor: incluirBajas ? "#FAE4E0" : "#fff", color: incluirBajas ? "#C13B2A" : "#5E6C7A" }}
        >
          <PackageX size={15} /> Bajas ({insumosBajas.length})
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg">
              {["Categoría", "Código Interno", "Descripción", "Stock Sistema", "Stock Piso", "Diferencia", "Stock Mínimo", "Estado"].map((h) => (
                <th key={h} className="border-b border-border px-4 py-3 text-left font-sans text-[11px] font-bold uppercase tracking-wide text-text-secondary">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((i) => {
              const est = estadoStock(i);
              const meta = ESTADO_STOCK_META[est];
              const diff = diferenciaStock(i);
              const inactivo = !i.activo;
              return (
                <tr
                  key={i.id}
                  onClick={() => onVerFicha(i.id)}
                  className="cursor-pointer border-b border-border hover:bg-bg"
                  style={{ opacity: inactivo ? 0.55 : 1 }}
                >
                  <td className="px-4 py-3.5"><CatBadge categoria={i.categoria} /></td>
                  <td className="px-4 py-3.5 font-mono text-[12.5px] text-text-muted">{i.codigoInterno}</td>
                  <td className="max-w-[320px] px-4 py-3.5 font-sans text-[13.5px] font-semibold text-text-primary">
                    {i.descripcion}
                    {inactivo && <span className="ml-2 font-sans text-[10.5px] font-bold text-danger">BAJA</span>}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-sm font-bold text-text-primary">{formatNum(i.stockSistema)}</td>
                  <td className="px-4 py-3.5 font-mono text-[13px] text-text-secondary">{formatNum(i.stockPiso)}</td>
                  <td className="px-4 py-3.5 font-mono text-[13px] font-semibold" style={{ color: diff === null ? "#8A97A3" : diff === 0 ? "#1D8A5C" : "#C13B2A" }}>
                    {diff === null ? "—" : diff > 0 ? `+${formatNum(diff)}` : formatNum(diff)}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[13px] text-text-secondary">{formatNum(i.stockMinimo)}</td>
                  <td className="px-4 py-3.5">
                    {inactivo ? <Badge label="Dado de baja" color="#C13B2A" soft="#FAE4E0" /> : <Badge label={meta.label} color={meta.color} soft={meta.soft} pulse={est === "sin_stock"} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {pageItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Package size={28} color="#8A97A3" />
            <p className="mt-2.5 font-sans text-[13.5px] text-text-secondary">No se encontraron insumos con esos filtros.</p>
          </div>
        )}
        {filtrados.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <span className="font-sans text-[12.5px] text-text-muted">{filtrados.length} resultados · página {page} de {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border disabled:text-text-muted">
                <ChevronLeft size={16} />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border disabled:text-text-muted">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
