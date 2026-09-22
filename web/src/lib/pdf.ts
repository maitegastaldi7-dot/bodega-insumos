import type { Insumo } from "@/types";
import { formatNum } from "./format";

async function generarBarcodePng(value: string): Promise<string> {
  const { default: JsBarcode } = await import("jsbarcode");
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 3,
    height: 90,
    margin: 8,
    displayValue: true,
    font: "Courier",
    fontSize: 20,
    textMargin: 6,
    background: "#ffffff",
    lineColor: "#000000",
  });
  return canvas.toDataURL("image/png");
}

/** Genera la ficha en PDF y, según lo que soporte el navegador, la comparte,
 * la abre en una pestaña nueva (para imprimir o guardar) o la descarga. */
export async function generarYCompartirFichaPDF(insumo: Insumo, notify: (msg: string, type?: "success" | "error") => void) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const marginX = 20;
    let y = 22;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(90, 100, 110);
    doc.text("BODEGA · INSUMOS — FICHA DE INSUMO", marginX, y);
    doc.setDrawColor(210, 216, 222);
    doc.line(marginX, y + 3, 210 - marginX, y + 3);
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(120, 130, 140);
    doc.text(insumo.categoria.toUpperCase(), marginX, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(19, 27, 36);
    const descLines = doc.splitTextToSize(insumo.descripcion || "—", 170);
    doc.text(descLines, marginX, y);
    y += descLines.length * 7 + 4;

    doc.setFont("courier", "normal");
    doc.setFontSize(11);
    doc.setTextColor(80, 90, 100);
    doc.text(`Código interno: ${insumo.codigoInterno || "—"}`, marginX, y);
    y += 10;

    if (insumo.codigoBarras) {
      const png = await generarBarcodePng(insumo.codigoBarras);
      const imgW = 90;
      const imgH = 27;
      doc.addImage(png, "PNG", marginX, y, imgW, imgH);
      y += imgH + 10;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(150, 60, 50);
      doc.text("Sin código de barras asignado", marginX, y);
      y += 12;
    }

    doc.setDrawColor(220, 224, 228);
    doc.line(marginX, y, 210 - marginX, y);
    y += 10;

    const filas: Array<[string, string]> = [
      ["Stock Sistema", formatNum(insumo.stockSistema)],
      ["Stock Piso", formatNum(insumo.stockPiso)],
      ["Stock Mínimo", formatNum(insumo.stockMinimo)],
      ...(insumo.codigoBusqueda ? [["Código de búsqueda", insumo.codigoBusqueda] as [string, string]] : []),
      ...(insumo.tipo ? [["Tipo", insumo.tipo] as [string, string]] : []),
      ...(insumo.color ? [["Color", insumo.color] as [string, string]] : []),
      ...(insumo.dimensiones ? [["Dimensiones", insumo.dimensiones] as [string, string]] : []),
    ];
    doc.setFontSize(11);
    filas.forEach(([k, v]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(90, 100, 110);
      doc.text(k, marginX, y);
      doc.setFont("courier", "bold");
      doc.setTextColor(19, 27, 36);
      doc.text(v, marginX + 60, y);
      y += 8;
    });

    if (insumo.proveedores.length > 0) {
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(90, 100, 110);
      doc.text("PROVEEDORES", marginX, y);
      y += 7;
      insumo.proveedores.forEach((p) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(19, 27, 36);
        doc.text(`- ${p.nombre || "Proveedor sin nombre"}${p.codigo ? `  (Cod. proveedor: ${p.codigo})` : ""}`, marginX, y);
        y += 6.5;
      });
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(150, 158, 166);
    doc.text(`Generado el ${new Date().toLocaleString("es-AR")} desde el Panel de Control de Insumos`, marginX, 287);

    const filename = `ficha-${insumo.codigoInterno || insumo.id}.pdf`;
    const blob = doc.output("blob");

    // 1) Compartir (ideal en celular)
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], filename, { type: "application/pdf" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Ficha de insumo", text: insumo.descripcion });
          return;
        }
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return; // el usuario cerró el diálogo de compartir
      }
    }

    // 2) Abrir en pestaña nueva (permite imprimir / guardar como PDF / compartir desde el visor del navegador)
    const blobUrl = URL.createObjectURL(blob);
    const nuevaVentana = window.open(blobUrl, "_blank");
    if (nuevaVentana) {
      notify("Se abrió la ficha en PDF en una pestaña nueva. Desde ahí podés imprimirla o compartirla.");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      return;
    }

    // 3) Último recurso: descarga directa
    doc.save(filename);
    notify("El PDF se descargó. Buscalo en tus Descargas para imprimirlo o compartirlo.");
  } catch {
    notify("No se pudo generar el PDF de la ficha.", "error");
  }
}
