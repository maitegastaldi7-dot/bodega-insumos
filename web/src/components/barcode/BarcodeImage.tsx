import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface BarcodeImageProps {
  value: string | null;
}

/** Código de barras real (SVG vectorial, escaneable e imprimible), generado a
 * partir del valor exacto de "Código Interno Barras" — sin inventar dígitos.
 * Formato CODE128 (soporta letras + números, p.ej. "I0I05000001"). */
export function BarcodeImage({ value }: BarcodeImageProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [status, setStatus] = useState<"cargando" | "ok" | "error">("cargando");

  useEffect(() => {
    let cancelado = false;
    if (!value) return;
    setStatus("cargando");

    import("jsbarcode").then(({ default: JsBarcode }) => {
      if (cancelado || !svgRef.current) return;
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 2.2,
          height: 62,
          margin: 12,
          displayValue: true,
          font: "IBM Plex Mono, monospace",
          fontSize: 15,
          textMargin: 8,
          background: "#ffffff",
          lineColor: "#131B24",
        });
        if (!cancelado) setStatus("ok");
      } catch {
        if (!cancelado) setStatus("error");
      }
    });

    return () => {
      cancelado = true;
    };
  }, [value]);

  if (!value) {
    return (
      <div className="flex items-center justify-center rounded-xl border-[1.5px] border-dashed border-border bg-bg p-[22px]">
        <span className="font-sans text-[13px] font-semibold text-text-muted">Sin código de barras asignado</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex min-h-[96px] items-center justify-center rounded-xl border border-border bg-white p-3.5">
        {status === "cargando" && <Loader2 className="animate-spin" size={20} color="#8A97A3" />}
        <svg ref={svgRef} className={status === "ok" ? "block max-w-full" : "hidden"} />
      </div>
      {status === "error" && (
        <div className="mt-1.5 font-sans text-[11.5px] text-danger">
          No se pudo generar la imagen para "{value}" (caracteres no soportados por CODE128).
        </div>
      )}
    </div>
  );
}
