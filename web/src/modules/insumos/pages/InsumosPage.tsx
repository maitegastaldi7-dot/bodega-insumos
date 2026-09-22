import { ApiError } from "@/lib/api";
import { CheckCircle2, ScanBarcode, Search } from "lucide-react";
import { useState } from "react";
import { CategoriaTabs } from "../components/CategoriaTabs";
import { DiagnosticoBanner } from "../components/DiagnosticoBanner";
import { EscanerModal } from "../components/EscanerModal";
import { FichaInsumoModal } from "../components/FichaInsumoModal";
import { useInsumosPorTabla } from "../hooks/useInsumosPorCategoria";
import { TABLA_LABEL, type InsumoReal, type TablaInsumo } from "../types/insumo.types";
import { InsumoTable } from "../components/InsumoTable";

interface InsumosPageProps {
  toast: (msg: string, type?: "success" | "error") => void;
}

export function InsumosPage({ toast }: InsumosPageProps) {
  const [tabla, setTabla] = useState<TablaInsumo>("botellas");
  const [q, setQ] = useState("");
  const [ficha, setFicha] = useState<InsumoReal | null>(null);
  const [escanerAbierto, setEscanerAbierto] = useState(false);
  const { data: insumos = [], isLoading, isError, error, isSuccess } = useInsumosPorTabla(tabla, q || undefined);

  const mensajeError = isError ? (error instanceof ApiError ? error.message : "No se pudo conectar con la API/Supabase.") : null;

  return (
    <div className="p-6">
      <DiagnosticoBanner tabla={tabla} />

      <div className="mb-4 flex items-center justify-between gap-3">
        <CategoriaTabs activa={tabla} onChange={setTabla} />
        <button
          onClick={() => setEscanerAbierto(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-accent px-[18px] py-3 font-sans text-sm font-bold text-white hover:brightness-110"
        >
          <ScanBarcode size={18} /> Escanear
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border-[1.5px] border-border bg-surface px-3.5">
          <Search size={17} color="#8A97A3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Buscar en ${TABLA_LABEL[tabla].toLowerCase()} por descripción o código…`}
            className="flex-1 bg-transparent py-2.5 font-sans text-sm outline-none"
          />
        </div>
        {isSuccess && !isLoading && (
          <span className="flex shrink-0 items-center gap-1.5 font-sans text-[12px] font-semibold text-success">
            <CheckCircle2 size={14} /> {insumos.length} filas
          </span>
        )}
      </div>

      <InsumoTable insumos={insumos} cargando={isLoading} error={mensajeError} onSelect={setFicha} />

      <p className="mt-3 font-sans text-[11.5px] text-text-muted">
        Datos leídos en vivo desde Supabase vía <code>GET /api/insumos/{tabla}</code> — sin arrays de ejemplo ni datos hardcodeados.
      </p>

      {ficha && (
        <FichaInsumoModal
          insumo={ficha}
          onClose={() => setFicha(null)}
          onEscanear={() => { setFicha(null); setEscanerAbierto(true); }}
          notify={toast}
        />
      )}

      {escanerAbierto && (
        <EscanerModal onClose={() => setEscanerAbierto(false)} onEncontrado={(insumo) => { setEscanerAbierto(false); setFicha(insumo); }} />
      )}
    </div>
  );
}
