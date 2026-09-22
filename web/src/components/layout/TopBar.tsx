import { useInsumosTodasLasTablas } from "@/modules/insumos/hooks/useInsumosPorCategoria";
import type { InsumoReal } from "@/modules/insumos/types/insumo.types";
import { ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  onScan: () => void;
  onSelectResult: (insumo: InsumoReal) => void;
}

export function TopBar({ title, subtitle, onSelectResult }: TopBarProps) {
  const [reloj, setReloj] = useState(new Date());
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const { data: porCategoria } = useInsumosTodasLasTablas(
    q.length >= 2 ? q : undefined
  );

  const resultados = useMemo(() => {
    if (!porCategoria || q.length < 2) return [];
    return Object.values(porCategoria).flat();
  }, [porCategoria, q]);

  useEffect(() => {
    const t = setInterval(() => setReloj(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="relative z-20 flex h-[76px] shrink-0 items-center justify-between border-b border-border bg-surface px-7">
      <div>
        <h1 className="font-display text-[21px] font-bold tracking-tight text-text-primary">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-0.5 font-sans text-[13px] text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex w-[320px] items-center gap-2 rounded-xl border-[1.5px] border-border bg-bg px-3">
            <Search size={16} color="#8A97A3" />

            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Buscar insumos..."
              className="flex-1 bg-transparent py-2.5 font-sans text-[13.5px] outline-none"
            />
          </div>

          {open && q.length >= 2 && (
            <div className="absolute right-0 top-[46px] max-h-[400px] w-[380px] overflow-y-auto rounded-xl border border-border bg-surface shadow-lg">
              {resultados.length === 0 ? (
                <div className="p-4 font-sans text-[13px] text-text-muted">
                  Sin coincidencias.
                </div>
              ) : (
                resultados.slice(0, 8).map((i) => (
                  <button
                    key={i.id}
                    onClick={() => {
                      onSelectResult(i);
                      setOpen(false);
                      setQ("");
                    }}
                    className="flex w-full items-center justify-between border-b border-border px-3.5 py-2.5 text-left hover:bg-bg"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-sans text-[13px] font-semibold text-text-primary">
                        {i.descripcion ?? "—"}
                      </div>

                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="rounded-md bg-bg px-2 py-[3px] font-sans text-[10.5px] font-bold uppercase text-text-secondary">
                          {i.categoria}
                        </span>

                        <span className="font-mono text-[10.5px] text-text-muted">
                          {i.codigoInterno}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      size={15}
                      color="#8A97A3"
                      className="shrink-0"
                    />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="whitespace-nowrap font-mono text-[12.5px] text-text-secondary">
          {reloj.toLocaleDateString("es-AR", {
            weekday: "short",
            day: "2-digit",
            month: "short",
          })}{" "}
          ·{" "}
          {reloj.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </header>
  );
}