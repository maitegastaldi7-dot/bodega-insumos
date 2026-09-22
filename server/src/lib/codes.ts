/** Normaliza un código: recorta espacios, saca asteriscos decorativos
 * (delimitador visual de Code 39 en el Excel original) y pasa a mayúsculas. */
export function normalizeCode(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).trim().replace(/^\*+|\*+$/g, "").trim().toUpperCase();
}
