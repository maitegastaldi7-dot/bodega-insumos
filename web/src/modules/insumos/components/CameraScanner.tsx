import { Keyboard, Loader2, RefreshCw, VideoOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}

const FORMATOS: any[] = ["ean_13", "ean_8", "code_128", "code_39", "codabar", "upc_a", "upc_e", "itf", "qr_code"];

async function crearDetector(): Promise<BarcodeDetectorLike> {
  if ("BarcodeDetector" in window) {
    // @ts-expect-error -- BarcodeDetector nativo, no siempre está en los lib.dom.d.ts del proyecto
    return new window.BarcodeDetector({ formats: FORMATOS });
  }
  const { BarcodeDetector } = await import("barcode-detector/ponyfill");
  return new BarcodeDetector({ formats: FORMATOS }) as unknown as BarcodeDetectorLike;
}

interface CameraScannerProps {
  onDetected: (code: string) => void;
  onCancel: () => void;
}

export function CameraScanner({ onDetected, onCancel }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const activeRef = useRef(true);
  const cooldownRef = useRef(0);
  const [estado, setEstado] = useState<"iniciando" | "activo" | "error">("iniciando");
  const [errorMsg, setErrorMsg] = useState("");
  const [facing, setFacing] = useState<"environment" | "user">("environment");

  const detener = useCallback(() => {
    activeRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    activeRef.current = true;
    let cancelado = false;

    async function iniciar() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } });
        if (cancelado) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        detectorRef.current = await crearDetector();
        if (cancelado) return;
        setEstado("activo");

        const loop = async () => {
          if (!activeRef.current || cancelado || !videoRef.current || !detectorRef.current) return;
          const now = Date.now();
          if (now < cooldownRef.current) { rafRef.current = requestAnimationFrame(loop); return; }
          try {
            const resultados = await detectorRef.current.detect(videoRef.current);
            if (resultados.length > 0 && activeRef.current) {
              cooldownRef.current = now + 1500;
              onDetected(resultados[0].rawValue);
            }
          } catch {
            // frame no decodificable: se reintenta en el próximo ciclo
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) {
        if (cancelado) return;
        setEstado("error");
        setErrorMsg(
          (e as Error)?.name === "NotAllowedError"
            ? "Permiso de cámara denegado. Habilitalo en el navegador para escanear."
            : "No se pudo acceder a la cámara en este dispositivo."
        );
      }
    }
    iniciar();

    return () => {
      cancelado = true;
      detener();
    };
  }, [facing, onDetected, detener]);

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "4 / 3" }}>
        {estado !== "error" && (
          <>
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            {estado === "activo" && (
              <div
                className="absolute left-[8%] right-[8%] h-0.5 animate-scanline bg-accent"
                style={{ boxShadow: "0 0 8px #1868A0" }}
              />
            )}
            {estado === "iniciando" && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="font-sans text-[12.5px]">Iniciando cámara…</span>
                </div>
              </div>
            )}
          </>
        )}
        {estado === "error" && (
          <div className="absolute inset-0 flex items-center justify-center p-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <VideoOff size={26} color="#fff" />
              <span className="font-sans text-[12.5px] text-white">{errorMsg}</span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
          className="flex items-center gap-1.5 rounded-lg border-[1.5px] border-border px-3.5 py-2 font-sans text-[12.5px] font-semibold text-text-secondary"
        >
          <RefreshCw size={14} /> Cambiar cámara
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-lg border-[1.5px] border-border px-3.5 py-2 font-sans text-[12.5px] font-semibold text-text-secondary"
        >
          <Keyboard size={14} /> Ingresar manualmente
        </button>
      </div>
      <p className="mt-2.5 text-center font-sans text-[11.5px] text-text-muted">
        Apuntá la cámara al código de barras, manteniéndolo dentro del recuadro.
      </p>
    </div>
  );
}
