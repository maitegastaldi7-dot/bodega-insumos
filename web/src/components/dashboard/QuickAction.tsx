import type { ComponentType } from "react";

interface QuickActionProps {
  icon: ComponentType<{ size?: number; color?: string }>;
  label: string;
  color: string;
  onClick: () => void;
}

export function QuickAction({ icon: Icon, label, color, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-2.5 py-4 hover:border-accent hover:shadow-md"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <Icon size={18} color={color} />
      </div>
      <span className="text-center font-sans text-xs font-semibold leading-tight text-text-primary">{label}</span>
    </button>
  );
}
