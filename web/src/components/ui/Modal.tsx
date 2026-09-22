import { X } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

interface ModalProps {
  onClose: () => void;
  title: string;
  icon?: ComponentType<{ size?: number; color?: string }>;
  width?: number;
  children: ReactNode;
}

export function Modal({ onClose, title, icon: Icon, width = 560, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/55 p-5"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] flex-col rounded-2xl bg-surface shadow-2xl"
        style={{ width, maxWidth: "100%" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
                <Icon size={18} color="#1868A0" />
              </div>
            )}
            <h2 className="font-display text-lg font-bold text-text-primary">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-text-secondary hover:bg-bg"
          >
            <X size={19} />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block font-sans text-[12.5px] font-semibold tracking-wide text-text-secondary">{children}</label>;
}

export const inputClass =
  "w-full rounded-[9px] border-[1.5px] border-border bg-surface px-3.5 py-2.5 font-sans text-[14.5px] text-text-primary focus:border-accent focus:outline-none";
