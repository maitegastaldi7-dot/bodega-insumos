import type { InsumoReal } from "../types/insumo.types";
import { TABLA_LABEL } from "../types/insumo.types";

function formatNum(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("es-AR").format(n);
}

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

export async function generarYCompartirFichaPDF(
  insumo: InsumoReal,
  notify: (msg: string, type?: "success" | "error") => void
) {
  try {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
    });

    const marginX = 20;
    let y = 22;

    // ENCABEZADO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(90, 100, 110);

    doc.text(
      "BODEGA · INSUMOS — FICHA DE INSUMO",
      marginX,
      y
    );

    doc.setDrawColor(210, 216, 222);
    doc.line(marginX, y + 3, 190, y + 3);

    y += 14;

    // CATEGORÍA
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(120, 130, 140);

    const categoria =
      TABLA_LABEL[insumo.tabla] ?? insumo.tabla ?? "Insumo";

    doc.text(
      String(categoria).toUpperCase(),
      marginX,
      y
    );

    y += 8;

    // DESCRIPCIÓN
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(19, 27, 36);

    const descripcion = insumo.descripcion || "—";
    const descLines = doc.splitTextToSize(descripcion, 170);

    doc.text(descLines, marginX, y);

    y += descLines.length * 7 + 4;

    // CÓDIGO INTERNO
    doc.setFont("courier", "normal");
    doc.setFontSize(11);
    doc.setTextColor(80, 90, 100);

    doc.text(
      `Código interno: ${insumo.codigoInterno || "—"}`,
      marginX,
      y
    );

    y += 10;

    // CÓDIGO DE BARRAS
    if (insumo.codigoBarras) {
      const png = await generarBarcodePng(
        String(insumo.codigoBarras)
      );

      doc.addImage(
        png,
        "PNG",
        marginX,
        y,
        90,
        27
      );

      y += 37;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(150, 60, 50);

      doc.text(
        "Sin código de barras asignado",
        marginX,
        y
      );

      y += 12;
    }

    // SEPARADOR
    doc.setDrawColor(220, 224, 228);
    doc.line(marginX, y, 190, y);

    y += 10;

    // DATOS
    const filas: Array<[string, string]> = [
      ["Stock", formatNum(insumo.stock)],
      ["Recepción", formatNum(insumo.recepcion)],
    ];

    if (insumo.stockPiso !== undefined) {
      filas.push([
        "Stock Piso",
        formatNum(insumo.stockPiso),
      ]);
    }

    if (insumo.stockMinimo !== undefined) {
      filas.push([
        "Stock Mínimo",
        formatNum(insumo.stockMinimo),
      ]);
    }

    if (insumo.proveedor) {
      filas.push([
        "Proveedor",
        String(insumo.proveedor),
      ]);
    }

    if (insumo.nombreProveedor) {
      filas.push([
        "Nombre Proveedor",
        String(insumo.nombreProveedor),
      ]);
    }

    if (insumo.codigoProveedor) {
      filas.push([
        "Código Proveedor",
        String(insumo.codigoProveedor),
      ]);
    }

    doc.setFontSize(11);

    for (const [k, v] of filas) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(90, 100, 110);

      doc.text(k, marginX, y);

      doc.setFont("courier", "bold");
      doc.setTextColor(19, 27, 36);

      const valor = doc.splitTextToSize(v, 110);

      doc.text(valor, marginX + 60, y);

      y += Math.max(8, valor.length * 6);
    }

    // PIE
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(150, 158, 166);

    doc.text(
      `Generado el ${new Date().toLocaleString("es-AR")} desde el Panel de Control de Insumos`,
      marginX,
      287
    );

    // NOMBRE DEL ARCHIVO
    const codigoArchivo =
      insumo.codigoInterno || insumo.id || "insumo";

    const filename = `ficha-${codigoArchivo}.pdf`;

    // GENERAR PDF
    const blob = doc.output("blob");

    // INTENTAR ABRIR EN NUEVA PESTAÑA
    const blobUrl = URL.createObjectURL(blob);

    const nuevaVentana = window.open(
      blobUrl,
      "_blank"
    );

    if (nuevaVentana) {
      notify(
        "Ficha PDF generada correctamente. Desde la nueva pestaña podés imprimirla o guardarla."
      );

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);

      return;
    }

    // SI EL NAVEGADOR BLOQUEA LA PESTAÑA,
    // DESCARGAR DIRECTAMENTE
    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);

    notify(
      "El PDF fue generado y descargado. Revisá la carpeta Descargas."
    );

  } catch (error) {
    console.error("Error generando PDF:", error);

    const mensaje =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    notify(
      `No se pudo generar el PDF: ${mensaje}`,
      "error"
    );
  }
}