import { AlertTriangle, Check } from "lucide-react";

export interface ToastState {
  msg: string;
  type?: "success" | "error";
}

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      className="fixed right-5 top-5 z-50 flex max-w-[400px] items-center gap-3 rounded-xl px-4 py-3.5 font-sans text-[14.5px] font-semibold text-white shadow-lg"
      style={{ backgroundColor: isError ? "#C13B2A" : "#1D2A37", boxShadow: "0 12px 28px rgba(19,27,36,0.28)" }}
    >
      {isError ? <AlertTriangle size={19} /> : <Check size={19} />}
      <span>{toast.msg}</span>
    </div>
  );
}
