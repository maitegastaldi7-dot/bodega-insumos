import { StatusDot } from "./StatusDot";

interface BadgeProps {
  label: string;
  color: string;
  soft: string;
  pulse?: boolean;
}

export function Badge({ label, color, soft, pulse }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full py-1 pl-2 pr-2.5 font-sans text-[12.5px] font-semibold"
      style={{ backgroundColor: soft, color }}
    >
      <StatusDot color={color} pulse={pulse} />
      {label}
    </span>
  );
}

export function CatBadge({ categoria }: { categoria: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-bg px-2 py-[3px] font-sans text-[11px] font-bold uppercase tracking-wide text-text-secondary">
      {categoria}
    </span>
  );
}
