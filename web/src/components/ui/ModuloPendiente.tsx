import { AlertTriangle } from "lucide-react";

interface ModuloPendienteProps {
  titulo: string;
}

/**
 * Estas secciones se diseñaron originalmente contra una tabla unificada
 * "insumos" (categoría, stock mínimo, proveedores como lista, etc.) que NO
 * existe en el proyecto Supabase real del usuario — que usa una tabla por
 * categoría (botellas, tapones, tapas...) con columnas más simples.
 *
 * En vez de dejarlas fallar contra la API con errores confusos, se muestra
 * este aviso explícito hasta decidir cómo adaptarlas (por ejemplo: recepciones
 * y órdenes necesitan poder referenciar "tabla + id" en lugar de un solo
 * insumo_id, ya que ahora hay 8 tablas distintas en vez de una).
 */
export function ModuloPendiente({ titulo }: ModuloPendienteProps) {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
        <AlertTriangle size={28} color="#C77D14" />
        <h3 className="font-display text-lg font-bold text-text-primary">{titulo} — pendiente de rediseño</h3>
        <p className="max-w-md font-sans text-[13.5px] leading-relaxed text-text-secondary">
          Este módulo se construyó contra una tabla única de insumos (con categoría, stock mínimo, proveedores como
          lista) que no existe en tu proyecto Supabase real. Tus tablas (<code className="font-mono">botellas</code>,{" "}
          <code className="font-mono">tapones</code>, etc.) tienen una estructura más simple y separada por categoría.
        </p>
        <p className="max-w-md font-sans text-[13px] text-text-secondary">
          La sección <strong>Insumos</strong> ya está conectada y leyendo datos reales. Decime cómo querés manejar
          {" "}{titulo.toLowerCase()} contra las 8 tablas reales y lo conecto de la misma forma.
        </p>
      </div>
    </div>
  );
}
