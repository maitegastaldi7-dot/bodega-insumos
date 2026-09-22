/**
 * Clasificación de errores al hablar con Supabase, para poder distinguir
 * (tal como pidió el usuario) entre: conexión/red, URL mal formada,
 * autenticación (key inválida) y políticas RLS — en vez de mostrar siempre
 * el mismo mensaje genérico.
 */

export type CategoriaErrorSupabase =
  | "conexion"       // DNS, red, TLS, timeout: nunca llegó una respuesta HTTP
  | "url_invalida"   // el Project URL no tiene forma de URL válida
  | "autenticacion"  // la Publishable Key es inválida/expiró (401)
  | "permisos_rls"   // la key es válida pero RLS/privilegios bloquean la operación
  | "tabla_no_existe"// el nombre de tabla no existe en ese schema
  | "desconocido";

export class SupabaseQueryError extends Error {
  categoria: CategoriaErrorSupabase;
  detalle?: string;
  httpStatus: number;

  constructor(categoria: CategoriaErrorSupabase, mensaje: string, detalle?: string, httpStatus = 502) {
    super(mensaje);
    this.categoria = categoria;
    this.detalle = detalle;
    this.httpStatus = httpStatus;
  }
}

interface PostgrestLikeError {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

/**
 * `error` puede ser: (a) un PostgrestError que Supabase devuelve en `{ data, error }`
 * cuando SÍ hubo respuesta HTTP (típicamente RLS, tabla inexistente, sintaxis), o
 * (b) una excepción JS lanzada por `fetch` cuando NUNCA hubo respuesta HTTP
 * (DNS, red caída, TLS) — que es el caso de "TypeError: Failed to fetch".
 */
export function clasificarErrorSupabase(error: unknown, contexto: { tabla?: string; operacion: string }): SupabaseQueryError {
  // Caso (b): excepción de red/fetch antes de recibir cualquier respuesta HTTP.
  if (error instanceof TypeError || (error instanceof Error && /fetch failed/i.test(error.message))) {
    const causa = (error as Error & { cause?: { code?: string } }).cause;
    const codigoRed = causa?.code;
    let detalle = `No se pudo establecer conexión con Supabase al ${contexto.operacion}.`;
    if (codigoRed === "ENOTFOUND") detalle = "El dominio del Project URL no resuelve (DNS). Revisá que la URL sea exactamente la de tu proyecto.";
    else if (codigoRed === "ECONNREFUSED") detalle = "La conexión fue rechazada por el servidor. Revisá el Project URL.";
    else if (codigoRed === "ETIMEDOUT" || codigoRed === "ECONNRESET") detalle = "La conexión se cortó o superó el tiempo de espera. Puede ser una red intermitente.";
    return new SupabaseQueryError("conexion", "No hay conexión con Supabase (falla de red antes de recibir respuesta).", `${detalle}${codigoRed ? ` (código de red: ${codigoRed})` : ""}`, 502);
  }

  const pgErr = error as PostgrestLikeError;
  const code = pgErr?.code;
  const message = pgErr?.message ?? String(error);

  // JWT / API key inválida o vencida
  if (code === "PGRST301" || /invalid api key|jwt/i.test(message)) {
    return new SupabaseQueryError("autenticacion", "La Publishable Key fue rechazada por Supabase.", message, 401);
  }

  // Falta de permisos: RLS habilitado sin política para el rol anon, o privilegios insuficientes
  if (code === "42501" || /permission denied|row-level security/i.test(message)) {
    return new SupabaseQueryError(
      "permisos_rls",
      `Supabase rechazó la operación por permisos (RLS) en "${contexto.tabla ?? "?"}".`,
      `${message} — revisá que exista una política RLS para el rol "anon" que permita ${contexto.operacion} en esta tabla.`,
      403
    );
  }

  // Tabla/relación inexistente: nombre mal escrito o no está en el schema public
  if (code === "42P01" || code === "PGRST205" || /does not exist|could not find the table/i.test(message)) {
    return new SupabaseQueryError(
      "tabla_no_existe",
      `La tabla "${contexto.tabla ?? "?"}" no existe (o no es visible) en tu proyecto Supabase.`,
      message,
      404
    );
  }

  return new SupabaseQueryError("desconocido", `Error inesperado de Supabase al ${contexto.operacion}.`, message, 500);
}
