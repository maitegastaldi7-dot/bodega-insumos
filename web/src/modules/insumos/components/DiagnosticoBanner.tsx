import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useDiagnosticoConexion } from "../hooks/useInsumosPorCategoria";
import type { TablaInsumo } from "../types/insumo.types";

const CATEGORIA_MENSAJE: Record<string, string> = {
  conexion: "No hay conexión con Supabase (falla de red antes de recibir respuesta del servidor).",
  url_invalida: "El Project URL no tiene un formato válido.",
  autenticacion: "La Publishable Key fue rechazada por Supabase (inválida o vencida).",
  permisos_rls: "Supabase bloqueó la lectura por políticas RLS del rol anon.",
  tabla_no_existe: "La tabla no existe (o no es visible) en tu proyecto Supabase.",
  desconocido: "Error inesperado al consultar Supabase.",
};

export function DiagnosticoBanner({ tabla = "botellas" }: { tabla?: TablaInsumo }) {
  const { data, isLoading, isError, error } = useDiagnosticoConexion(tabla);

  if (isLoading) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
        <Loader2 size={16} className="animate-spin" color="#1868A0" />
        <span className="font-sans text-[12.5px] text-text-secondary">Probando conexión real con Supabase (desde el servidor)…</span>
      </div>
    );
  }

  if (isError || !data?.ok) {
    const categoria = (data as { categoria?: string } | undefined)?.categoria;
    const mensaje = categoria ? CATEGORIA_MENSAJE[categoria] ?? categoria : error instanceof Error ? error.message : "No se pudo consultar la API.";
    return (
      <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3">
        <AlertTriangle size={16} color="#C13B2A" className="mt-0.5 shrink-0" />
        <div>
          <div className="font-sans text-[12.5px] font-bold text-danger">Sin conexión real con Supabase — categoría: {categoria ?? "desconocida"}</div>
          <div className="mt-0.5 font-sans text-[12px] text-text-secondary">{mensaje}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-4 py-3">
      <CheckCircle2 size={16} color="#1D8A5C" />
      <span className="font-sans text-[12.5px] font-semibold text-success">
        Conectado a Supabase — {data.filasLeidas ?? 0} fila(s) de prueba leídas de "{data.tablaProbada}".
      </span>
    </div>
  );
}
