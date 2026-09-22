interface StatusDotProps {
  color: string;
  pulse?: boolean;
}

export function StatusDot({ color, pulse }: StatusDotProps) {
  return (
    <span className="relative inline-flex h-[9px] w-[9px] shrink-0">
      {pulse && (
        <span className="absolute inset-0 animate-pulse-ring rounded-full" style={{ backgroundColor: color, opacity: 0.5 }} />
      )}
      <span
        className="relative block h-[9px] w-[9px] rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 0 2px ${color}22` }}
      />
    </span>
  );
}
