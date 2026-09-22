import type { ComponentType } from "react";

interface KpiCardProps {
  icon: ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  onClick?: () => void;
}

export function KpiCard({ icon: Icon, label, value, sub, color, onClick }: KpiCardProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-border bg-surface p-5 text-left hover:shadow-md"
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="mb-3 flex h-[38px] w-[38px] items-center justify-center rounded-lg" style={{ backgroundColor: `${color}18` }}>
        <Icon size={19} color={color} />
      </div>
      <div className="font-mono text-[28px] font-bold leading-none text-text-primary">{value}</div>
      <div className="mt-2 font-sans text-[13px] font-semibold text-text-secondary">{label}</div>
      {sub && <div className="mt-0.5 font-sans text-[11.5px] text-text-muted">{sub}</div>}
    </button>
  );
}
