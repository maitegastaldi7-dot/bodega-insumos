import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

/**
 * Cliente de Supabase del backend, conectado al proyecto REAL indicado por
 * el usuario (no se crea ni recrea ninguna base de datos).
 *
 * Usa la Publishable Key (rol "anon" ante Postgres) — nunca la secret key /
 * service_role key. Esto significa que todo lo que este cliente pueda leer
 * o escribir depende de las políticas RLS configuradas en cada tabla dentro
 * de Supabase. Si una consulta devuelve vacío o un error de permisos, hay
 * que revisar/crear la política RLS correspondiente en el proyecto real.
 */
export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: { persistSession: false },
});
