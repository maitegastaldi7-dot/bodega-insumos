import { ModuloPendiente } from "@/components/ui/ModuloPendiente";
import { Sidebar, type Seccion } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Toast, type ToastState } from "@/components/ui/Toast";
import { useUsuarioActual } from "@/hooks/useUsuarioActual";
import { FichaInsumoModal } from "@/modules/insumos/components/FichaInsumoModal";
import { AlertasPage } from "@/modules/insumos/pages/AlertasPage";
import { DashboardPage } from "@/modules/insumos/pages/DashboardPage";
import { InsumosPage } from "@/modules/insumos/pages/InsumosPage";
import { RecepcionesInfoPage } from "@/modules/insumos/pages/RecepcionesInfoPage";
import type { InsumoReal } from "@/modules/insumos/types/insumo.types";
import { useCallback, useState } from "react";

const TITULOS: Record<Seccion, [string, string]> = {
  dashboard: ["Panel de Control", "Datos reales desde tu proyecto Supabase — 8 tablas por categoría"],
  insumos: ["Insumos", "Datos reales desde tu proyecto Supabase — una tabla por categoría"],
  recepciones: ["Recepciones", "Registrá la recepción desde la ficha de cada insumo"],
  alertas: ["Alertas de Stock", "Calculadas en vivo desde Supabase"],
  produccion: ["Órdenes de Producción", "Pendiente de definición contra las tablas reales"],
  historial: ["Historial de Movimientos", "Pendiente: requiere una tabla de auditoría nueva (a confirmar)"],
};

export default function App() {
  const [seccion, setSeccion] = useState<Seccion>("dashboard");
  const { usuario, setUsuario } = useUsuarioActual();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [fichaGlobal, setFichaGlobal] = useState<InsumoReal | null>(null);

  const notify = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <div className="flex h-screen w-full bg-bg font-sans">
      <Sidebar
        active={seccion}
        onNavigate={setSeccion}
        alertCount={0}
        totalInsumos={0}
        usuario={usuario}
        onCambiarUsuario={setUsuario}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={TITULOS[seccion][0]}
          subtitle={TITULOS[seccion][1]}
          onScan={() => {}}
          onSelectResult={(insumo) => setFichaGlobal(insumo)}
        />
        <main className="flex-1 overflow-y-auto">
          {seccion === "dashboard" && <DashboardPage onIrAInsumos={() => setSeccion("insumos")} toast={notify} />}
          {seccion === "insumos" && <InsumosPage toast={notify} />}
          {seccion === "recepciones" && <RecepcionesInfoPage />}
          {seccion === "alertas" && <AlertasPage toast={notify} />}
          {seccion === "produccion" && <ModuloPendiente titulo="Órdenes de Producción" />}
          {seccion === "historial" && <ModuloPendiente titulo="Historial de Movimientos" />}
        </main>
      </div>

      {fichaGlobal && (
        <FichaInsumoModal insumo={fichaGlobal} onClose={() => setFichaGlobal(null)} onEscanear={() => setFichaGlobal(null)} notify={notify} />
      )}

      <Toast toast={toast} />
    </div>
  );
}
