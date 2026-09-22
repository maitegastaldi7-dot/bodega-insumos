import { StatusDot } from "@/components/ui/StatusDot";
import { formatNum } from "@/lib/format";
import {
  AlertTriangle, Check, ClipboardList, Factory, History, LayoutDashboard, LayoutGrid, Pencil, Truck, User,
} from "lucide-react";
import { useState } from "react";

export type Seccion = "dashboard" | "insumos" | "recepciones" | "alertas" | "produccion" | "historial";

const NAV_ITEMS: Array<{ key: Seccion; label: string; icon: typeof LayoutDashboard }> = [
  { key: "dashboard", label: "Panel de Control", icon: LayoutDashboard },
  { key: "insumos", label: "Insumos", icon: LayoutGrid },
  { key: "recepciones", label: "Recepciones", icon: Truck },
  { key: "alertas", label: "Alertas de Stock", icon: AlertTriangle },
  { key: "produccion", label: "Órdenes de Producción", icon: ClipboardList },
  { key: "historial", label: "Historial de Movimientos", icon: History },
];

interface SidebarProps {
  active: Seccion;
  onNavigate: (s: Seccion) => void;
  alertCount: number;
  totalInsumos: number;
  usuario: string;
  onCambiarUsuario: (nombre: string) => void;
}

export function Sidebar({ active, onNavigate, alertCount, totalInsumos, usuario, onCambiarUsuario }: SidebarProps) {
  const [editando, setEditando] = useState(false);
  const [val, setVal] = useState(usuario);

  return (
    <aside className="flex w-[240px] shrink-0 flex-col bg-ink">
      <div className="flex items-center gap-3 px-5 pb-5 pt-[22px]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <Factory size={19} color="#fff" />
        </div>
        <div>
          <div className="font-display text-[15px] font-extrabold leading-tight tracking-wide text-white">
            BODEGA<span className="text-accent">·</span>INSUMOS
          </div>
          <div className="mt-0.5 font-mono text-[10.5px] tracking-wider text-on-ink-muted">CONTROL DE ABASTECIMIENTO</div>
        </div>
      </div>
      <div className="mx-5 my-1 h-px bg-white/[0.08]" />
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-3 text-left font-sans text-sm font-semibold ${
                isActive ? "bg-accent text-white" : "text-on-ink-muted hover:bg-white/[0.06]"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.3 : 2} />
              <span className="flex-1">{item.label}</span>
              {item.key === "alertas" && alertCount > 0 && (
                <span
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-bold text-white"
                  style={{ backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#C13B2A" }}
                >
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="flex-1" />
      <div className="px-5 py-2.5">
        {editando ? (
          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-2.5 py-2">
            <User size={14} color="#8CA0B3" className="shrink-0" />
            <input
              autoFocus
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { onCambiarUsuario(val); setEditando(false); }
              }}
              placeholder="Nombre del operario"
              className="flex-1 bg-transparent font-sans text-[12.5px] text-white outline-none placeholder:text-on-ink-muted"
            />
            <button
              onClick={() => { onCambiarUsuario(val); setEditando(false); }}
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded bg-accent text-white"
            >
              <Check size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setVal(usuario); setEditando(true); }}
            className="flex w-full items-center gap-2.5 rounded-lg bg-white/[0.05] px-2.5 py-[9px]"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent">
              <User size={12} color="#fff" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate font-sans text-xs font-semibold text-white">{usuario}</div>
              <div className="font-mono text-[9.5px] text-on-ink-muted">Cambiar operario</div>
            </div>
            <Pencil size={11} color="#8CA0B3" className="shrink-0" />
          </button>
        )}
      </div>
      <div className="px-5 pb-5 pt-1">
        <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.05] px-3 py-[11px]">
          <StatusDot color="#1D8A5C" pulse />
          <div>
            <div className="font-sans text-[12.5px] font-semibold text-white">{formatNum(totalInsumos)} insumos</div>
            <div className="font-mono text-[10.5px] text-on-ink-muted">Base de datos activa</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
