import { formatNum } from "@/lib/format";
import { AlertTriangle, Delete } from "lucide-react";

interface KeypadProps {
  value: string;
  onChange: (value: string) => void;
  unidad?: string;
  max?: number;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "DEL"];

export function Keypad({ value, onChange, unidad, max }: KeypadProps) {
  const press = (d: string) => {
    if (d === "DEL") { onChange(value.slice(0, -1)); return; }
    if (d === "." && value.includes(".")) return;
    if (value.length > 8) return;
    onChange(value + d);
  };
  const over = max !== undefined && parseFloat(value || "0") > max;

  return (
    <div>
      <div
        className="mb-3 flex items-center justify-between rounded-xl bg-bg px-5 py-4"
        style={{ border: `1.5px solid ${over ? "#C77D14" : "#DCE2E8"}` }}
      >
        <span className={`font-mono text-[34px] font-semibold leading-none ${value ? "text-text-primary" : "text-text-muted"}`}>
          {value || "0"}
        </span>
        <span className="font-sans text-[15px] font-semibold text-text-secondary">{unidad}</span>
      </div>
      {over && (
        <div className="mb-2 flex items-center gap-1.5 font-sans text-[12.5px] font-semibold text-warning">
          <AlertTriangle size={14} /> Supera el stock de sistema ({formatNum(max)} {unidad})
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className={`h-[52px] rounded-lg border-[1.5px] border-border font-mono text-xl font-semibold active:scale-95 ${
              k === "DEL" ? "bg-danger-soft text-danger" : "bg-surface text-text-primary"
            }`}
          >
            {k === "DEL" ? <Delete size={20} className="mx-auto" /> : k}
          </button>
        ))}
      </div>
    </div>
  );
}
